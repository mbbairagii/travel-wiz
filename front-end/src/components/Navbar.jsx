// src/components/Navbar.jsx
import React from "react";

/**
 * Navbar
 * Props:
 *  - onCreate: () => void   // open create itinerary
 *  - onOpenChat: () => void // open Explore AI modal
 */
export default function Navbar({ onCreate = () => {}, onOpenChat = () => {} }) {
  // quick debug: uncomment to check props
  // console.log("Navbar props:", { onCreate: !!onCreate, onOpenChat: !!onOpenChat });

  return (
    <nav className="px-6 py-4 max-w-6xl mx-auto flex items-center justify-between gap-4 relative z-20">
      {/* left: logo */}
      <div className="flex items-center gap-4">
        <a href="/" className="flex items-center gap-3">
          <img src="/MP1.png" alt="travel-wiz" className="h-10 w-auto" />
          <div className="hidden sm:block">
            <div className="text-sm font-medium">TRAVEL-WIZ</div>
            <div className="text-xs text-white/70">Smart itineraries for explorers</div>
          </div>
        </a>
      </div>

      {/* right: actions */}
      <div className="flex items-center gap-3">
        {/* Create itinerary — calls parent prop */}
        <button
          onClick={() => {
            try {
              onCreate();
            } catch (e) {
              console.error("onCreate error:", e);
            }
          }}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:shadow-md transition"
        >
          Create itinerary
        </button>

        {/* Explore AI — calls parent prop */}
        <button
          onClick={() => {
            try {
              onOpenChat();
            } catch (e) {
              console.error("onOpenChat error:", e);
            }
          }}
          className="rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-white hover:bg-white/6 transition flex items-center gap-2"
          aria-haspopup="dialog"
        >
          Explore AI
          <span className="text-xs bg-amber-400 text-black px-2 py-0.5 rounded-full">AI</span>
        </button>

        {/* optional: Login / Profile (kept simple) */}
        <a href="/profile" className="ml-2 text-sm text-white/80 hover:text-white">
          Profile
        </a>
      </div>
    </nav>
  );
}
