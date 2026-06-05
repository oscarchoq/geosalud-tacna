import {
  Hospital,
  MapPin,
  Users,
  Map,
  ChevronLeft,
  ChevronRight,
  MousePointerClick,
  X,
  Navigation,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';
import { LayerControl } from './LayerControl';
import { LAYER_CONFIG, titleCase, formatValue } from '../utils/mapUtils';
import type { LayerState, LayerType, Stats, AnalysisState, NearbyFacility } from '../types';

interface SidebarProps {
  layers: LayerState;
  stats: Stats;
  counts: Record<LayerType, number>;
  onToggle: (layer: LayerType) => void;
  collapsed: boolean;
  onCollapse: () => void;
  analysis: AnalysisState;
  onClear: () => void;
}

// ── Idle state panel ────────────────────────────────────────────────────────
function IdlePanel({
  stats,
  layers,
  counts,
  onToggle,
}: {
  stats: Stats;
  layers: LayerState;
  counts: Record<LayerType, number>;
  onToggle: (k: LayerType) => void;
}) {
  return (
    <>
      {/* Call to action */}
      <div className="mx-4 mt-4 mb-3 rounded-xl bg-blue-50 border border-blue-200 p-3">
        <div className="flex gap-2 mb-1.5">
          <MousePointerClick size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-blue-800 leading-tight">
            ¿Cómo usar esta herramienta?
          </p>
        </div>
        <p className="text-xs text-blue-700 leading-relaxed">
          Seleccione cualquier ubicación dentro de Tacna para identificar los
          establecimientos de salud más cercanos.
        </p>
      </div>

      {/* Summary counts */}
      <div className="px-4 pb-3 space-y-1.5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Establecimientos disponibles
        </p>
        {(
          [
            { key: 'hospitales' as LayerType, icon: <Hospital size={13} /> },
            { key: 'centros' as LayerType, icon: <Stethoscope size={13} /> },
            { key: 'puestos' as LayerType, icon: <MapPin size={13} /> },
          ] as { key: LayerType; icon: React.ReactNode }[]
        ).map(({ key, icon }) => {
          const cfg = LAYER_CONFIG[key];
          return (
            <div
              key={key}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-white"
                style={{ backgroundColor: cfg.color }}
              >
                {icon}
              </div>
              <span className="flex-1 text-xs text-gray-600">{cfg.label}</span>
              <span className="text-sm font-bold tabular-nums" style={{ color: cfg.color }}>
                {counts[key]}
              </span>
            </div>
          );
        })}
        {stats.poblacionTotal > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-violet-600 text-white">
              <Users size={13} />
            </div>
            <span className="flex-1 text-xs text-gray-600">Población registrada</span>
            <span className="text-sm font-bold tabular-nums text-violet-600">
              {stats.poblacionTotal.toLocaleString('es-PE')}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 mx-4" />

      {/* Layer Control */}
      <div className="px-4 pt-3 pb-3">
        <LayerControl layers={layers} counts={counts} onToggle={onToggle} />
      </div>

      {/* Districts */}
      {stats.distritos.length > 0 && (
        <>
          <div className="border-t border-gray-200 mx-4" />
          <div className="px-4 pt-3 pb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Distritos con cobertura
            </p>
            <div className="flex flex-wrap gap-1">
              {stats.distritos.map((d) => (
                <span
                  key={d}
                  className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize"
                >
                  {d.toLowerCase()}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ── Out of bounds warning ────────────────────────────────────────────────────
function OutOfBoundsPanel({ onClear }: { onClear: () => void }) {
  return (
    <div className="mx-4 mt-4">
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
        <div className="flex gap-2 mb-1.5">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-amber-800 leading-tight">
            Fuera del área de estudio
          </p>
        </div>
        <p className="text-xs text-amber-700 leading-relaxed">
          Seleccione un punto dentro del departamento de Tacna.
        </p>
      </div>
      <button
        onClick={onClear}
        className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <X size={12} /> Limpiar selección
      </button>
    </div>
  );
}

// ── Results panel ────────────────────────────────────────────────────────────
function FacilityRow({ facility, rank }: { facility: NearbyFacility; rank: number }) {
  const cfg = LAYER_CONFIG[facility.type];
  const name = formatValue(facility.properties.NOMBRE);
  const dist = facility.distanceKm;
  const distLabel = dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(2)} km`;

  return (
    <div className="flex items-start gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
      {/* rank badge */}
      <div
        className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white font-bold mt-0.5"
        style={{ backgroundColor: cfg.color, fontSize: '10px' }}
      >
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 leading-tight truncate">
          {titleCase(name)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{cfg.label}</p>
        {facility.properties.NOM_DIST && (
          <p className="text-xs text-gray-400 truncate">
            {titleCase(String(facility.properties.NOM_DIST))}
          </p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <span
          className="text-xs font-bold tabular-nums"
          style={{ color: cfg.color }}
        >
          {distLabel}
        </span>
      </div>
    </div>
  );
}

function ResultsPanel({
  analysis,
  onClear,
  layers,
  counts,
  onToggle,
}: {
  analysis: Extract<AnalysisState, { status: 'results' }>;
  onClear: () => void;
  layers: LayerState;
  counts: Record<LayerType, number>;
  onToggle: (k: LayerType) => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="mx-4 mt-4 mb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Navigation size={14} className="text-blue-500 shrink-0" />
            <p className="text-sm font-bold text-gray-800">Análisis de proximidad</p>
          </div>
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5"
          >
            <X size={12} /> Limpiar
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Mostrando los {analysis.nearby.length} establecimientos más cercanos a tu ubicación.
        </p>
      </div>

      {/* Results list */}
      <div className="px-4 pb-3 space-y-1.5">
        {analysis.nearby.map((facility, i) => (
          <FacilityRow key={facility.id} facility={facility} rank={i + 1} />
        ))}
      </div>

      <div className="border-t border-gray-200 mx-4" />

      {/* Layer control stays visible */}
      <div className="px-4 pt-3 pb-3">
        <LayerControl layers={layers} counts={counts} onToggle={onToggle} />
      </div>
    </>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────
export function Sidebar({
  layers,
  stats,
  counts,
  onToggle,
  collapsed,
  onCollapse,
  analysis,
  onClear,
}: SidebarProps) {
  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
        collapsed ? 'w-10' : 'w-80'
      } shrink-0 overflow-hidden`}
    >
      {/* Collapse toggle */}
      <button
        onClick={onCollapse}
        className="absolute top-3 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        title={collapsed ? 'Expandir panel' : 'Contraer panel'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {!collapsed && (
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="px-4 pt-5 pb-3 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-0.5">
              <Map size={17} className="text-blue-600 shrink-0" />
              <h1 className="text-base font-bold text-gray-900">GeoSalud Tacna</h1>
            </div>
            <p className="text-xs text-gray-400 leading-tight">
              Exploración de proximidad a servicios de salud
            </p>
          </div>

          {/* Content by analysis state */}
          {analysis.status === 'idle' && (
            <IdlePanel stats={stats} layers={layers} counts={counts} onToggle={onToggle} />
          )}
          {analysis.status === 'out_of_bounds' && <OutOfBoundsPanel onClear={onClear} />}
          {analysis.status === 'results' && (
            <ResultsPanel
              analysis={analysis as Extract<AnalysisState, { status: 'results' }>}
              onClear={onClear}
              layers={layers}
              counts={counts}
              onToggle={onToggle}
            />
          )}

          {/* Footer */}
          <div className="mt-auto px-4 pb-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-300 leading-tight">
              Fuente: GEO Perú · MINSA · julio 2025
            </p>
            <p className="text-xs text-gray-300 leading-tight mt-0.5">GEOTÓN Perú 2026</p>
          </div>
        </div>
      )}
    </aside>
  );
}
