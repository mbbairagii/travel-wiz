// back-end/routes/chat.js
// CommonJS, rule-based free chatbot (no external API)
const express = require("express");
const router = express.Router();

// Optional fuzzy helper (install if you want better matching)
// npm install string-similarity
let strSim;
try {
  strSim = require("string-similarity");
} catch (e) {
  strSim = null;
}

// A small dataset of canned replies. Expand as JSON or DB later.
const DB = {
  jaipur: {
    best_places:
      "Top Jaipur: Amer Fort (sunset view), City Palace, Hawa Mahal, Jantar Mantar, Jal Mahal. Best time: Oct–Mar. Tip: Start early to beat heat and take a guided tour at Amer Fort.",
    food:
      "Jaipur food must-tries: Dal Baati Churma, Laal Maas, Ghevar (sweet), kachori. Try the old-city street stalls and traditional Rajasthani thalis.",
    itinerary_2days:
      "2-day Jaipur: Day 1 — City Palace, Jantar Mantar, Hawa Mahal, local markets. Day 2 — Amer Fort (morning), Jaigarh/Fort view, lunch, Jaipur bazaars.",
  },
  goa: {
    best_places:
      "Top Goa: Baga & Calangute (lively beaches), Anjuna (market), Old Goa (churches), Palolem (quiet southern beach). Best time: Nov–Feb. Tip: Rent a scooter to explore hidden bays.",
    food:
      "Goa food: Goan fish curry, vindaloo, bebinca (dessert). Visit beach shacks for fresh seafood and local toddy shops for authenticity.",
    itinerary_3days:
      "3-day Goa: Day 1 — North beaches & nightlife. Day 2 — Old Goa + Panaji + Dona Paula. Day 3 — South Goa beaches and relaxation.",
  },
  default: {
    best_places:
      "Tell me the city (e.g. Jaipur, Goa, Manali) and I’ll suggest top places. General tip: pick 2–3 highlights per day to avoid rushing.",
    food:
      "Tell me the city and I'll share local food recommendations. General tip: try regional specialties, visit local markets for authentic eats.",
    best_time:
      "Best time depends on the destination — coastal areas are great Nov–Feb, mountains Apr–Jun and Sep–Nov. Tell me the city for specifics.",
    itinerary:
      "Mention how many days and the city (eg. '2 days in Jaipur') and I will suggest a short itinerary.",
  },
};

// small synonyms / intent keywords
const INTENTS = {
  best_places: ["best places", "top places", "what to see", "places to visit", "best of", "highlights"],
  food: ["food", "eat", "where to eat", "local cuisine", "restaurants"],
  itinerary: ["itinerary", "plan", "days", "trip", "schedule"],
  best_time: ["best time", "when to visit", "when is best"],
};

// small list of known cities (keys of DB except default)
const KNOWN_CITIES = Object.keys(DB).filter((k) => k !== "default");

// helper: detect intent by scanning for keyword matches
function detectIntent(text) {
  const t = text.toLowerCase();
  for (const intent of Object.keys(INTENTS)) {
    for (const kw of INTENTS[intent]) {
      if (t.includes(kw)) return intent;
    }
  }
  // fallback: if includes numbers like "2 days" or "3 day"
  if (/\b\d+\s*days?\b/.test(t)) return "itinerary";
  return null;
}

// helper: find city by substring or fuzzy match
function detectCity(text) {
  const t = text.toLowerCase();
  // exact substring match
  for (const city of KNOWN_CITIES) {
    if (t.includes(city)) return city;
  }
  // optional fuzzy matching if string-similarity installed
  if (strSim) {
    const choices = KNOWN_CITIES;
    const res = strSim.findBestMatch(text, choices);
    if (res.bestMatch.rating > 0.4) return res.bestMatch.target;
  }
  return null;
}

// helper: pick response from DB
function getResponse(city, intent, originalText) {
  if (city && DB[city]) {
    // pick the specific intent if present, else try to synthesize
    const cityData = DB[city];
    if (intent && cityData[intent]) return cityData[intent];
    // if user asked for itinerary with days, detect days and pick a canned itinerary if exists
    if (intent === "itinerary") {
      // look for "2 day", "3 day" etc.
      const m = originalText.match(/\b(\d+)\s*days?\b/);
      if (m) {
        const dd = m[1];
        const key = `itinerary_${dd}days` || `itinerary_${dd}day`;
        if (cityData[key]) return cityData[key];
      }
    }
    // fallback to best_places if available
    if (cityData.best_places) return cityData.best_places;
  }

  // default DB
  if (intent && DB.default[intent]) return DB.default[intent];

  // final generic fallback
  return DB.default.best_places;
}

// route
router.post("/", (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Missing message" });
    }

    const intent = detectIntent(message) || "best_places";
    const city = detectCity(message); // may be null

    const reply = getResponse(city, intent, message);

    // small personalization: if city found, prefix the city name
    const prefix = city ? `Here you go — ${city.charAt(0).toUpperCase() + city.slice(1)}:\n\n` : "";
    return res.json({ reply: prefix + reply });
  } catch (err) {
    console.error("Chat rule error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
