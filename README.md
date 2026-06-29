# SafeBike — SafeBike

Demo de un sistema de seguridad y rastreo para bicicletas. La app usa el GPS del celular para **marcar ubicaciones, dibujar rutas y definir zonas de riesgo** en un mapa interactivo.

## Cómo ejecutar

```sh
npx expo start -c --tunnel
```

Escaneá el QR con **Expo Go** (Android/iOS). Con `--tunnel` podés usar datos móviles.

## Funcionalidades

| Modo | Descripción |
|---|---|
| **Marcador** | Buscá una dirección o mantené presionado el mapa para marcar un punto |
| **Ruta** | Agregá puntos de origen/destino y obtené la ruta por calles (OSRM) |
| **Zona** | Marcá una zona de riesgo con radio ajustable (100-2000m) |
| **Grabar ruta** | Activá la grabación GPS para registrar tu recorrido en tiempo real |
| **Lista** | Revisá y eliminá todos los elementos guardados |

## APIs gratuitas usadas

- **Nominatim** (OpenStreetMap) — geocoding de direcciones
- **OSRM** — cálculo de rutas por calles

## Estructura del proyecto

```
src/
├── screens/
│   └── PantallaMapa.js      → Lógica principal del mapa
├── estilos/
│   └── index.js              → Todos los estilos
├── constantes.js              → Configuración (modos, radios, URLs)
└── api.js                     → Llamadas a Nominatim y OSRM
```

> Ver `docs/` para documentación detallada de cada archivo.
