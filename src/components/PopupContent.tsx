import { formatValue, titleCase, LAYER_CONFIG } from '../utils/mapUtils';
import type { HealthFeatureProperties, CpobladoProperties, LayerType } from '../types';

const HEALTH_FIELDS: Array<{ key: keyof HealthFeatureProperties; label: string }> = [
  { key: 'NOMBRE', label: 'Nombre' },
  { key: 'CATEGORIA', label: 'Categoría' },
  { key: 'CLASIFICAC', label: 'Clasificación' },
  { key: 'NOM_DIST', label: 'Distrito' },
  { key: 'NOM_PROV', label: 'Provincia' },
  { key: 'DIRECCION', label: 'Dirección' },
  { key: 'TELEFONO', label: 'Teléfono' },
  { key: 'HORARIO', label: 'Horario' },
  { key: 'ESTADO', label: 'Estado' },
  { key: 'MICRORED', label: 'Microred' },
  { key: 'RED', label: 'Red' },
  { key: 'INSTITUCIO', label: 'Institución' },
];

interface HealthPopupProps {
  properties: HealthFeatureProperties;
  type: 'hospitales' | 'centros' | 'puestos';
}

export function HealthPopup({ properties, type }: HealthPopupProps) {
  const cfg = LAYER_CONFIG[type];
  const nombre = formatValue(properties.NOMBRE);

  return (
    <div className="w-72 text-sm font-sans">
      <div
        className="px-3 py-2 rounded-t-lg text-white font-semibold flex items-center gap-2"
        style={{ backgroundColor: cfg.color }}
      >
        <span>{cfg.emoji}</span>
        <span className="truncate">{nombre}</span>
      </div>
      <div className="px-3 py-2 space-y-1 bg-white rounded-b-lg">
        {HEALTH_FIELDS.filter((f) => f.key !== 'NOMBRE').map((field) => {
          const val = formatValue(properties[field.key]);
          if (val === '—') return null;
          return (
            <div key={field.key} className="flex gap-2">
              <span className="text-gray-400 shrink-0 w-20 text-xs leading-5">{field.label}</span>
              <span className="text-gray-700 text-xs leading-5 font-medium">{titleCase(val)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CpobladoPopupProps {
  properties: CpobladoProperties;
}

export function CpobladoPopup({ properties: p }: CpobladoPopupProps) {
  return (
    <div className="w-60 text-sm font-sans">
      <div className="px-3 py-2 rounded-t-lg text-white font-semibold flex items-center gap-2 bg-violet-600">
        <span>🏘️</span>
        <span className="truncate">{formatValue(p.nombccpp)}</span>
      </div>
      <div className="px-3 py-2 space-y-1 bg-white rounded-b-lg">
        {[
          { label: 'Distrito', val: p.nombdist },
          { label: 'Provincia', val: p.nombprov },
          { label: 'Población', val: p.poblacion != null ? `${Number(p.poblacion).toLocaleString('es-PE')} hab.` : null },
          { label: 'Viviendas', val: p.totalviv != null ? `${Number(p.totalviv).toLocaleString('es-PE')}` : null },
          { label: 'Altitud', val: p.altitud != null ? `${p.altitud} m.s.n.m.` : null },
        ]
          .filter((r) => r.val != null && r.val !== '')
          .map((r) => (
            <div key={r.label} className="flex gap-2">
              <span className="text-gray-400 shrink-0 w-20 text-xs leading-5">{r.label}</span>
              <span className="text-gray-700 text-xs leading-5 font-medium">
                {titleCase(String(r.val))}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

export type { LayerType };
