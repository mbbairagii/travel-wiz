// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingAuth from "./LandingAuth";
import Dashboard from "./pages/Dashboard";
import ItineraryPage from "./pages/Itinerary";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingAuth />} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/itinerary/:id" element={<RequireAuth><ItineraryPage /></RequireAuth>} />
    </Routes>
  );
}
