// src/components/PhotoStripMaker.jsx
import React, { useRef, useState } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";

/**
 * PhotoStripMaker
 * - Upload up to 4 images
 * - Themes (Minimal, Film, Polaroid, Vintage)
 * - Add draggable/resizable/rotatable stickers (react-rnd)
 * - Export strip as PNG (html2canvas)
 *
 * Put <PhotoStripMaker /> into LandingAuth.jsx after hero.
 */

const THEMES = {
    Minimal: { container: "bg-white/90", frame: "rounded-md", caption: false, hole: false },
    Film: { container: "bg-black", frame: "rounded-none", caption: false, hole: true },
    Polaroid: { container: "bg-white", frame: "rounded-md shadow-2xl", caption: true, hole: false },
    Vintage: { container: "bg-[#f7efe3]", frame: "rounded-md", caption: true, hole: false },
};

const STICKERS = [
    { id: "heart", text: "❤️" },
    { id: "plane", text: "✈️" },
    { id: "pin", text: "📍" },
    { id: "sun", text: "🌄" },
    { id: "spark", text: "✨" },
];

const BG_IMAGE = "/assets/MP-7.jpeg"; // put in public/assets/

export default function PhotoStripMaker() {
    const [images, setImages] = useState([null, null, null, null]);
    const [theme, setTheme] = useState("Polaroid");
    const [stickers, setStickers] = useState([]); // {id, type, x,y,width,height,rotation}
    const [nextStickerId, setNextStickerId] = useState(1);
    const stripRef = useRef(null);
    const inputRefs = [useRef(), useRef(), useRef(), useRef()];

    // handle image upload -> createObjectURL used for preview
    function onFileChange(e, idx) {
        const f = e.target.files?.[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        setImages((s) => {
            const copy = [...s];
            // revoke previous if exists
            if (copy[idx] && copy[idx].objectUrl) URL.revokeObjectURL(copy[idx].objectUrl);
            copy[idx] = { objectUrl: url, name: f.name };
            return copy;
        });
    }

    function removeImage(idx) {
        setImages((s) => {
            const copy = [...s];
            if (copy[idx] && copy[idx].objectUrl) URL.revokeObjectURL(copy[idx].objectUrl);
            copy[idx] = null;
            return copy;
        });
    }

    function clearAll() {
        images.forEach((img) => img && img.objectUrl && URL.revokeObjectURL(img.objectUrl));
        setImages([null, null, null, null]);
        setStickers([]);
    }

    function addSticker(type) {
        const id = nextStickerId;
        setNextStickerId(id + 1);
        // initial placement near center of strip preview
        const bbox = stripRef.current?.getBoundingClientRect();
        const x = bbox ? bbox.width / 2 - 40 : 80;
        const y = bbox ? bbox.height / 2 - 40 : 80;
        setStickers((s) => [
            ...s,
            { id, type, text: type, x, y, width: 80, height: 80, rotation: 0 },
        ]);
    }

    function updateSticker(id, changes) {
        setStickers((prev) => prev.map((st) => (st.id === id ? { ...st, ...changes } : st)));
    }

    function removeSticker(id) {
        setStickers((prev) => prev.filter((s) => s.id !== id));
    }

    // export PNG using html2canvas
    async function downloadStrip() {
        if (!stripRef.current) return;
        // temporarily add white background if theme is transparent
        const opts = { scale: 2, useCORS: true, backgroundColor: null };
        try {
            const canvas = await html2canvas(stripRef.current, opts);
            const data = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.download = `photo-strip_${Date.now()}.png`;
            a.href = data;
            a.click();
        } catch (err) {
            console.error("Export failed", err);
            alert("Export failed — check console for details");
        }
    }

    return (
        <section
            className="relative py-16"
            style={{
                backgroundImage: `url(${BG_IMAGE})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="backdrop-blur-sm bg-black/40 py-12">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Controls */}
                        <div className="md:w-1/3 text-white space-y-4">
                            <h3 className="text-3xl font-semibold">Photo Strip Maker</h3>
                            <p className="text-sm text-white/70">
                                Upload 3–4 photos, add stickers, choose a theme and download a printable strip.
                            </p>

                            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                <div className="grid grid-cols-2 gap-3">
                                    {images.map((img, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2">
                                            <div className="w-full h-24 bg-black/20 rounded overflow-hidden flex items-center justify-center border border-white/6">
                                                {img ? (
                                                    <img src={img.objectUrl} alt={`slot-${i}`} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white/60 text-sm">Slot {i + 1}</span>
                                                )}
                                            </div>

                                            <div className="flex gap-2 w-full">
                                                <label className="flex-1">
                                                    <input
                                                        ref={inputRefs[i]}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => onFileChange(e, i)}
                                                    />
                                                    <button
                                                        onClick={() => inputRefs[i].current?.click()}
                                                        className="w-full py-2 text-xs rounded bg-white/10 hover:bg-white/20"
                                                    >
                                                        {images[i] ? "Replace" : "Upload"}
                                                    </button>
                                                </label>
                                                <button
                                                    onClick={() => removeImage(i)}
                                                    disabled={!images[i]}
                                                    className="py-2 px-3 rounded border border-white/10 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3">
                                    <label className="text-xs text-white/80">Theme</label>
                                    <select
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        className="w-full mt-2 p-2 bg-black/20 rounded border border-white/10 text-white"
                                    >
                                        {Object.keys(THEMES).map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mt-3">
                                    <div className="text-xs text-white/80 mb-2">Add Stickers</div>
                                    <div className="flex flex-wrap gap-2">
                                        {STICKERS.map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => addSticker(s.text)}
                                                className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                                            >
                                                {s.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <button onClick={downloadStrip} className="flex-1 py-2 rounded bg-amber-400 text-black font-semibold">
                                        Download PNG
                                    </button>
                                    <button onClick={clearAll} className="py-2 px-3 rounded border border-white/10 text-white">
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="md:w-2/3 flex flex-col items-center">
                            <div className="w-full max-w-md">
                                <div
                                    ref={stripRef}
                                    id="photo-strip-root"
                                    className={`relative m-auto p-6 ${THEMES[theme].container} ${THEMES[theme].frame}`}
                                    style={{ width: 320 }}
                                >
                                    {/* If Film theme show holes */}
                                    {THEMES[theme].hole && (
                                        <>
                                            <div className="absolute left-0 top-4 bottom-4 w-6 flex flex-col justify-between items-center">
                                                {[0, 1, 2].map((i) => (
                                                    <div key={i} className="w-3 h-3 bg-white/20 rounded-full" />
                                                ))}
                                            </div>
                                            <div className="absolute right-0 top-4 bottom-4 w-6 flex flex-col justify-between items-center">
                                                {[0, 1, 2].map((i) => (
                                                    <div key={i} className="w-3 h-3 bg-white/20 rounded-full" />
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    <div className="flex flex-col gap-4 px-2">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative overflow-hidden bg-black/5 rounded-md" style={{ height: 140 }}>
                                                {img ? (
                                                    <img src={img.objectUrl} alt={`slot-${idx}`} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/60">Photo {idx + 1}</div>
                                                )}

                                                {/* Polaroid caption */}
                                                {THEMES[theme].caption && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-white/95 text-black text-xs text-center py-1">
                                                        {img ? img.name.split(".")[0] : "Caption"}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* stickers rendered using Rnd */}
                                    {stickers.map((st) => (
                                        <Rnd
                                            key={st.id}
                                            size={{ width: st.width, height: st.height }}
                                            position={{ x: st.x, y: st.y }}
                                            onDragStop={(e, d) => updateSticker(st.id, { x: d.x, y: d.y })}
                                            onResizeStop={(e, dir, ref, delta, pos) =>
                                                updateSticker(st.id, {
                                                    width: parseInt(ref.style.width),
                                                    height: parseInt(ref.style.height),
                                                    ...pos,
                                                })
                                            }
                                            bounds="parent"
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "grab",
                                                transform: `rotate(${st.rotation}deg)`,
                                                zIndex: 40,
                                            }}
                                        >
                                            <div className="relative">
                                                <div className="text-3xl select-none">{st.text}</div>

                                                {/* small controls */}
                                                <div className="absolute -top-2 -right-2 flex gap-1">
                                                    <button
                                                        onClick={() => updateSticker(st.id, { rotation: (st.rotation + 15) % 360 })}
                                                        className="text-xs bg-white/10 px-1 rounded"
                                                        title="Rotate"
                                                    >
                                                        ⤾
                                                    </button>
                                                    <button onClick={() => removeSticker(st.id)} className="text-xs bg-red-500 px-1 rounded" title="Remove">
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        </Rnd>
                                    ))}
                                </div>

                                <div className="mt-3 text-xs text-white/60 text-center">Preview. Use Download PNG to save your strip.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
