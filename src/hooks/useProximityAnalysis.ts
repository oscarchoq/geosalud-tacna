import { useCallback } from 'react';
import { haversineKm, isInsideStudyArea } from '../utils/mapUtils';
import type { LayerData, AnalysisState, NearbyFacility, HealthFeatureProperties } from '../types';

const TOP_N = 5; // closest facilities per type

export function useProximityAnalysis(data: LayerData) {
  const analyze = useCallback(
    (lat: number, lon: number): AnalysisState => {
      if (!isInsideStudyArea(lat, lon)) {
        return { status: 'out_of_bounds' };
      }

      const nearby: NearbyFacility[] = [];
      const types = ['hospitales', 'centros', 'puestos'] as const;

      for (const type of types) {
        const layer = data[type];
        if (!layer) continue;

        const withDist = layer.features
          .map((f, idx) => {
            const [fLon, fLat] = f.geometry.coordinates;
            return {
              id: `${type}-${idx}`,
              type,
              distanceKm: haversineKm(lat, lon, fLat, fLon),
              lat: fLat,
              lon: fLon,
              properties: f.properties as HealthFeatureProperties,
            };
          })
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, TOP_N);

        nearby.push(...withDist);
      }

      // Sort all results by distance
      nearby.sort((a, b) => a.distanceKm - b.distanceKm);

      return {
        status: 'results',
        point: { lat, lon },
        nearby,
      };
    },
    [data]
  );

  return { analyze };
}
