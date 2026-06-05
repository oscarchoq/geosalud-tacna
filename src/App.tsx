import { useState, useMemo, useCallback } from 'react';
import { MapView } from './components/MapView';
import { Sidebar } from './components/Sidebar';
import { useLayerData } from './hooks/useLayerData';
import { useProximityAnalysis } from './hooks/useProximityAnalysis';
import type { LayerState, LayerType, Stats, AnalysisState } from './types';

const INITIAL_LAYERS: LayerState = {
  hospitales: true,
  centros: true,
  puestos: true,
  cpoblado: false,
};

export default function App() {
  const [layers, setLayers] = useState<LayerState>(INITIAL_LAYERS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: 'idle' });

  const { data, loading, error } = useLayerData();
  const { analyze } = useProximityAnalysis(data);

  const toggleLayer = (key: LayerType) =>
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleMapClick = useCallback(
    (lat: number, lon: number) => {
      setAnalysis(analyze(lat, lon));
    },
    [analyze]
  );

  const handleClear = useCallback(() => {
    setAnalysis({ status: 'idle' });
  }, []);

  const counts: Record<LayerType, number> = useMemo(
    () => ({
      hospitales: data.hospitales?.features.length ?? 0,
      centros: data.centros?.features.length ?? 0,
      puestos: data.puestos?.features.length ?? 0,
      cpoblado: data.cpoblado?.features.length ?? 0,
    }),
    [data]
  );

  const stats: Stats = useMemo(() => {
    const distritos = new Set<string>();
    (['hospitales', 'centros', 'puestos'] as const).forEach((key) => {
      data[key]?.features.forEach((f) => {
        const d = f.properties?.NOM_DIST;
        if (d) distritos.add(d);
      });
    });
    const poblacionTotal =
      data.cpoblado?.features.reduce(
        (sum, f) => sum + (Number(f.properties?.poblacion) || 0),
        0
      ) ?? 0;
    return {
      hospitales: counts.hospitales,
      centros: counts.centros,
      puestos: counts.puestos,
      poblacionTotal,
      distritos: Array.from(distritos).sort(),
    };
  }, [data, counts]);

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      <Sidebar
        layers={layers}
        stats={stats}
        counts={counts}
        onToggle={toggleLayer}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed((v) => !v)}
        analysis={analysis}
        onClear={handleClear}
      />

      <main className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Cargando datos geoespaciales…</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white">
            <div className="text-center text-red-500">
              <p className="text-lg mb-1">⚠️ Error</p>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          </div>
        )}

        {/* Cursor hint overlay when idle */}
        {!loading && analysis.status === 'idle' && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-1.5 shadow-md flex items-center gap-2">
              <span className="text-sm">🖱️</span>
              <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                Haz clic en el mapa para analizar proximidad
              </span>
            </div>
          </div>
        )}

        {/* Out of bounds toast */}
        {!loading && analysis.status === 'out_of_bounds' && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
            <div className="bg-amber-50 border border-amber-300 rounded-full px-4 py-1.5 shadow-md flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span className="text-xs text-amber-700 font-medium whitespace-nowrap">
                Ubicación fuera del área de estudio. Seleccione un punto dentro de Tacna.
              </span>
            </div>
          </div>
        )}

        {!loading && (
          <MapView
            layers={layers}
            data={data}
            analysis={analysis}
            onMapClick={handleMapClick}
          />
        )}
      </main>
    </div>
  );
}
