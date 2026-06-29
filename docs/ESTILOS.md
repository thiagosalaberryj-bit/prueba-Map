# Sistema de estilos

Archivo: `src/estilos/index.js`

Todos los estilos están en un solo `StyleSheet.create({...})`. Después se importan como:

```js
import estilos from '../estilos';
```

Y se usan así: `style={estilos.contenedor}`, `style={estilos.mapa}`, etc.

## Estructura de los estilos

| Nombre | ¿Qué es? |
|---|---|
| `contenedor` | View principal que ocupa toda la pantalla |
| `mapa` | El MapView, ocupa todo el espacio |
| `buscador / barraBusqueda / inputBusqueda` | Search bar arriba |
| `resultados / itemResultado / textoResultado` | Dropdown de resultados |
| `barraInfo / textoInfo` | Texto informativo que cambia según el modo |
| `botonUbicacion / iconoUbicacion` | Botón "📍" para centrar en GPS |
| `fondo` | View que contiene todos los botones de abajo |
| `botonGps / textoBotonGps` | Botón azul "Agregar mi ubicación" |
| `barraModos / botonModo / textoModo` | Selector de modo (Marcador/Ruta/Zona) |
| `contenedorRuta / botonObtenerRuta` | Controles de ruta (aparecen solo en modo Ruta) |
| `contenedorRadio / botonRadio / textoRadio` | Selector de radio (aparece solo en modo Zona) |
| `overlay / modal / cabeceraModal / tituloModal` | Modal de la lista de elementos |
| `itemLista / contenidoItem / tituloItem / subtituloItem / botonEliminar` | Items dentro de la lista |
| `filaAcciones / botonAccion / textoAccion` | Botones "📋 N" y "🗑 Limpiar" |

## Cómo se aplican los colores por modo

Los colores no están en los estilos, se pasan **inline** desde `constantes.js`:

```jsx
style={[estilos.botonModo, modo === 'MARCADOR' && { backgroundColor: COLORES_MODOS.MARCADOR }]}
```

Colores:
- **Marcador** → `#007AFF` (azul)
- **Ruta** → `#34C759` (verde)
- **Zona** → `#FF3B30` (rojo)
