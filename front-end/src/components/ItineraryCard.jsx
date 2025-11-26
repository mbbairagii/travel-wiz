// src/components/ItineraryCard.jsx
import React from "react";
import { motion } from "framer-motion";

export default function ItineraryCard({ data, onView, onRegenerate, onDelete }) {
  const { id, title, days, budget, thumbnail, createdAt, excerpt, adults, children, travelType, accommodation, interests, notes } = data;

  return (
    <motion.article
      whileHover={{ translateY: -6, boxShadow: "0 12px 30px rgba(0,0,0,0.45)" }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="group bg-gradient-to-b from-white/4 to-white/2 border border-white/6 rounded-2xl p-4 flex gap-4 items-start"
    >
      <img src={thumbnail || "/placeholder-trip.jpg"} alt={title} className="w-32 h-24 rounded-lg object-cover flex-shrink-0 shadow-sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-white text-lg font-semibold truncate">{title}</h3>
            <p className="text-white/75 text-sm mt-1">
              {days} day{days > 1 ? "s" : ""} • ₹{budget}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-white/50">{new Date(createdAt).toLocaleDateString()}</p>
            <div className="mt-2 text-xs text-white/60">· · ·</div>
          </div>
        </div>

        <p className="text-white/70 text-sm mt-3 line-clamp-2">{excerpt || "A short summary of the trip — highlights and travel notes."}</p>

        {/* personalization row */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <div className="text-xs text-white/70">Group:</div>
          <span className="text-xs bg-white/6 px-2 py-1 rounded-full">{adults ?? 2} adults</span>
          <span className="text-xs bg-white/6 px-2 py-1 rounded-full">{children ?? 0} children</span>

          <div className="ml-3 text-xs text-white/70">Type:</div>
          <span className="text-xs bg-white/6 px-2 py-1 rounded-full">{travelType || "Friends"}</span>

          <div className="ml-3 text-xs text-white/70">Stay:</div>
          <span className="text-xs bg-white/6 px-2 py-1 rounded-full">{accommodation || "Mid-range"}</span>

          {/* interests as badges */}
          {interests && interests.length > 0 && (
            <>
              <div className="ml-3 text-xs text-white/70">Interests:</div>
              <div className="flex gap-2 flex-wrap">
                {interests.slice(0, 4).map((it) => (
                  <span key={it} className="text-xs bg-amber-400 text-black px-2 py-1 rounded-full">{it}</span>
                ))}
                {interests.length > 4 && <span className="text-xs text-white/70 px-2">+{interests.length - 4}</span>}
              </div>
            </>
          )}
        </div>

        {notes && <p className="text-white/60 text-sm mt-2 italic">“{notes}”</p>}

        <div className="mt-4 flex items-center gap-3">
          <button onClick={() => onView(id)} className="px-3 py-1 rounded-full bg-white text-black font-medium text-sm">View</button>
          <button onClick={() => onRegenerate(id)} className="px-3 py-1 rounded-full border border-white/20 text-white text-sm hover:bg-white/6 transition">Regenerate</button>
          <button onClick={() => onDelete(id)} className="ml-auto text-sm text-white/70 hover:text-red-400 underline">Delete</button>
        </div>
      </div>
    </motion.article>
  );
}
