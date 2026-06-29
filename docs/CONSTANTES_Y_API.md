# 🔧 constantes.js y api.js

## `src/constantes.js`

Define valores fijos que se usan en toda la app:

```js
MODOS         → { MARCADOR, RUTA, ZONA }  // Los 3 modos de la app
COLORES_MODOS → azul, verde, rojo          // Color de cada modo
RADIOS        → [100, 200, 500, 1000, 2000] // Radios de zona en metros
URLS          → URLs de Nominatim y OSRM   // APIs gratuitas
REGION_POR_DEFECTO → coordenadas iniciales // Buenos Aires
```

## `src/api.js`

Dos funciones que se comunican con servidores externos:

### `buscarDireccion(texto)`
- **Qué hace**: Toma un texto ("Av. Corrientes 1234") y devuelve coordenadas (lat, lon).
- **Cómo**: Llama a **Nominatim** (OpenStreetMap), una API pública y gratuita.
- **Respuesta**: Array de resultados con `{ lat, lon, display_name }`.

### `obtenerRuta(puntos)`
- **Qué hace**: Toma 2+ puntos y devuelve una ruta que **sigue las calles**.
- **Cómo**: Llama a **OSRM** (Open Source Routing Machine), API gratuita.
- **Respuesta**: Un objeto con `geometry.coordinates` (array de [lon, lat]).

> Ambas funciones requieren internet. Si fallan, la app muestra un cartel de error.
