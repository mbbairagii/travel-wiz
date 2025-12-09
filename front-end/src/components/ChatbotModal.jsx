// src/components/ChatbotModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "../utils/api";

export default function ChatbotModal({ open, onClose }) {
    const [messages, setMessages] = useState([
        { id: 0, role: "assistant", text: "Hello! I'm your AI travel guide. How can I help today?" },
    ]);

    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);

    const listRef = useRef(null);
    const inputRef = useRef(null);

    // Autofocus when opened
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Autoscroll
    useEffect(() => {
        listRef.current?.scrollTo({
            top: listRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    if (!open) return null;

    async function sendMessage(e) {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;

        const userMsg = {
            id: Date.now(),
            role: "user",
            text,
        };

        setMessages((m) => [...m, userMsg]);
        setInput("");
        setSending(true);

        try {
            const res = await apiFetch("/api/chat", {
                method: "POST",
                body: JSON.stringify({ message: text }),
            });

            const data = await res.json();

            const botMsg = {
                id: Date.now() + 1,
                role: "assistant",
                text: data.reply || "I'm not sure how to answer that, but I'm learning!",
            };

            setMessages((m) => [...m, botMsg]);
        } catch (err) {
            setMessages((m) => [
                ...m,
                { id: Date.now() + 2, role: "assistant", text: "Error contacting server." },
            ]);
        }

        setSending(false);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
        >
            {/* BACKDROP */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>

            {/* MODAL */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-50 w-full max-w-2xl max-h-[80vh] rounded-2xl bg-neutral-900/95 backdrop-blur-md shadow-2xl flex flex-col border border-white/10"
            >
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-white font-semibold text-lg">Explore AI ✨</h2>

                    <button
                        className="text-white/80 hover:text-white px-3 py-1 rounded"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                {/* MESSAGES */}
                <div
                    ref={listRef}
                    className="flex-1 overflow-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10"
                >
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`max-w-[80%] ${msg.role === "user" ? "ml-auto text-right" : "mr-auto text-left"
                                }`}
                        >
                            <div
                                className={`px-4 py-2 rounded-xl ${msg.role === "user"
                                        ? "bg-white text-black"
                                        : "bg-white/10 text-white"
                                    }`}
                            >
                                {msg.text}
                            </div>
                            <div className="text-xs text-white/50 mt-1">
                                {msg.role === "user" ? "You" : "AI"}
                            </div>
                        </div>
                    ))}

                    {sending && (
                        <div className="mr-auto text-left">
                            <div className="px-4 py-2 rounded-xl bg-white/10 text-white">
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>

                {/* INPUT */}
                <form
                    onSubmit={sendMessage}
                    className="p-4 border-t border-white/10 bg-black/30"
                >
                    <div className="flex gap-3">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about any place, itinerary ideas, best time to visit..."
                            className="flex-1 rounded-full bg-white/10 text-white px-4 py-2 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />

                        <button
                            disabled={sending}
                            className="rounded-full bg-amber-400 text-black px-4 py-2 font-semibold disabled:opacity-60"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
