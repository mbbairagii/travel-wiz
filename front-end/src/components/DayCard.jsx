// front-end/src/components/DayCard.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function DayCard({ day, onViewPlace = () => { }, onSavePlace = () => { } }) {
  const [savingId, setSavingId] = useState(null); // id of place being saved (for disabling)

  const title = day.title || `Day ${day.day || "?"}`;

  const hasPlaces = Array.isArray(day.places) && day.places.length > 0;
  const hasHours = Array.isArray(day.hours) && day.hours.length > 0;
  const hasHighlights = Array.isArray(day.highlights) && day.highlights.length > 0;

  async function handleSave(p) {
    try {
      setSavingId(p.place_id || p.id || `${p.name}-${Math.random()}`);
      await onSavePlace(p);
    } catch (err) {
      // delegate error handling to parent; keep simple here
      console.error("Save place failed", err);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="rounded-2xl p-6 border border-white/10 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/MP5.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(0,0,0,0.55)",   // subtle dark overlay for readability
      }}

    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white/60">Day {day.day}</div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {hasHighlights && (
            <p className="text-white/70 mt-2 text-sm">{day.highlights.join(" • ")}</p>
          )}
        </div>

        <div className="text-right text-sm text-white/60">
          <div className="mb-2">Est. highlights</div>
          <div className="text-xs">
            {hasPlaces ? `${day.places.length} stops` : hasHours ? `${day.hours.length} activities` : "—"}
          </div>
        </div>
      </div>

      {/* Render places (new generator schema) */}
      {hasPlaces && (
        <div className="mt-4 space-y-3">
          {day.places.map((p, idx) => {
            const placeKey = p.place_id || p.id || `${idx}-${p.name}`;
            const isSaving = savingId && savingId === placeKey;
            return (
              <div key={placeKey} className="flex items-start gap-3">
                <div className="min-w-[84px]">
                  <div className="text-xs text-white/70">{p.estimated_time || p.time || "—"}</div>
                  <div className="text-[11px] text-white/50">{p.duration_mins ? `${p.duration_mins} min` : ""}</div>
                </div>

                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{p.name || p.title || "Untitled place"}</div>
                  {p.address && <div className="text-xs text-white/70 mt-1">{p.address}</div>}
                  {p.description && <div className="text-xs text-white/60 mt-1">{p.description}</div>}

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => onViewPlace(p)}
                      className="text-xs px-3 py-1 rounded bg-white text-black"
                      aria-label={`View ${p.name || "place"}`}
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleSave({ ...p, id: placeKey })}
                      disabled={isSaving}
                      className={`text-xs px-3 py-1 rounded border border-white/20 ${isSaving ? "opacity-60" : "text-white"}`}
                      aria-label={`Save ${p.name || "place"}`}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Render hours (older schema) */}
      {!hasPlaces && hasHours && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {day.hours.map((h, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="min-w-[72px] text-xs text-white/70">{h.time}</div>
              <div className="text-sm text-white/80">{h.activity}</div>
            </div>
          ))}
        </div>
      )}
    </motion.article>
  );
}
