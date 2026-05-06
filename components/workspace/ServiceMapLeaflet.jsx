"use client";

import { useEffect, useRef, useState } from "react";

const ESTONIA_BOUNDS = [
  [57.45, 21.35],
  [59.95, 28.35]
];

const ESTONIA_FIT_BOUNDS = [
  [57.52, 21.55],
  [59.85, 28.22]
];

const DEFAULT_TILE_URL =
  "https://tiles.maaamet.ee/tm/tms/1.0.0/hallkaart@GMC/{z}/{x}/{y}.png&ASUTUS=SOTSIAALAI&KESKKOND=LIVE&IS=TEENUSEKAART";

const DEFAULT_ATTRIBUTION = "Aluskaart: Maa- ja Ruumiamet";
const DEFAULT_LEAFLET_SCRIPT_URL = "/vendor/leaflet/leaflet.js";
const DEFAULT_LEAFLET_CSS_URL = "/vendor/leaflet/leaflet.css";

let leafletLoadPromise = null;

function readText(t, key, fallback) {
  return typeof t === "function" ? t(key, fallback) : fallback;
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function entryCoordinates(entry) {
  const latitude = numberOrNull(entry?.latitude);
  const longitude = numberOrNull(entry?.longitude);
  if (latitude === null || longitude === null) return null;
  if (latitude < 57 || latitude > 60.5 || longitude < 19 || longitude > 31) return null;
  return [latitude, longitude];
}

function shortText(value, maxLength = 240) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}...` : text;
}

function safeWebsiteUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function appendText(parent, tagName, className, text) {
  const value = String(text || "").trim();
  if (!value) return null;
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = value;
  parent.appendChild(element);
  return element;
}

function appendMeta(parent, label, value) {
  const text = String(value || "").trim();
  if (!text) return null;
  const row = document.createElement("p");
  row.className = "service-map-popup__meta";

  const labelElement = document.createElement("span");
  labelElement.className = "service-map-popup__label";
  labelElement.textContent = label;
  row.appendChild(labelElement);

  const valueElement = document.createElement("span");
  valueElement.textContent = text;
  row.appendChild(valueElement);

  parent.appendChild(row);
  return row;
}

function createPopupContent(entry, t) {
  const root = document.createElement("article");
  root.className = "service-map-popup";

  appendText(root, "h3", "service-map-popup__title", entry.title);
  appendText(
    root,
    "p",
    "service-map-popup__type",
    entry.type === "SERVICE_PROVIDER"
      ? readText(t, "workspace_feature_pages.service_map.popup.provider", "Teenuseosutaja")
      : readText(t, "workspace_feature_pages.service_map.popup.kov", "KOV kontakt")
  );
  appendText(root, "p", "service-map-popup__body", shortText(entry.description || entry.providerProfile?.shortDescription));

  appendMeta(root, readText(t, "workspace_feature_pages.service_map.popup.address", "Aadress"), entry.address);
  appendMeta(
    root,
    readText(t, "workspace_feature_pages.service_map.popup.region", "Piirkond"),
    [entry.municipalityName || entry.municipality?.displayName, entry.county].filter(Boolean).join(", ")
  );
  appendMeta(root, readText(t, "workspace_feature_pages.service_map.popup.phone", "Telefon"), entry.phone);
  appendMeta(root, readText(t, "workspace_feature_pages.service_map.popup.email", "E-post"), entry.email);

  const websiteUrl = safeWebsiteUrl(entry.website);
  if (websiteUrl || entry.email) {
    const actions = document.createElement("div");
    actions.className = "service-map-popup__actions";

    if (entry.email) {
      const emailLink = document.createElement("a");
      emailLink.href = `mailto:${entry.email}`;
      emailLink.textContent = readText(t, "workspace_feature_pages.service_map.popup.write", "Kirjuta");
      actions.appendChild(emailLink);
    }

    if (websiteUrl) {
      const websiteLink = document.createElement("a");
      websiteLink.href = websiteUrl;
      websiteLink.target = "_blank";
      websiteLink.rel = "noreferrer";
      websiteLink.textContent = readText(t, "workspace_feature_pages.service_map.popup.website", "Veeb");
      actions.appendChild(websiteLink);
    }

    root.appendChild(actions);
  }

  return root;
}

function markerLabel(entry, t) {
  if (entry.type === "SERVICE_PROVIDER") {
    return readText(t, "workspace_feature_pages.service_map.marker_provider_short", "T");
  }
  return readText(t, "workspace_feature_pages.service_map.marker_kov_short", "K");
}

function markerClassName(entry, selected) {
  return [
    "service-map-leaflet__marker",
    entry.type === "SERVICE_PROVIDER" ? "service-map-leaflet__marker--provider" : "service-map-leaflet__marker--kov",
    selected ? "service-map-leaflet__marker--selected" : ""
  ]
    .filter(Boolean)
    .join(" ");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ensureStylesheet(href) {
  if (typeof document === "undefined") return;
  if (document.querySelector(`link[data-service-map-leaflet="1"][href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.serviceMapLeaflet = "1";
  document.head.appendChild(link);
}

function loadLeafletFromPublicAssets() {
  if (typeof window === "undefined") return Promise.reject(new Error("Leaflet requires a browser environment."));
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoadPromise) return leafletLoadPromise;

  const scriptUrl = process.env.NEXT_PUBLIC_LEAFLET_SCRIPT_URL || DEFAULT_LEAFLET_SCRIPT_URL;
  const cssUrl = process.env.NEXT_PUBLIC_LEAFLET_CSS_URL || DEFAULT_LEAFLET_CSS_URL;
  ensureStylesheet(cssUrl);

  leafletLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[data-service-map-leaflet="1"][src="${scriptUrl}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.L), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Leaflet script failed to load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.defer = true;
    script.dataset.serviceMapLeaflet = "1";
    script.onload = () => {
      if (window.L) {
        resolve(window.L);
      } else {
        reject(new Error("Leaflet global was not initialized."));
      }
    };
    script.onerror = () => reject(new Error("Leaflet script failed to load."));
    document.head.appendChild(script);
  });

  return leafletLoadPromise;
}

export default function ServiceMapLeaflet({
  entries = [],
  selectedEntryId = "",
  onSelectEntry,
  t
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const markerRefs = useRef(new Map());
  const selectedEntryIdRef = useRef(selectedEntryId);
  const onSelectEntryRef = useRef(onSelectEntry);
  const tRef = useRef(t);
  const [leaflet, setLeaflet] = useState(null);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    selectedEntryIdRef.current = selectedEntryId;
  }, [selectedEntryId]);

  useEffect(() => {
    onSelectEntryRef.current = onSelectEntry;
  }, [onSelectEntry]);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver = null;
    const markers = markerRefs.current;

    async function initializeMap() {
      if (!containerRef.current || mapRef.current) return;

      try {
        const L = await loadLeafletFromPublicAssets();
        if (cancelled || !containerRef.current) return;

        const map = L.map(containerRef.current, {
          center: [58.75, 25.2],
          zoom: 7,
          minZoom: 6,
          maxZoom: 18,
          maxBounds: ESTONIA_BOUNDS,
          maxBoundsViscosity: 1,
          zoomControl: true,
          attributionControl: true,
          worldCopyJump: false
        });

        L.tileLayer(process.env.NEXT_PUBLIC_SERVICE_MAP_TILE_URL || DEFAULT_TILE_URL, {
          attribution: process.env.NEXT_PUBLIC_SERVICE_MAP_ATTRIBUTION || DEFAULT_ATTRIBUTION,
          minZoom: 6,
          maxZoom: 18,
          tms: true,
          noWrap: true,
          bounds: ESTONIA_BOUNDS,
          updateWhenIdle: true,
          keepBuffer: 3
        }).addTo(map);

        map.fitBounds(ESTONIA_FIT_BOUNDS, { padding: [12, 12] });
        markerLayerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
        setLeaflet(L);
        setReady(true);

        resizeObserver = new ResizeObserver(() => {
          window.requestAnimationFrame(() => map.invalidateSize());
        });
        resizeObserver.observe(containerRef.current);
      } catch (error) {
        if (!cancelled) {
          setMapError(error?.message || readText(tRef.current, "workspace_feature_pages.service_map.errors.map_failed", "Kaarti ei saanud laadida."));
        }
      }
    }

    void initializeMap();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      markers.clear();
      markerLayerRef.current = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leaflet || !mapRef.current || !markerLayerRef.current) return;

    markerLayerRef.current.clearLayers();
    markerRefs.current.clear();

    const bounds = [];
    for (const entry of entries) {
      const coordinates = entryCoordinates(entry);
      if (!coordinates) continue;

      const selected = entry.id === selectedEntryIdRef.current;
      const icon = leaflet.divIcon({
        className: "",
        html: `<span class="${markerClassName(entry, selected)}"><span>${escapeHtml(markerLabel(entry, t))}</span></span>`,
        iconSize: [42, 42],
        iconAnchor: [21, 42],
        popupAnchor: [0, -38]
      });

      const marker = leaflet.marker(coordinates, {
        icon,
        keyboard: true,
        title: entry.title || ""
      });

      marker.bindPopup(() => createPopupContent(entry, t), {
        className: "service-map-leaflet__popup",
        maxWidth: 256,
        minWidth: 176,
        autoPanPaddingTopLeft: [24, 176],
        autoPanPaddingBottomRight: [24, 84]
      });
      marker.on("click", () => {
        onSelectEntryRef.current?.(entry.id);
      });
      marker.addTo(markerLayerRef.current);
      markerRefs.current.set(entry.id, marker);
      bounds.push(coordinates);
    }

    if (bounds.length === 1) {
      mapRef.current.setView(bounds[0], Math.max(mapRef.current.getZoom(), 11), { animate: true });
    } else if (bounds.length > 1) {
      mapRef.current.fitBounds(bounds, { padding: [46, 46], maxZoom: 11 });
    } else {
      mapRef.current.fitBounds(ESTONIA_FIT_BOUNDS, { padding: [12, 12] });
    }
  }, [entries, leaflet, t]);

  useEffect(() => {
    if (!leaflet || !mapRef.current || !markerLayerRef.current) return;

    for (const [entryId, marker] of markerRefs.current.entries()) {
      const entry = entries.find((item) => item.id === entryId);
      if (!entry) continue;
      marker.setIcon(
        leaflet.divIcon({
          className: "",
          html: `<span class="${markerClassName(entry, entryId === selectedEntryId)}"><span>${escapeHtml(markerLabel(entry, t))}</span></span>`,
          iconSize: [42, 42],
          iconAnchor: [21, 42],
          popupAnchor: [0, -38]
        })
      );
    }

    const selectedMarker = markerRefs.current.get(selectedEntryId);
    const selectedEntry = entries.find((entry) => entry.id === selectedEntryId);
    const selectedCoordinates = entryCoordinates(selectedEntry);
    if (selectedMarker && selectedCoordinates) {
      mapRef.current.flyTo(selectedCoordinates, Math.max(mapRef.current.getZoom(), 11), { duration: 0.45 });
      selectedMarker.openPopup();
    }
  }, [entries, leaflet, selectedEntryId, t]);

  return (
    <div className="service-map-leaflet-shell">
      <div
        ref={containerRef}
        className="service-map-leaflet"
        role="application"
        aria-label={readText(t, "workspace_feature_pages.service_map.map_label", "Teenusekaart")}
      />
      {!ready || mapError ? (
        <div className="service-map-leaflet__status">
          {mapError || readText(t, "workspace_feature_pages.service_map.loading_map", "Laen Eesti kaarti...")}
        </div>
      ) : null}
    </div>
  );
}
