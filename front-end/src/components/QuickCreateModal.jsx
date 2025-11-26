// front-end/src/components/QuickCreateModal.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const INTEREST_OPTIONS = [
  "Nature & Peaceful",
  "Adventure / Hiking",
  "Famous Attractions",
  "Culture & Heritage",
  "Beaches",
  "Food & Markets",
  "Wildlife",
  "Religious",
  "Shopping"
];

export default function QuickCreateModal({ open = false, onClose = () => {}, onCreate = () => {} }) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      // reset after close
      setDestination("");
      setDays(3);
      setAdults(2);
      setChildren(0);
      setBudget("");
      setNotes("");
      setInterests([]);
      setLoading(false);
    }
  }, [open]);

  function toggleInterest(opt) {
    setInterests(prev => prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt]);
  }

  async function submit(e) {
    e.preventDefault();
    if (!destination.trim()) {
      alert("Please enter a destination");
      return;
    }
    const payload = {
      destination: destination.trim(),
      days: Number(days) || 3,
      adults: Number(adults) || 1,
      children: Number(children) || 0,
      budget: budget ? Number(budget) : undefined,
      notes: notes || "",
      interests,
    };
    setLoading(true);
    try {
      await onCreate(payload);
    } catch (err) {
      console.error("Quick create error:", err);
      alert("Failed to create itinerary.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.form onSubmit={submit} initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.18 }} className="relative z-50 w-full max-w-2xl rounded-2xl bg-white/6 p-6 backdrop-blur-md ring-1 ring-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Create an itinerary</h3>
          <button type="button" onClick={onClose} className="text-white/80">✕</button>
        </div>

        <label className="block text-sm mb-1 text-white/80">Destination</label>
        <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Manali, India" className="mb-3 w-full rounded-md bg-white text-black px-3 py-2" />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-sm text-white/80">Days</label>
            <input type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} className="w-full rounded-md bg-white text-black px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-white/80">Budget (₹)</label>
            <input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full rounded-md bg-white text-black px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-sm text-white/80">Adults</label>
            <input type="number" min="1" value={adults} onChange={(e) => setAdults(e.target.value)} className="w-full rounded-md bg-white text-black px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-white/80">Children</label>
            <input type="number" min="0" value={children} onChange={(e) => setChildren(e.target.value)} className="w-full rounded-md bg-white text-black px-3 py-2" />
          </div>
        </div>

        <div className="mb-3">
          <div className="text-sm text-white/80 mb-2">Interests (pick 1–3)</div>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map(opt => {
              const active = interests.includes(opt);
              return (
                <button type="button" key={opt} onClick={() => toggleInterest(opt)} className={`text-xs px-3 py-1 rounded-full ${active ? "bg-amber-400 text-black" : "bg-white/6 text-white"}`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block text-sm mb-1 text-white/80">Notes (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mb-4 w-full rounded-md bg-white text-black px-3 py-2" rows={3} />

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-white/6 text-white">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-amber-400 text-black font-semibold">
            {loading ? "Generating..." : "Generate itinerary"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
