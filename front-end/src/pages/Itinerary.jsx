// front-end/src/pages/Itinerary.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import DayCard from "../components/DayCard";
import MapView from "../components/MapView";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { apiFetch } from "../utils/api";

export default function ItineraryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState("");

  // ----- Handlers (View / Save / Export / Share) -----

  // open OSM link for a place: opens new tab centered at lat/lon
  function handleViewPlace(place) {
    if (!place?.lat || !place?.lon) {
      // fallback: open OSM search for name
      const q = encodeURIComponent(place?.name || itinerary?.destination || itinerary?.title || "");
      window.open(`https://www.openstreetmap.org/search?query=${q}`, "_blank");
      return;
    }
    window.open(
      `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=17/${place.lat}/${place.lon}`,
      "_blank"
    );
  }

  // save place to server (creates a "saved place" record). optimistic UI + toast
  async function handleSavePlace(place) {
    try {
      const payload = {
        place,
        itineraryId: itinerary?._id || itinerary?.id || null,
      };
      const res = await apiFetch("/api/saved-places", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save place");
      }
      alert(`Saved "${place.name || "place"}"`);
    } catch (err) {
      console.error(err);
      alert("Save failed: " + (err.message || ""));
    }
  }

  // Export page area to PDF (captures the main content)
  async function exportItineraryPDF() {
    try {
      const el = document.querySelector("#itinerary-root"); // ensure root id exists
      if (!el) {
        alert("Export failed: page area not found");
        return;
      }
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      // cover multiple pages if needed (simple single-page approach)
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${(itinerary?.title || "itinerary").replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("Export PDF error:", err);
      alert("Export failed: " + (err.message || ""));
    }
  }

  // share itinerary via Web Share API with clipboard fallback
  async function shareItinerary() {
    if (!itinerary) return;
    const url = window.location.href;
    const text = `${itinerary.title || "My itinerary"} — ${itinerary.excerpt || ""}\n${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: itinerary.title || "Itinerary", text, url });
      } catch (err) {
        console.log("Share canceled or failed", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard");
      } catch {
        prompt("Copy this link:", url);
      }
    }
  }

  // ----- Load itinerary -----
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/itineraries/${id}`);
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            navigate("/", { replace: true });
            return;
          }
          if (res.status === 404) {
            setError("Itinerary not found.");
            setLoading(false);
            return;
          }
          throw new Error("Failed to load itinerary");
        }
        const data = await res.json();

        // if detailed schedule missing, synthesize a simple one (backwards compatibility)
        if (!data.data || !Array.isArray(data.data.days) || data.data.days.length === 0) {
          const days = Number(data.days) || 3;
          const generatedDays = Array.from({ length: days }).map((_, i) => ({
            day: i + 1,
            title: `Day ${i + 1} — ${data.destination || data.title || "Explore"}`,
            highlights: [
              i === 0 ? "Arrival & local stroll" : "Guided sightseeing",
              "Local food experience",
              "Relax / sunset spot",
            ],
            hours: [
              { time: "09:00", activity: "Breakfast & depart" },
              { time: "11:00", activity: "Main attraction / hike" },
              { time: "15:00", activity: "Lunch & free time" },
              { time: "18:00", activity: "Dinner & relax" },
            ],
          }));
          data.data = { days: generatedDays };
        }

        if (!mounted) return;
        setItinerary(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load itinerary");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [id, navigate]);

  // ----- Flatten POIs for MapView (memoized) -----
  const flattenedPlaces = useMemo(() => {
    if (!itinerary?.data?.days) return [];
    const flat = [];
    itinerary.data.days.forEach((d) => {
      // generator schema: d.places
      if (Array.isArray(d.places)) {
        d.places.forEach((p, idx) => {
          // ensure lat/lon number fields exist; some items use 'lon' vs 'lng'
          const lat = p.lat ?? p.latitude ?? p.lat;
          const lon = p.lon ?? p.longitude ?? p.lng ?? p.lon;
          const normalized = {
            ...p,
            lat: lat ? Number(lat) : undefined,
            lon: lon ? Number(lon) : undefined,
            // keep estimated_time as 'time' for consistency
            time: p.estimated_time || p.time || null,
          };
          flat.push(normalized);
        });
      } else if (Array.isArray(d.hours)) {
        // optional: convert hours items to lightweight placeholders (skip lat/lon)
        // skip adding to map unless lat/lon exists
      }
    });
    return flat;
  }, [itinerary]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-white/70">Loading itinerary…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="max-w-4xl mx-auto p-6">
          <h2 className="text-2xl font-semibold mb-2">Error</h2>
          <p className="text-white/70 mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="px-3 py-2 rounded bg-white text-black">Go back</button>
        </main>
      </div>
    );
  }

  const stats = {
    days: itinerary.days || (itinerary.data?.days?.length ?? 0),
    budget: itinerary.budget ?? "—",
    adults: itinerary.adults ?? 1,
    children: itinerary.children ?? 0,
    interests: itinerary.interests ?? [],
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#000000,_#071018)] text-white pb-20">
      <Navbar />
      {/* top-level root for PDF capture */}
      <main id="itinerary-root" className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white/6 rounded-2xl p-6 border border-white/6 sticky top-6">
              <h1 className="text-2xl font-semibold">{itinerary.title || itinerary.destination || "Your Trip"}</h1>
              <p className="mt-2 text-white/70 text-sm">{itinerary.excerpt || `${stats.days} days • ₹${stats.budget}`}</p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/70">Days</div>
                  <div className="text-sm font-semibold">{stats.days}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/70">Budget</div>
                  <div className="text-sm font-semibold">₹{stats.budget}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/70">Group</div>
                  <div className="text-sm font-semibold">{stats.adults} adults{stats.children ? ` • ${stats.children} children` : ""}</div>
                </div>

                <div className="mt-2">
                  <div className="text-sm text-white/70 mb-1">Interests</div>
                  <div className="flex flex-wrap gap-2">
                    {stats.interests.length ? stats.interests.map((it) => (
                      <span key={it} className="text-xs bg-amber-400 text-black px-2 py-1 rounded-full">{it}</span>
                    )) : <span className="text-xs bg-white/6 px-2 py-1 rounded-full">General</span>}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button onClick={exportItineraryPDF} className="flex-1 py-2 rounded bg-white text-black font-medium">Export PDF</button>
                <button onClick={shareItinerary} className="py-2 px-3 rounded border border-white/20 text-white">Share</button>
              </div>
            </div>

            {itinerary.notes && (
              <div className="bg-white/4 rounded-2xl p-4 mt-4 border border-white/6">
                <div className="text-sm text-white/80 font-medium mb-2">Notes</div>
                <div className="text-sm text-white/70 italic">{itinerary.notes}</div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Day-by-day plan</h2>
              <div className="text-sm text-white/70">{stats.days} days</div>
            </div>

            {itinerary.data.days.map((d) => (
              <DayCard key={d.day} day={d} onViewPlace={handleViewPlace} onSavePlace={handleSavePlace} />
            ))}

            <div className="bg-white/6 rounded-2xl p-6 border border-white/6">
              <div className="text-sm text-white/70 mb-3">Map</div>

              {/* MapView: displays POIs and wires popup actions to handlers */}
              <MapView
                places={flattenedPlaces}
                onView={(place) => handleViewPlace(place)}
                onSave={(place) => handleSavePlace(place)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
