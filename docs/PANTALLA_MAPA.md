# PantallaMapa.js — El corazón de la app

Archivo: `src/screens/PantallaMapa.js`

Es un solo componente que maneja **todo**: el mapa, los botones, la búsqueda, el GPS y la lista.

## 1. Estado (useState)

Son las "variables" que cambian cuando el usuario interactúa:

```js
modo                → "MARCADOR" | "RUTA" | "ZONA"  ← modo activo
marcadores          → []  ← lista de marcadores en el mapa
rutas               → []  ← lista de rutas dibujadas
zonas               → []  ← lista de zonas de riesgo
puntosRuta          → []  ← puntos temporales mientras se arma una ruta
radioZona           → 500 ← radio de la zona en metros
textoBusqueda       → ""  ← lo que el usuario escribe en el buscador
resultadosBusqueda  → []  ← resultados de la búsqueda
ubicacionUsuario    → { lat, lon } ← posición GPS actual
grabando            → false ← si está grabando un recorrido
```

## 2. Referencias (useRef)

```js
temporizadorBusqueda  → controla el delay de 500ms al buscar
referenciaMapa       → referencia directa al MapView (para animar, centrar)
suscripcionUbicacion → la conexión con el GPS (para detenerla)
trayectoGrabado      → puntos grabados (usando ref para no perder datos)
```

## 3. useEffect

Se ejecuta **una vez** al abrir la app:

```
1. Pide permiso de ubicación al usuario
2. Si concede → obtiene la ubicación actual
3. Guarda la ubicación y anima el mapa hacia allí
```

## 4. Funciones principales

| Función | Disparador | Qué hace |
|---|---|---|
| `manejarBusqueda` | Usuario escribe en el buscador | Espera 500ms, llama a `buscarDireccion()` y muestra resultados |
| `seleccionarResultado` | Usuario toca un resultado | Agrega un marcador/ruta/zona según el modo activo |
| `agregarUbicacionActual` | Botón "Agregar mi ubicación" | Toma la ubicación GPS y la agrega como marcador/ruta/zona |
| `toggleGrabacion` | Botón "Grabar ruta" | Inicia o detiene la grabación GPS del recorrido |
| `fetchRuta` | Botón "Obtener ruta" | Toma los puntos, llama a OSRM y dibuja la ruta por calles |
| `presionLarga` | Usuario mantiene presionado el mapa | Agrega marcador o zona en esa posición |
| `limpiarTodo` | Botón "Limpiar" | Borra todos los elementos con confirmación |
| `eliminarItem` | Usuario toca 🗑 en la lista | Borra un elemento específico |

## 5. Componentes auxiliares

### `MarcadorRuta`
```jsx
<MarcadorRuta punto={punto} indice={i} total={puntosRuta.length} />
```
Muestra un pin verde en cada punto de la ruta. El título cambia según si es "Inicio", "Fin" o "Parada N".

### `ListaModal`
```jsx
<ListaModal visible={mostrarLista} cerrar={fn} items={itemsLista} eliminar={fn} />
```
Ventana que se desliza desde abajo mostrando todos los elementos con su tipo (📍, 🛤️, ⚠️).

## 6. Renderizado (JSX)

El `return` del componente tiene esta estructura:

```
<View contenedor>
  <StatusBar />
  <MapView>                          ← el mapa en sí
    <Marker /> para cada marcador
    <Polyline /> para cada ruta
    <Circle /> para cada zona
    <MarcadorRuta /> para puntos de ruta temporales
    <Polyline /> para grabación en curso
  </MapView>
  
  <Buscador>                         ← barra de búsqueda arriba
  <InfoBar>                          ← texto informativo
  <BotonUbicacion>                   ← botón "📍" para centrar en GPS
  
  <Fondo>                            ← botones en la parte de abajo
    <BotonGPS>   ← "Agregar mi ubicación"
    <BotonGrabar> ← "Grabar ruta"
    <BarraModos> ← Marcador / Ruta / Zona
    <ControlesRuta> o <ControlesRadio>  ← según el modo
    <AccionesLista> ← "📋 N" y "🗑 Limpiar"
  </Fondo>
  
  <ListaModal>                       ← modal con la lista de elementos
</View>
```
