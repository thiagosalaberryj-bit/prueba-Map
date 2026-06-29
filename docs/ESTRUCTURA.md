# Estructura del proyecto

```
prueba-Map/
├── index.js              ← Punto de entrada. Registra la App en Expo.
├── App.js                ← Solo renderiza <PantallaMapa/> (3 líneas).
├── app.json              ← Configuración de Expo (nombre, icono, etc.).
├── package.json          ← Dependencias y scripts.
│
├── src/
│   ├── screens/
│   │   └── PantallaMapa.js   ← Toda la lógica del mapa.
│   ├── estilos/
│   │   └── index.js          ← Todos los StyleSheet (sin lógica).
│   ├── constantes.js         ← Modos, colores, radios, URLs de APIs.
│   └── api.js                ← Funciones para llamar a Nominatim y OSRM.
│
├── docs/                 ← Esta documentación.
├── assets/               ← Imágenes (icono, splash).
└── node_modules/         ← Dependencias instaladas (no tocar).
```

## Flujo de ejecución

```
index.js
  └── importa App.js
        └── App.js renderiza <PantallaMapa />
              ├── PantallaMapa.js → usa constantes.js (modos, radios)
              ├── PantallaMapa.js → usa api.js (buscarDireccion, obtenerRuta)
              └── PantallaMapa.js → usa estilos/index.js (diseño visual)
```
