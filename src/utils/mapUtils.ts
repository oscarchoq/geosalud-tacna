import L from 'leaflet';
import type { LayerType } from '../types';

export const LAYER_CONFIG: Record<
  LayerType,
  { label: string; color: string; emoji: string; size: number }
> = {
  hospitales: { label: 'Hospitales', color: '#DC2626', emoji: '🏥', size: 28 },
  centros: { label: 'Centros de Salud', color: '#2563EB', emoji: '⚕️', size: 22 },
  puestos: { label: 'Puestos de Salud', color: '#16A34A', emoji: '🩺', size: 18 },
  cpoblado: { label: 'Centros Poblados', color: '#7C3AED', emoji: '🏘️', size: 14 },
};

export function makeIcon(type: LayerType, dimmed = false): L.DivIcon {
  const cfg = LAYER_CONFIG[type];
  const s = cfg.size;
  const bg = dimmed ? '#9CA3AF' : cfg.color;
  const opacity = dimmed ? '0.35' : '1';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${s}px;height:${s}px;
      background:${bg};
      border:2px solid white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:${Math.round(s * 0.52)}px;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      cursor:pointer;
      opacity:${opacity};
      transition:opacity 0.2s;
    ">${cfg.emoji}</div>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
    popupAnchor: [0, -(s / 2 + 4)],
  });
}

export function makeHighlightIcon(type: LayerType, rank: number): L.DivIcon {
  const cfg = LAYER_CONFIG[type];
  const s = cfg.size + 8;
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:${s}px;height:${s}px;">
      <div style="
        width:${s}px;height:${s}px;
        background:${cfg.color};
        border:3px solid white;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-size:${Math.round(s * 0.45)}px;
        box-shadow:0 0 0 3px ${cfg.color}55, 0 4px 12px rgba(0,0,0,0.4);
        cursor:pointer;
      ">${cfg.emoji}</div>
      <div style="
        position:absolute;top:-6px;right:-6px;
        width:16px;height:16px;
        background:white;
        border:2px solid ${cfg.color};
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-size:9px;font-weight:700;
        color:${cfg.color};
        line-height:1;
      ">${rank}</div>
    </div>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
    popupAnchor: [0, -(s / 2 + 4)],
  });
}

export function makeOriginIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:20px;height:20px;
      background:#F59E0B;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 0 0 3px #F59E0B88, 0 4px 12px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
  });
}

export function formatValue(val: string | number | null | undefined): string {
  if (val === null || val === undefined || val === '' || val === 'None') return '—';
  return String(val);
}

export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Haversine distance in km between two lat/lon points */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Tacna urban continuum bounding box (generous envelope of all health facilities
 * within the province of Tacna, plus the main urban cluster buffer).
 * Points outside this box are considered "out of study area".
 */
export const TACNA_STUDY_BOUNDS = {
  latMin: -18.40,
  latMax: -16.60,
  lonMin: -71.20,
  lonMax: -69.40,
};

export function isInsideStudyArea(lat: number, lon: number): boolean {
  return (
    lat >= TACNA_STUDY_BOUNDS.latMin &&
    lat <= TACNA_STUDY_BOUNDS.latMax &&
    lon >= TACNA_STUDY_BOUNDS.lonMin &&
    lon <= TACNA_STUDY_BOUNDS.lonMax
  );
}
