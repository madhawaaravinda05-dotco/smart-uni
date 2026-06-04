/**
 * MapPicker — Real-world Leaflet map (OpenStreetMap tiles)
 * Supports read-only marker display AND interactive pin-drop mode.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";

// ── Fix broken default icons in Vite/webpack builds ───────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── SVG icon factory ──────────────────────────────────────────────────────────
const makeMarkerIcon = (color = "#2563EB", size = 30) => {
  const h = Math.round(size * 1.3);
  const html = `<svg width="${size}" height="${h}" viewBox="0 0 30 39" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 24 15 24S30 26.25 30 15C30 6.716 23.284 0 15 0z" fill="${color}"/>
    <circle cx="15" cy="15" r="6.5" fill="white"/>
    <circle cx="15" cy="15" r="3.5" fill="${color}" opacity="0.55"/>
  </svg>`;
  return L.divIcon({
    html,
    className: "",
    iconSize:   [size, h],
    iconAnchor: [size / 2, h],
    popupAnchor:[0, -(h + 2)],
  });
};

const makePickIcon = () => {
  const html = `<svg width="38" height="48" viewBox="0 0 38 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 0C8.507 0 0 8.507 0 19c0 14.25 19 29 19 29S38 33.25 38 19C38 8.507 29.493 0 19 0z" fill="#2563EB"/>
    <circle cx="19" cy="19" r="9" fill="white"/>
    <circle cx="19" cy="19" r="5" fill="#2563EB"/>
    <line x1="19" y1="7"  x2="19" y2="12" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="19" y1="26" x2="19" y2="31" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="7"  y1="19" x2="12" y2="19" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="26" y1="19" x2="31" y2="19" stroke="white" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
  return L.divIcon({
    html,
    className: "",
    iconSize:   [38, 48],
    iconAnchor: [19, 48],
    popupAnchor:[0, -50],
  });
};

// ── Popup template ────────────────────────────────────────────────────────────
const TYPE_COLORS = { BOARDING:"#2563EB", FOOD:"#EA580C", TRANSPORT:"#16A34A", DEFAULT:"#7C3AED" };
const TYPE_LABELS = { BOARDING:"Boarding", FOOD:"Food Spot", TRANSPORT:"Transport", DEFAULT:"Location" };

const popupHTML = (m) => {
  const c = TYPE_COLORS[m.type] || TYPE_COLORS.DEFAULT;
  const l = TYPE_LABELS[m.type] || TYPE_LABELS.DEFAULT;
  return `<div style="min-width:190px;padding:14px 16px;font-family:Inter,-apple-system,sans-serif;line-height:1.4;">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
      <span style="width:8px;height:8px;border-radius:50%;background:${c};display:inline-block;flex-shrink:0;"></span>
      <span style="font-size:10px;font-weight:700;color:${c};text-transform:uppercase;letter-spacing:.5px;">${l}</span>
      ${m.verified ? `<span style="margin-left:auto;font-size:9.5px;font-weight:700;background:#F0FDF4;color:#15803D;border:1px solid #86EFAC;padding:2px 8px;border-radius:20px;">✓ Verified</span>` : ""}
    </div>
    <div style="font-size:13.5px;font-weight:700;color:#0F172A;margin-bottom:${m.price ? "5px":"2px"};">${m.label}</div>
    ${m.price    ? `<div style="font-size:12px;font-weight:700;color:${c};">${m.price}</div>`  : ""}
    ${m.distance ? `<div style="font-size:11px;color:#94A3B8;margin-top:4px;display:flex;align-items:center;gap:4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${m.distance}</div>` : ""}
  </div>`;
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function MapPicker({
  center      = [6.7955, 79.9012],
  zoom        = 15,
  markers     = [],
  pickMode    = false,
  onPick,
  pickedPoint = null,
  height      = "520px",
  style: extraStyle = {},
}) {
  const divRef         = useRef(null);
  const mapRef         = useRef(null);
  const layerGroupRef  = useRef(null);
  const pickMarkerRef  = useRef(null);
  const onPickRef      = useRef(onPick);    // stable ref so click handler doesn't re-register
  const [address, setAddress] = useState("");

  // keep onPickRef fresh
  useEffect(() => { onPickRef.current = onPick; }, [onPick]);

  // ── Boot Leaflet map once ─────────────────────────────────────────────────
  useEffect(() => {
    if (!divRef.current || mapRef.current) return;

    const map = L.map(divRef.current, {
      center,
      zoom,
      zoomControl:      true,
      scrollWheelZoom:  true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Force size calculation after a tick (fixes "grey tiles" in modals / hidden divs)
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current        = null;
      layerGroupRef.current = null;
      pickMarkerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-invalidate whenever height changes (e.g. showMap toggle) ──────────
  useEffect(() => {
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 80);
    return () => clearTimeout(t);
  }, [height]);

  // ── Render listing markers ────────────────────────────────────────────────
  useEffect(() => {
    const lg = layerGroupRef.current;
    if (!lg) return;
    lg.clearLayers();

    markers.forEach((m) => {
      const color = TYPE_COLORS[m.type] || TYPE_COLORS.DEFAULT;
      L.marker([m.lat, m.lng], { icon: makeMarkerIcon(color, 30) })
        .bindPopup(popupHTML(m), { maxWidth: 260, minWidth: 190, closeButton: false })
        .addTo(lg);
    });
  }, [markers]);

  // ── Click handler for pick mode ───────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onClick = (e) => {
      if (!pickMode) return;
      const { lat, lng } = e.latlng;
      placePickMarker(lat, lng);
      onPickRef.current?.(lat, lng);
      reverseGeocode(lat, lng);
    };

    map.on("click", onClick);
    return () => { map.off("click", onClick); };
  // pickMode intentionally in deps so handler re-binds when mode changes
  }, [pickMode]);

  // ── Sync external pickedPoint ─────────────────────────────────────────────
  useEffect(() => {
    if (!pickedPoint || !mapRef.current) return;
    const [lat, lng] = pickedPoint;
    placePickMarker(lat, lng);
    mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom(), 16), { animate: true });
    reverseGeocode(lat, lng);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedPoint?.[0], pickedPoint?.[1]]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const placePickMarker = useCallback((lat, lng) => {
    const map = mapRef.current;
    if (!map) return;
    if (pickMarkerRef.current) { map.removeLayer(pickMarkerRef.current); }

    const marker = L.marker([lat, lng], { icon: makePickIcon(), draggable: true })
      .addTo(map)
      .bindPopup(
        `<div style="padding:10px 14px;font-family:Inter,sans-serif;font-size:12.5px;font-weight:600;color:#1D4ED8;">
          Pinned location<br>
          <span style="font-size:11px;color:#64748B;font-weight:400;">${lat.toFixed(5)}, ${lng.toFixed(5)}</span>
         </div>`,
        { closeButton: false }
      )
      .openPopup();

    marker.on("dragend", (ev) => {
      const pos = ev.target.getLatLng();
      onPickRef.current?.(pos.lat, pos.lng);
      reverseGeocode(pos.lat, pos.lng);
    });

    pickMarkerRef.current = marker;
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "en" } }
      );
      const d = await res.json();
      if (d?.display_name) setAddress(d.display_name);
    } catch { /* network offline, silent */ }
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: "relative", width: "100%", ...extraStyle }}>
      {/* Leaflet target div */}
      <div ref={divRef} style={{ height, width: "100%", background: "#E2EBF5", display: "block" }} />

      {/* Pick mode instruction pill */}
      {pickMode && (
        <div style={{
          position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
          background: "rgba(29,78,216,0.93)", color: "#fff",
          borderRadius: 50, padding: "7px 18px",
          fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
          boxShadow: "0 4px 18px rgba(37,99,235,0.45)",
          backdropFilter: "blur(6px)",
          pointerEvents: "none", zIndex: 999,
          display: "flex", alignItems: "center", gap: 7,
          animation: "fadeInUp 0.25s ease",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Click map to pin · Drag pin to fine-tune
        </div>
      )}

      {/* Reverse geocode address bar */}
      {pickMode && address && (
        <div style={{
          position: "absolute", bottom: 10, left: 10, right: 10,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(10px)",
          border: "1px solid #E2E8F0",
          borderRadius: 12, padding: "9px 14px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.1)",
          zIndex: 999,
          display: "flex", alignItems: "flex-start", gap: 8,
          animation: "fadeInUp 0.2s ease",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 2 }}>Selected address</div>
            <div style={{ fontSize: 12, color: "#334155", fontWeight: 500, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{address}</div>
          </div>
        </div>
      )}
    </div>
  );
}
