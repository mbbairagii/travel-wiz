// src/components/Navbar.jsx
import React from "react";

export default function Navbar({ onCreate }) {
  return (
    <header className="sticky top-4 z-40 mx-auto max-w-6xl px-6">
      <div className="backdrop-blur-md bg-gradient-to-r from-black/25 to-black/10 border border-white/6 rounded-full py-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/MP1.png" alt="logo" className="h-9 w-auto object-contain" />
          <div>
            <div className="text-sm font-medium text-white">TRAVEL-WIZ</div>
            <div className="text-xs text-white/70">Smart itineraries for explorers</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm hover:shadow-md transition"
          >
            Create itinerary
          </button>

          <button className="hidden md:inline-flex items-center text-sm text-white/85 px-3 py-2 rounded hover:bg-white/6 transition">
            <span className="sr-only">Open profile</span>
            <img src="/avatar-placeholder.png" alt="avatar" className="h-8 w-8 rounded-full object-cover" />
          </button>
        </div>
      </div>
    </header>
  );
}
