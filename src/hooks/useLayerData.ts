import { useState, useEffect } from 'react';
import type { LayerData } from '../types';

export function useLayerData(): { data: LayerData; loading: boolean; error: string | null } {
  const [data, setData] = useState<LayerData>({
    hospitales: null,
    centros: null,
    puestos: null,
    cpoblado: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const files: Array<{ key: keyof LayerData; path: string }> = [
      { key: 'hospitales', path: '/data/hospitales_tacna.geojson' },
      { key: 'centros', path: '/data/centros_salud_tacna.geojson' },
      { key: 'puestos', path: '/data/puestos_salud_tacna.geojson' },
      { key: 'cpoblado', path: '/data/cpoblado_tacna.geojson' },
    ];

    Promise.all(
      files.map(({ key, path }) =>
        fetch(path)
          .then((r) => r.json())
          .then((json) => ({ key, json }))
          .catch(() => ({ key, json: null }))
      )
    )
      .then((results) => {
        const next: LayerData = { hospitales: null, centros: null, puestos: null, cpoblado: null };
        for (const { key, json } of results) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          next[key] = json as any;
        }
        setData(next);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar los datos geoespaciales.');
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
