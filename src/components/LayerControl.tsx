import { LAYER_CONFIG } from '../utils/mapUtils';
import type { LayerState, LayerType } from '../types';

interface LayerControlProps {
  layers: LayerState;
  counts: Record<LayerType, number>;
  onToggle: (layer: LayerType) => void;
}

export function LayerControl({ layers, counts, onToggle }: LayerControlProps) {
  const layerKeys: LayerType[] = ['hospitales', 'centros', 'puestos', 'cpoblado'];

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Capas visibles
      </h3>
      <div className="space-y-1">
        {layerKeys.map((key) => {
          const cfg = LAYER_CONFIG[key];
          const active = layers[key];
          const count = counts[key];

          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all cursor-pointer border ${
                active
                  ? 'bg-gray-50 border-gray-200 text-gray-700'
                  : 'border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-500'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 border"
                style={{
                  backgroundColor: active ? cfg.color : 'transparent',
                  borderColor: active ? cfg.color : '#D1D5DB',
                }}
              />
              <span className="flex-1 text-left text-xs">{cfg.label}</span>
              <span
                className={`text-xs tabular-nums px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
