export type LayerType = 'hospitales' | 'centros' | 'puestos' | 'cpoblado';

export interface HealthFeatureProperties {
  NOMBRE?: string;
  CLASIFICAC?: string;
  TIPO_ESTAB?: string;
  DEPARTAMEN?: string;
  PROVINCIA?: string;
  DISTRITO?: string;
  DIRECCION?: string;
  CATEGORIA?: string;
  TELEFONO?: string;
  HORARIO?: string;
  ESTADO?: string;
  CONDICION?: string;
  NOM_DPTO?: string;
  NOM_PROV?: string;
  NOM_DIST?: string;
  INSTITUCIO?: string;
  COD_IPRESS?: string;
  MICRORED?: string;
  RED?: string;
  [key: string]: string | number | null | undefined;
}

export interface CpobladoProperties {
  nombccpp?: string;
  area?: number;
  ubigeo?: string;
  codccpp?: string;
  nombdep?: string;
  nombprov?: string;
  nombdist?: string;
  latitud?: number;
  longitud?: number;
  totalviv?: number;
  altitud?: number;
  poblacion?: number;
  [key: string]: string | number | null | undefined;
}

export interface GeoFeature<P = HealthFeatureProperties> {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: P;
}

export interface GeoJSON<P = HealthFeatureProperties> {
  type: 'FeatureCollection';
  features: GeoFeature<P>[];
}

export interface LayerState {
  hospitales: boolean;
  centros: boolean;
  puestos: boolean;
  cpoblado: boolean;
}

export interface LayerData {
  hospitales: GeoJSON<HealthFeatureProperties> | null;
  centros: GeoJSON<HealthFeatureProperties> | null;
  puestos: GeoJSON<HealthFeatureProperties> | null;
  cpoblado: GeoJSON<CpobladoProperties> | null;
}

export interface Stats {
  hospitales: number;
  centros: number;
  puestos: number;
  poblacionTotal: number;
  distritos: string[];
}

// ---- Proximity analysis types ----

export interface SelectedPoint {
  lat: number;
  lon: number;
}

export interface NearbyFacility {
  id: string;
  type: 'hospitales' | 'centros' | 'puestos';
  distanceKm: number;
  lat: number;
  lon: number;
  properties: HealthFeatureProperties;
}

export type AnalysisState =
  | { status: 'idle' }
  | { status: 'out_of_bounds' }
  | { status: 'results'; point: SelectedPoint; nearby: NearbyFacility[] };
