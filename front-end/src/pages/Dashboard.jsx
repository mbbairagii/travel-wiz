// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import ItineraryCard from "../components/ItineraryCard";
import QuickCreateModal from "../components/QuickCreateModal";
import ChatbotModal from "../components/ChatbotModal"; // <- new
import { apiFetch } from "../utils/api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [itineraries, setItineraries] = useState([]);
  const [showQuick, setShowQuick] = useState(false);
  const [showChat, setShowChat] = useState(false); // new: chatbot modal state
  const [stats, setStats] = useState({ total: 0, upcoming: 0, saved: 0 });

  useEffect(() => {
    let mounted = true;
    async function loadFromApi() {
      setLoading(true);
      try {
        const res = await apiFetch("/api/itineraries");
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/";
            return;
          }
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to load itineraries");
        }
        const data = await res.json();
        if (!mounted) return;

        const normalized = (Array.isArray(data) ? data : (data.itineraries || [])).map((it) => ({
          ...it,
          id: it._id || it.id,
        }));

        setItineraries(normalized);

        const total = normalized.length;
        const upcoming = normalized.filter((it) => it.upcoming).length || 0;
        const saved = normalized.filter((it) => it.saved).length || 0;
        setStats({ total, upcoming, saved });
      } catch (err) {
        console.error("Failed to fetch itineraries:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadFromApi();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleCreate(payload) {
    setShowQuick(false);
    try {
      const res = await apiFetch("/api/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/";
          return;
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Generation failed");
      }
      const it = await res.json();
      const normalized = { ...it, id: it._id || it.id };
      setItineraries((prev) => [normalized, ...prev]);
      setStats((s) => ({ ...s, total: s.total + 1 }));
      window.location.href = `/itinerary/${normalized.id}`;
    } catch (err) {
      console.error("Generate error:", err);
      alert("Failed to generate itinerary: " + (err.message || ""));
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this itinerary?")) return;
    try {
      const res = await apiFetch(`/api/itineraries/${id}`, { method: "DELETE" });
      if (![200, 204].includes(res.status)) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/";
          return;
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Delete failed");
      }
      setItineraries((prev) => prev.filter((it) => (it.id || it._id) !== id));
      setStats((s) => ({ ...s, total: s.total - 1 }));
    } catch (err) {
      console.error("Delete itinerary error:", err);
      alert("Failed to delete itinerary: " + (err.message || ""));
    }
  }

  function handleView(id) {
    window.location.href = `/itinerary/${id}`;
  }

  function handleRegenerate(id) {
    alert("Regenerating " + id);
  }

  return (
    <div
      className="min-h-screen relative text-white pb-20"
      style={{
        backgroundImage: `url('/MP4.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

      {/* CONTENT */}
      <div className="relative z-10">
        {/* NOTE: Navbar should accept onCreate and onOpenChat props:
            <Navbar onCreate={() => setShowQuick(true)} onOpenChat={() => setShowChat(true)} />
            Update your Navbar component accordingly. */}
        <Navbar onCreate={() => setShowQuick(true)} onOpenChat={() => setShowChat(true)} />

        <main className="max-w-6xl mx-auto px-6 mt-8 relative z-10">
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold">Welcome back, Explorer 👋</h1>
                <p className="text-white/70 mt-1">Pick up where you left off or generate a fresh plan.</p>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <div className="text-sm text-white/70">Total trips</div>
                <div className="bg-white/6 px-3 py-2 rounded-full text-black font-semibold">{stats.total}</div>
              </div>
            </div>
          </motion.section>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/6 p-4 rounded-2xl border border-white/6">
              <p className="text-sm text-white/80">Total trips</p>
              <p className="text-2xl font-semibold mt-2">{stats.total}</p>
              <p className="text-xs text-white/60 mt-1">Generated itineraries</p>
            </div>

            <div className="bg-white/6 p-4 rounded-2xl border border-white/6">
              <p className="text-sm text-white/80">Upcoming</p>
              <p className="text-2xl font-semibold mt-2">{stats.upcoming}</p>
              <p className="text-xs text-white/60 mt-1">Trips with upcoming dates</p>
            </div>

            <div className="bg-white/6 p-4 rounded-2xl border border-white/6">
              <p className="text-sm text-white/80">Saved</p>
              <p className="text-2xl font-semibold mt-2">{stats.saved}</p>
              <p className="text-xs text-white/60 mt-1">Saved itineraries</p>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent itineraries</h2>
              <div className="text-sm text-white/70">{itineraries.length} results</div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <>
                  <div className="h-28 rounded-2xl bg-white/4 animate-pulse" />
                  <div className="h-28 rounded-2xl bg-white/4 animate-pulse" />
                </>
              ) : itineraries.length === 0 ? (
                <div className="py-12 text-center text-white/70">No itineraries yet — create one to get started.</div>
              ) : (
                <div className="grid gap-4">
                  {itineraries.map((it) => (
                    <ItineraryCard
                      key={it.id}
                      data={it}
                      onView={handleView}
                      onRegenerate={handleRegenerate}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <QuickCreateModal open={showQuick} onClose={() => setShowQuick(false)} onCreate={handleCreate} />

        {/* Chatbot modal */}
        <ChatbotModal open={showChat} onClose={() => setShowChat(false)} />
      </div>
    </div>
  );
}
