# GeoSalud Tacna

Prototipo de visor geoespacial web para la **GEOTÓN Perú 2026**. Permite explorar la proximidad a establecimientos de salud dentro del departamento de Tacna a partir de cualquier punto seleccionado en el mapa.

> *¿Qué establecimientos de salud tengo más cerca de esta ubicación?*

---

## Funcionalidades

**Análisis de proximidad** — Al hacer clic sobre el mapa, se identifican los establecimientos más cercanos por tipo, se resaltan sobre el mapa, se dibujan líneas de distancia y el panel lateral muestra la lista ordenada por proximidad.

**Restricción geográfica** — Si el punto seleccionado está fuera del departamento de Tacna, no se ejecuta ningún cálculo y se muestra un aviso al usuario.

**Control de capas** — Hospitales, Centros de Salud, Puestos de Salud y Centros Poblados pueden activarse y desactivarse de forma independiente.

**Limpiar selección** — Elimina el marcador, las líneas y los resultados, volviendo al estado inicial.

---

## Datos

Fuente: **GEO IDEP** — [https://www.geoidep.gob.pe/](https://www.geoidep.gob.pe/)

Los datasets nacionales (Shapefile) fueron filtrados al departamento de Tacna y convertidos a GeoJSON.

| Archivo | Registros |
|---|---|
| `hospitales_tacna.geojson` | 4 |
| `centros_salud_tacna.geojson` | 50 |
| `puestos_salud_tacna.geojson` | 68 |
| `cpoblado_tacna.geojson` | 102 |

---

## Tecnologías

React 19 · TypeScript · Vite · Leaflet / React Leaflet · Tailwind CSS v4

---

## Instalación

```bash
npm install
npm run dev      # desarrollo → http://localhost:5173
npm run build    # producción → dist/
```