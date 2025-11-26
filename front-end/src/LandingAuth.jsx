// LandingAuth.jsx
import "./index.css";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "./utils/api";

export default function LandingAuth({ heading = "Travel made easy for unforgettable days outside" }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const loginEmailRef = useRef(null);
  const signupNameRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const modalOpen = showLogin || showSignup;
    document.body.classList.toggle("overflow-hidden", modalOpen);

    function onKey(e) {
      if (e.key === "Escape") {
        setShowLogin(false);
        setShowSignup(false);
      }
    }
    if (modalOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showLogin, showSignup]);

  useEffect(() => {
    if (showLogin) {
      setMessage("");
      setTimeout(() => loginEmailRef.current?.focus(), 0);
    }
    if (showSignup) {
      setMessage("");
      setTimeout(() => signupNameRef.current?.focus(), 0);
    }
  }, [showLogin, showSignup]);

  // Parallax: efficient RAF-based transform
  useEffect(() => {
    let rafId = null;
    let lastScroll = window.scrollY || 0;

    function onScroll() {
      lastScroll = window.scrollY || window.pageYOffset;
      if (!rafId) rafId = requestAnimationFrame(update);
    }

    function update() {
      const y = lastScroll * 0.12; // adjust multiplier for strength
      if (videoRef.current) {
        videoRef.current.style.transform = `translateY(${y}px) scale(1.04)`;
      }
      rafId = null;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    // initialize
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      localStorage.setItem("token", data.token);
      setMessage("Signup successful. Redirecting...");
      setTimeout(() => (window.location.href = "/dashboard"), 600);
    } catch (err) {
      setMessage(err.message || "Signup error");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      setMessage("Login successful!");
      setTimeout(() => (window.location.href = "/dashboard"), 300);
    } catch (err) {
      setMessage(err.message || "Login error");
    } finally {
      setLoading(false);
    }
  }

  function stop(e) {
    e.stopPropagation();
  }

  // Framer Motion variants
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.12 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <div className="relative min-h-screen min-w-screen bg-black text-white">
      {/* Thin promo/top bar */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="bg-[#2b1606] text-xs text-white/90 text-center py-1">
          Your AI-powered travel planner ! TRY NOW !!!
        </div>
      </div>

      {/* Background video (parallax transforms applied via JS) */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-center will-change-transform"
        src="/MP1.mp4"
        poster="/video-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      {/* Warm overlay gradient for the cinematic look */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />

      {/* Header with centered logo */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 max-w-6xl mx-auto">
        {/* center logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <img src="/MP1.png" alt="TRAVEL-WIZ" className="h-12 w-auto" />
        </div>

        {/* right actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSignup(true)}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:shadow-md transition"
          >
            Sign up
          </button>
          <button
            onClick={() => setShowLogin(true)}
            className="rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-white hover:bg-white/6 transition"
          >
            Login
          </button>
        </div>
      </header>

      {/* Main hero */}
      <main className="relative z-20 flex items-center justify-center min-h-screen px-6">
        <div className="mx-auto w-full max-w-5xl py-36 text-center">
          <motion.div initial="hidden" animate="show" variants={container}>
            <motion.h1
              variants={fadeUp}
              className="font-serif text-4xl sm:text-5xl md:text-7xl leading-tight md:leading-[0.95] text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)]"
            >
              {heading}
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-2xl mx-auto text-lg text-white/85">
              Instant itineraries, real-time suggestions, and everything you need for your next escape.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex items-center justify-center gap-4">
              <motion.a
                href="#shop1"
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-black shadow-lg hover:scale-[1.02] transition-transform"
              >
                Build Itinerary
              </motion.a>

              <motion.a
                href="#shop2"
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-full border border-white px-6 py-3 text-base font-semibold text-white hover:bg-white/6 transition"
              >
                Browse Destinations
              </motion.a>
            </motion.div>

            {message && (
              <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-white/90">
                {message}
              </motion.p>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer small */}
      <footer className="absolute bottom-6 left-0 right-0 z-20 text-center text-white/70 text-sm">
        © 2025 TRAVEL-WIZ — Smart itineraries for modern explorers. BUILT WITH ❤️ .
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-title"
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowLogin(false)} />

          <form
            onClick={stop}
            onSubmit={handleLogin}
            className="relative z-50 w-full max-w-md rounded-2xl bg-white/6 p-6 backdrop-blur-md ring-1 ring-white/10 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <h2 id="login-title" className="mb-4 text-lg font-semibold text-white">
                Login
              </h2>
              <button
                type="button"
                aria-label="Close login dialog"
                onClick={() => setShowLogin(false)}
                className="ml-2 rounded p-1 text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <label htmlFor="login-email" className="block mb-2 text-sm text-white/80">
              Email
            </label>
            <input
              id="login-email"
              ref={loginEmailRef}
              className="mb-3 w-full rounded-md bg-white text-black px-3 py-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />

            <label htmlFor="login-password" className="block mb-2 text-sm text-white/80">
              Password
            </label>
            <input
              id="login-password"
              className="mb-4 w-full rounded-md bg-white text-black px-3 py-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="rounded bg-white px-4 py-2 font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Loading..." : "Login"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowLogin(false);
                  setShowSignup(true);
                }}
                className="text-sm text-white/90 underline"
              >
                Create an account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-title"
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowSignup(false)} />

          <form
            onClick={stop}
            onSubmit={handleSignup}
            className="relative z-50 w-full max-w-md rounded-2xl bg-white/6 p-6 backdrop-blur-md ring-1 ring-white/10 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <h2 id="signup-title" className="mb-4 text-lg font-semibold text-white">
                Sign up
              </h2>
              <button
                type="button"
                aria-label="Close signup dialog"
                onClick={() => setShowSignup(false)}
                className="ml-2 rounded p-1 text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <label htmlFor="signup-name" className="block mb-2 text-sm text-white/80">
              Name
            </label>
            <input
              id="signup-name"
              ref={signupNameRef}
              className="mb-3 w-full rounded-md bg-white text-black px-3 py-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              required
            />

            <label htmlFor="signup-email" className="block mb-2 text-sm text-white/80">
              Email
            </label>
            <input
              id="signup-email"
              className="mb-3 w-full rounded-md bg-white text-black px-3 py-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />

            <label htmlFor="signup-password" className="block mb-2 text-sm text-white/80">
              Password
            </label>
            <input
              id="signup-password"
              className="mb-4 w-full rounded-md bg-white text-black px-3 py-2 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="rounded bg-white px-4 py-2 font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Loading..." : "Create account"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSignup(false);
                  setShowLogin(true);
                }}
                className="text-sm text-white/90 underline"
              >
                Already have an account?
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
