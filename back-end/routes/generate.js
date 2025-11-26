// back-end/routes/generate.js
const express = require("express");
const axios = require("axios");
const Itinerary = require("../models/Itinerary");
const auth = require("../middleware/auth");
const router = express.Router();

const INTEREST_TAG_MAP = {
  "Nature & Peaceful": ["tourism=nature_reserve", "leisure=park", "natural=peak", "natural=water"],
  "Adventure / Hiking": ["highway=path", "route=hiking", "sport=hiking"],
  "Famous Attractions": ["tourism=attraction", "historic=yes", "historic=monument"],
  "Culture & Heritage": ["tourism=museum", "amenity=theatre", "historic=castle"],
  "Beaches": ["natural=beach", "leisure=beach_resort"],
  "Food & Markets": ["amenity=restaurant", "amenity=cafe", "amenity=marketplace"],
  "Wildlife": ["tourism=wildlife_hide", "natural=wood"],
  "Religious": ["tourism=place_of_worship","amenity=place_of_worship","historic=church"],
  "Shopping": ["shop=yes", "shop=clothes", "shop=marketplace"]
};

async function geocode(destination) {
  const url = "https://nominatim.openstreetmap.org/search";
  const res = await axios.get(url, {
    params: { q: destination, format: "json", limit: 1 },
    headers: { "User-Agent": "travel-wiz/1.0 (you@yourdomain.com)" }
  });
  const first = res.data && res.data[0];
  if (!first) throw new Error("Geocoding failed — cannot find destination");
  return { lat: parseFloat(first.lat), lon: parseFloat(first.lon), display_name: first.display_name };
}

function buildOverpassQuery(tags, lat, lon, radius = 20000, limit = 100) {
  const blocks = tags.map((t) => {
    const [k, v] = t.split("=");
    return `node(around:${radius},${lat},${lon})[${k}=${v}];way(around:${radius},${lat},${lon})[${k}=${v}];relation(around:${radius},${lat},${lon})[${k}=${v}];`;
  }).join("");
  const q = `[out:json][timeout:25];
(
  ${blocks}
);
out center ${limit};`;
  return q;
}

async function queryOverpass(q) {
  const url = "https://overpass-api.de/api/interpreter";
  const res = await axios.post(url, q, {
    headers: { "Content-Type": "text/plain", "User-Agent": "travel-wiz/1.0 (you@yourdomain.com)" },
    timeout: 30000
  });
  return res.data;
}

function normalizeElement(el) {
  const tags = el.tags || {};
  const name = tags.name || tags["addr:street"] || "Unnamed place";
  const lat = el.lat ?? (el.center && el.center.lat);
  const lon = el.lon ?? (el.center && el.center.lon);
  const type = tags.tourism || tags.amenity || tags.shop || tags.natural || tags.leisure || "place";
  const addressParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
    tags["addr:postcode"],
    tags["addr:country"]
  ].filter(Boolean);
  return {
    id: `${el.type}/${el.id}`,
    osm_type: el.type,
    osm_id: el.id,
    name,
    lat,
    lon,
    address: addressParts.join(", "),
    tags,
    type
  };
}

function scoreAndPick(elements, limit = 12) {
  if (!elements || elements.length === 0) return [];
  const pois = elements.map(normalizeElement);
  pois.forEach(p => {
    let s = 0;
    if (p.name && !/Unnamed/i.test(p.name)) s += 3;
    if (p.address) s += 1;
    if (p.tags && (p.tags.tourism || p.tags.amenity || p.tags.shop)) s += 1;
    p._score = s;
  });
  pois.sort((a,b) => (b._score - a._score));
  const seen = new Set();
  const out = [];
  for (const p of pois) {
    const key = `${(p.name||"").toLowerCase()}|${Math.round((p.lat||0)*10000)}|${Math.round((p.lon||0)*10000)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

function schedulePOIs(pois, days = 3) {
  const perDay = Math.max(1, Math.ceil(pois.length / days));
  const daysArr = [];
  for (let d = 0; d < days; d++) {
    const slice = pois.slice(d*perDay, (d+1)*perDay);
    const dayObj = {
      day: d+1,
      title: `Day ${d+1}`,
      places: slice.map((p, idx) => ({
        place_id: p.id,
        name: p.name,
        lat: p.lat,
        lon: p.lon,
        address: p.address,
        estimated_time: `${9 + idx*3}:00`,
        duration_mins: 90,
        type: p.type,
        description: p.tags && (p.tags.description || p.tags["description:en"]) ? (p.tags.description || p.tags["description:en"]) : `${p.name} — a recommended stop.`,
        osm: { type: p.osm_type, id: p.osm_id }
      }))
    };
    daysArr.push(dayObj);
  }
  return daysArr;
}

router.post("/", auth, async (req, res) => {
  try {
    const { destination, days = 3, interests = [], adults = 1, children = 0, budget, notes, title } = req.body;
    if (!destination) return res.status(400).json({ message: "destination required" });

    const loc = await geocode(destination);

    const interestTags = [];
    if (Array.isArray(interests) && interests.length) {
      interests.forEach(i => {
        const tags = INTEREST_TAG_MAP[i];
        if (tags) interestTags.push(...tags);
      });
    }
    if (interestTags.length === 0) interestTags.push("tourism=attraction", "amenity=restaurant", "leisure=park");

    const overpassQl = buildOverpassQuery(interestTags, loc.lat, loc.lon, 25000, 100);
    const opRes = await queryOverpass(overpassQl);
    const elements = (opRes && opRes.elements) || [];

    const top = scoreAndPick(elements, Math.max(8, Number(days) * 3));
    const daysSchedule = schedulePOIs(top, Number(days || 3));

    const doc = await Itinerary.create({
      user: req.userId,
      title: title || `${destination} — ${days} day${days>1?"s":""}`,
      destination,
      days: Number(days),
      adults,
      children,
      budget,
      notes,
      interests,
      data: { days: daysSchedule },
      thumbnail: "",
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error("generate error:", err?.message || err);
    res.status(500).json({ message: "Generate failed", detail: err.message });
  }
});

module.exports = router;
