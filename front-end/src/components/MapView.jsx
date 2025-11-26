// src/components/MapView.jsx
import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import fixLeafletMarkerIcon from "../utils/leafletFix";

function FitBounds({ markers }) {
    const map = useMap();

    useEffect(() => {
        if (!markers || markers.length === 0) return;
        const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lon]));
        map.fitBounds(bounds, { padding: [40, 40] });
    }, [map, markers]);

    return null;
}

export default function MapView({ places = [], onView = () => { }, onSave = () => { } }) {
    // ensure marker icon fix runs (once)
    useMemo(() => fixLeafletMarkerIcon(), []);

    // build marker list with fallback coordinates
    const markers = (places || [])
        .filter(p => p && (p.lat || p.lon))
        .map(p => ({
            lat: Number(p.lat),
            lon: Number(p.lon),
            name: p.name,
            address: p.address,
            estimated_time: p.estimated_time || p.time,
            duration_mins: p.duration_mins,
            raw: p
        }));

    // if no markers, center on a sensible default
    const center = markers.length ? [markers[0].lat, markers[0].lon] : [20.5937, 78.9629]; // India center fallback

    return (
        <div className="rounded-2xl overflow-hidden" style={{ height: 400 }}>
            <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds markers={markers} />

                {markers.map((m, i) => (
                    <Marker key={`${m.lat}-${m.lon}-${i}`} position={[m.lat, m.lon]}>
                        <Popup>
                            <div className="text-left">
                                <div className="font-semibold">{m.name}</div>
                                {m.address && <div className="text-xs text-gray-700 mt-1">{m.address}</div>}
                                {m.estimated_time && <div className="text-xs text-gray-600 mt-1">When: {m.estimated_time}</div>}
                                {m.duration_mins && <div className="text-xs text-gray-600">Duration: {m.duration_mins} min</div>}

                                <div className="mt-2 flex gap-2">
                                    <button type="button" onClick={() => onView(m.raw)} className="px-2 py-1 rounded bg-gray-100 text-black text-xs">Open</button>
                                    <button type="button" onClick={() => onSave(m.raw)} className="px-2 py-1 rounded border text-xs">Save</button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
