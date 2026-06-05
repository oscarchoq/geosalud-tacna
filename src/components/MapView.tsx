import { useEffect, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  Polyline,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { makeIcon, makeHighlightIcon, makeOriginIcon } from '../utils/mapUtils';
import { HealthPopup, CpobladoPopup } from './PopupContent';
import type {
  LayerState,
  LayerData,
  HealthFeatureProperties,
  CpobladoProperties,
  AnalysisState,
} from '../types';
import { LAYER_CONFIG } from '../utils/mapUtils';

const TACNA_CENTER: [number, number] = [-18.014, -70.254];
const TACNA_ZOOM = 12;

// ── Fit map to facilities on first load ──────────────────────────────────────
function MapBounds({ data }: { data: LayerData }) {
  const map = useMap();
  useEffect(() => {
    const coords: [number, number][] = [];
    (['hospitales', 'centros', 'puestos'] as const).forEach((key) => {
      data[key]?.features.forEach((f) => {
        const [lon, lat] = f.geometry.coordinates;
        if (lat && lon) coords.push([lat, lon]);
      });
    });
    if (coords.length > 0) {
      const lats = coords.map((c) => c[0]);
      const lons = coords.map((c) => c[1]);
      map.fitBounds(
        [
          [Math.min(...lats) - 0.02, Math.min(...lons) - 0.02],
          [Math.max(...lats) + 0.02, Math.max(...lons) + 0.02],
        ],
        { padding: [24, 24] }
      );
    }
  }, [data, map]);
  return null;
}

// ── Click handler that fires onMapClick ──────────────────────────────────────
function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ── Pan map to analysis results ──────────────────────────────────────────────
function PanToResults({ analysis }: { analysis: AnalysisState }) {
  const map = useMap();
  useEffect(() => {
    if (analysis.status !== 'results') return;
    const pts: [number, number][] = [[analysis.point.lat, analysis.point.lon]];
    analysis.nearby.forEach((n) => pts.push([n.lat, n.lon]));
    const lats = pts.map((p) => p[0]);
    const lons = pts.map((p) => p[1]);
    map.fitBounds(
      [
        [Math.min(...lats) - 0.005, Math.min(...lons) - 0.005],
        [Math.max(...lats) + 0.005, Math.max(...lons) + 0.005],
      ],
      { padding: [60, 60], maxZoom: 14 }
    );
  }, [analysis, map]);
  return null;
}

interface MapViewProps {
  layers: LayerState;
  data: LayerData;
  analysis: AnalysisState;
  onMapClick: (lat: number, lon: number) => void;
}

export function MapView({ layers, data, analysis, onMapClick }: MapViewProps) {
  const originIcon = useMemo(() => makeOriginIcon(), []);
  const hospitalIcon = useMemo(() => makeIcon('hospitales'), []);
  const centroIcon = useMemo(() => makeIcon('centros'), []);
  const puestoIcon = useMemo(() => makeIcon('puestos'), []);
  const cpobladoIcon = useMemo(() => makeIcon('cpoblado'), []);
  const hospitalDimIcon = useMemo(() => makeIcon('hospitales', true), []);
  const centroDimIcon = useMemo(() => makeIcon('centros', true), []);
  const puestoDimIcon = useMemo(() => makeIcon('puestos', true), []);

  const isAnalysis = analysis.status === 'results';

  // Set of highlighted facility ids
  const nearbyIds = useMemo(() => {
    if (!isAnalysis) return new Set<string>();
    return new Set((analysis as Extract<AnalysisState, { status: 'results' }>).nearby.map((n) => n.id));
  }, [analysis, isAnalysis]);

  const getIcon = useCallback(
    (type: 'hospitales' | 'centros' | 'puestos', id: string, rank?: number) => {
      if (!isAnalysis) {
        return type === 'hospitales' ? hospitalIcon : type === 'centros' ? centroIcon : puestoIcon;
      }
      if (nearbyIds.has(id)) {
        return makeHighlightIcon(type, rank ?? 0);
      }
      return type === 'hospitales' ? hospitalDimIcon : type === 'centros' ? centroDimIcon : puestoDimIcon;
    },
    [isAnalysis, nearbyIds, hospitalIcon, centroIcon, puestoIcon, hospitalDimIcon, centroDimIcon, puestoDimIcon]
  );

  const nearbyResults = isAnalysis
    ? (analysis as Extract<AnalysisState, { status: 'results' }>).nearby
    : [];
  const originPoint = isAnalysis
    ? (analysis as Extract<AnalysisState, { status: 'results' }>).point
    : null;

  return (
    <MapContainer
      center={TACNA_CENTER}
      zoom={TACNA_ZOOM}
      style={{ height: '100%', width: '100%', cursor: 'crosshair' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBounds data={data} />
      <ClickHandler onMapClick={onMapClick} />
      <PanToResults analysis={analysis} />

      {/* ── Proximity lines ─────────────────────────────────────── */}
      {isAnalysis &&
        originPoint &&
        nearbyResults.map((n) => (
          <Polyline
            key={`line-${n.id}`}
            positions={[
              [originPoint.lat, originPoint.lon],
              [n.lat, n.lon],
            ]}
            pathOptions={{
              color: LAYER_CONFIG[n.type].color,
              weight: 1.5,
              opacity: 0.6,
              dashArray: '5 5',
            }}
          />
        ))}

      {/* ── Centros Poblados ─────────────────────────────────────── */}
      {layers.cpoblado &&
        data.cpoblado?.features.map((f, i) => {
          const [lon, lat] = f.geometry.coordinates;
          if (!lat || !lon) return null;
          return (
            <Marker key={`cpob-${i}`} position={[lat, lon]} icon={cpobladoIcon}>
              <Popup>
                <CpobladoPopup properties={f.properties as CpobladoProperties} />
              </Popup>
            </Marker>
          );
        })}

      {/* ── Puestos de Salud ─────────────────────────────────────── */}
      {layers.puestos &&
        data.puestos?.features.map((f, i) => {
          const id = `puestos-${i}`;
          const rank = nearbyResults.findIndex((n) => n.id === id) + 1;
          const [lon, lat] = f.geometry.coordinates;
          if (!lat || !lon) return null;
          return (
            <Marker key={id} position={[lat, lon]} icon={getIcon('puestos', id, rank || undefined)}>
              <Popup>
                <HealthPopup properties={f.properties as HealthFeatureProperties} type="puestos" />
              </Popup>
            </Marker>
          );
        })}

      {/* ── Centros de Salud ─────────────────────────────────────── */}
      {layers.centros &&
        data.centros?.features.map((f, i) => {
          const id = `centros-${i}`;
          const rank = nearbyResults.findIndex((n) => n.id === id) + 1;
          const [lon, lat] = f.geometry.coordinates;
          if (!lat || !lon) return null;
          return (
            <Marker key={id} position={[lat, lon]} icon={getIcon('centros', id, rank || undefined)}>
              <Popup>
                <HealthPopup properties={f.properties as HealthFeatureProperties} type="centros" />
              </Popup>
            </Marker>
          );
        })}

      {/* ── Hospitales ───────────────────────────────────────────── */}
      {layers.hospitales &&
        data.hospitales?.features.map((f, i) => {
          const id = `hospitales-${i}`;
          const rank = nearbyResults.findIndex((n) => n.id === id) + 1;
          const [lon, lat] = f.geometry.coordinates;
          if (!lat || !lon) return null;
          return (
            <Marker key={id} position={[lat, lon]} icon={getIcon('hospitales', id, rank || undefined)}>
              <Popup>
                <HealthPopup
                  properties={f.properties as HealthFeatureProperties}
                  type="hospitales"
                />
              </Popup>
            </Marker>
          );
        })}

      {/* ── Origin marker ────────────────────────────────────────── */}
      {isAnalysis && originPoint && (
        <Marker position={[originPoint.lat, originPoint.lon]} icon={originIcon}>
          <Popup>
            <div className="text-sm font-medium text-gray-700 px-1 py-0.5">
              📍 Ubicación seleccionada
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
