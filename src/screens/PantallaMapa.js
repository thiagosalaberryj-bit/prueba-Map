import React, { useState, useRef, useEffect } from 'react';
import {
  View, TextInput, Text, FlatList, Alert,
  Modal, Keyboard, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import estilos from '../style';
import { MODOS, COLORES_MODOS, RADIOS, REGION_POR_DEFECTO } from '../constantes';
import { buscarDireccion, obtenerRuta } from '../api';

function MarcadorRuta({ punto, indice, total }) {
  const esPrimero = indice === 0;
  const esUltimo = indice === total - 1;
  const titulo = esPrimero ? 'Inicio' : esUltimo ? 'Fin' : `Parada ${indice}`;
  return (
    <Marker coordinate={punto.coordinate} title={titulo} pinColor="#34C759" />
  );
}

function ListaModal({ visible, cerrar, items, eliminar }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={estilos.overlay}>
        <View style={estilos.modal}>
          <View style={estilos.cabeceraModal}>
            <Text style={estilos.tituloModal}>Items ({items.length})</Text>
            <TouchableOpacity onPress={cerrar}>
              <Text style={estilos.botonCerrar}>✕</Text>
            </TouchableOpacity>
          </View>
          {items.length === 0 ? (
            <Text style={estilos.vacio}>Sin elementos aún.</Text>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={estilos.itemLista}>
                  <View style={estilos.contenidoItem}>
                    <Text style={estilos.tituloItem}>
                      {item.tipo === 'marcador' ? '📍' : item.tipo === 'ruta' ? '🛤️' : '⚠️'} {item.descripcion}
                    </Text>
                    {item.direccion && (
                      <Text style={estilos.subtituloItem} numberOfLines={1}>
                        {item.direccion}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => eliminar(item.tipo, item.id)}>
                    <Text style={estilos.botonEliminar}>🗑</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function PantallaMapa() {
  const [modo, setModo] = useState(MODOS.MARCADOR);
  const [marcadores, setMarcadores] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [puntosRuta, setPuntosRuta] = useState([]);
  const [radioZona, setRadioZona] = useState(500);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [cargandoRuta, setCargandoRuta] = useState(false);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
  const [grabando, setGrabando] = useState(false);
  const [coordsGrabadas, setCoordsGrabadas] = useState([]);

  const temporizadorBusqueda = useRef();
  const referenciaMapa = useRef();
  const suscripcionUbicacion = useRef();
  const trayectoGrabado = useRef([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const ubicacion = await Location.getCurrentPositionAsync({});
        setUbicacionUsuario(ubicacion.coords);
        referenciaMapa.current?.animateToRegion({
          latitude: ubicacion.coords.latitude,
          longitude: ubicacion.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    })();
  }, []);

  function manejarBusqueda(texto) {
    setTextoBusqueda(texto);
    clearTimeout(temporizadorBusqueda.current);
    if (texto.length < 3) {
      setResultadosBusqueda([]);
      return;
    }
    temporizadorBusqueda.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const datos = await buscarDireccion(texto);
        setResultadosBusqueda(datos || []);
      } catch {
        setResultadosBusqueda([]);
      }
      setBuscando(false);
    }, 500);
  }

  function seleccionarResultado(item) {
    const coordenada = {
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    };
    const direccion = item.display_name;

    if (modo === MODOS.MARCADOR) {
      setMarcadores((prev) => [
        ...prev,
        { id: Date.now().toString(), coordinate: coordenada, titulo: item.name || direccion.split(',')[0], direccion },
      ]);
    } else if (modo === MODOS.RUTA) {
      setPuntosRuta((prev) => [...prev, { coordinate: coordenada, direccion }]);
    } else {
      setZonas((prev) => [
        ...prev,
        { id: Date.now().toString(), center: coordenada, radius: radioZona, direccion },
      ]);
    }

    setTextoBusqueda('');
    setResultadosBusqueda([]);
    Keyboard.dismiss();
    referenciaMapa.current?.animateToRegion({ ...coordenada, latitudeDelta: 0.02, longitudeDelta: 0.02 });
  }

  function irAUbicacion() {
    if (!ubicacionUsuario) return;
    referenciaMapa.current?.animateToRegion({
      latitude: ubicacionUsuario.latitude,
      longitude: ubicacionUsuario.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }

  function agregarUbicacionActual() {
    if (!ubicacionUsuario) {
      Alert.alert('Sin ubicación', 'Activá el GPS');
      return;
    }
    const coordenada = { latitude: ubicacionUsuario.latitude, longitude: ubicacionUsuario.longitude };

    if (modo === MODOS.MARCADOR) {
      setMarcadores((prev) => [
        ...prev,
        { id: Date.now().toString(), coordinate: coordenada, titulo: `Marcador ${prev.length + 1}`, direccion: 'Mi ubicación' },
      ]);
    } else if (modo === MODOS.RUTA) {
      setPuntosRuta((prev) => [...prev, { coordinate: coordenada, direccion: 'Mi ubicación' }]);
    } else {
      setZonas((prev) => [
        ...prev,
        { id: Date.now().toString(), center: coordenada, radius: radioZona, direccion: 'Mi ubicación' },
      ]);
    }
  }

  async function toggleGrabacion() {
    if (grabando) {
      if (suscripcionUbicacion.current) {
        suscripcionUbicacion.current.remove();
        suscripcionUbicacion.current = null;
      }
      setGrabando(false);
      const trayecto = trayectoGrabado.current;
      if (trayecto.length > 1) {
        setRutas((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            coordinates: trayecto.map((c) => ({ latitude: c.latitude, longitude: c.longitude })),
            distancia: 0,
            duracion: 0,
          },
        ]);
        Alert.alert('Guardado', `${trayecto.length} puntos registrados`);
      }
      trayectoGrabado.current = [];
      setCoordsGrabadas([]);
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado');
        return;
      }
      trayectoGrabado.current = [];
      setCoordsGrabadas([]);
      setGrabando(true);
      suscripcionUbicacion.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
        (ubicacion) => {
          trayectoGrabado.current = [...trayectoGrabado.current, ubicacion.coords];
          setCoordsGrabadas([...trayectoGrabado.current]);
        },
      );
    }
  }

  function presionLarga(evento) {
    const coordenada = evento.nativeEvent.coordinate;
    if (modo === MODOS.MARCADOR) {
      setMarcadores((prev) => [
        ...prev,
        { id: Date.now().toString(), coordinate: coordenada, titulo: `Marcador ${prev.length + 1}`, direccion: `${coordenada.latitude.toFixed(4)}, ${coordenada.longitude.toFixed(4)}` },
      ]);
    } else if (modo === MODOS.RUTA) {
      setPuntosRuta((prev) => [...prev, { coordinate: coordenada, direccion: `${coordenada.latitude.toFixed(4)}, ${coordenada.longitude.toFixed(4)}` }]);
    } else if (modo === MODOS.ZONA) {
      setZonas((prev) => [
        ...prev,
        { id: Date.now().toString(), center: coordenada, radius: radioZona, direccion: `${coordenada.latitude.toFixed(4)}, ${coordenada.longitude.toFixed(4)}` },
      ]);
    }
  }

  async function fetchRuta() {
    if (puntosRuta.length < 2) {
      Alert.alert('Error', 'Agregá al menos 2 puntos');
      return;
    }
    setCargandoRuta(true);
    try {
      const pts = puntosRuta.map((p) => ({ latitude: p.coordinate.latitude, longitude: p.coordinate.longitude }));
      const resultado = await obtenerRuta(pts);
      const coordenadas = resultado.geometry.coordinates.map((c) => ({ latitude: c[1], longitude: c[0] }));
      setRutas((prev) => [
        ...prev,
        { id: Date.now().toString(), coordinates: coordenadas, distancia: resultado.distance, duracion: resultado.duration },
      ]);
      setPuntosRuta([]);
    } catch (e) {
      Alert.alert('Error de ruta', e.message || 'Falló');
    }
    setCargandoRuta(false);
  }

  function limpiarTodo() {
    Alert.alert('Limpiar todo', '¿Borrar todo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpiar',
        style: 'destructive',
        onPress: () => {
          setMarcadores([]);
          setRutas([]);
          setZonas([]);
          setPuntosRuta([]);
          if (grabando) toggleGrabacion();
          trayectoGrabado.current = [];
          setCoordsGrabadas([]);
        },
      },
    ]);
  }

  function eliminarItem(tipo, id) {
    if (tipo === 'marcador') setMarcadores((p) => p.filter((m) => m.id !== id));
    if (tipo === 'ruta') setRutas((p) => p.filter((r) => r.id !== id));
    if (tipo === 'zona') setZonas((p) => p.filter((z) => z.id !== id));
  }

  const itemsLista = [
    ...marcadores.map((m) => ({ ...m, tipo: 'marcador', descripcion: m.titulo })),
    ...rutas.map((r) => ({
      ...r,
      tipo: 'ruta',
      descripcion: `Ruta${r.distancia ? ' ' + (r.distancia / 1000).toFixed(1) + 'km' : ' (grabada)'}`,
    })),
    ...zonas.map((z) => ({ ...z, tipo: 'zona', descripcion: `Zona ${z.radius}m` })),
  ];

  const textoInfo =
    modo === MODOS.MARCADOR ? '🔍 Buscá dirección, mantené presionado, o usá GPS'
    : modo === MODOS.RUTA ? '🔍 Buscá direcciones o usá GPS para agregar paradas'
    : '🔍 Buscá dirección, mantené presionado, o usá GPS';

  const textoBotonGps =
    modo === MODOS.MARCADOR ? '📍 Agregar mi ubicación'
    : modo === MODOS.RUTA ? '🎯 Agregar punto actual'
    : '⚠️ Zona en mi ubicación';

  return (
    <View style={estilos.contenedor}>
      <StatusBar style="dark" />

      <MapView
        ref={referenciaMapa}
        style={estilos.mapa}
        initialRegion={REGION_POR_DEFECTO}
        onLongPress={presionLarga}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {marcadores.map((m) => (
          <Marker key={m.id} coordinate={m.coordinate} title={m.titulo} description={m.direccion} />
        ))}
        {rutas.map((r) => (
          <Polyline key={r.id} coordinates={r.coordinates} strokeColor="#34C759" strokeWidth={4} />
        ))}
        {zonas.map((z) => (
          <Circle key={z.id} center={z.center} radius={z.radius} fillColor="rgba(255,59,48,0.2)" strokeColor="#FF3B30" strokeWidth={2} />
        ))}
        {puntosRuta.map((punto, indice) => (
          <MarcadorRuta key={`rp-${indice}`} punto={punto} indice={indice} total={puntosRuta.length} />
        ))}
        {coordsGrabadas.length > 1 && (
          <Polyline coordinates={coordsGrabadas.map((c) => ({ latitude: c.latitude, longitude: c.longitude }))} strokeColor="#FF9500" strokeWidth={5} />
        )}
      </MapView>

      <View style={estilos.buscador}>
        <View style={estilos.barraBusqueda}>
          <TextInput
            style={estilos.inputBusqueda}
            placeholder="Buscar dirección..."
            placeholderTextColor="#999"
            value={textoBusqueda}
            onChangeText={manejarBusqueda}
          />
          {buscando && <ActivityIndicator style={estilos.spinnerBusqueda} />}
        </View>
        {resultadosBusqueda.length > 0 && (
          <View style={estilos.resultados}>
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={resultadosBusqueda}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => seleccionarResultado(item)} style={estilos.itemResultado}>
                  <Text style={estilos.textoResultado} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      <View style={estilos.barraInfo}>
        <Text style={estilos.textoInfo}>{textoInfo}</Text>
      </View>

      <TouchableOpacity onPress={irAUbicacion} style={estilos.botonUbicacion}>
        <Text style={estilos.iconoUbicacion}>📍</Text>
      </TouchableOpacity>

      <View style={estilos.fondo}>
        <TouchableOpacity
          onPress={agregarUbicacionActual}
          style={[estilos.botonGps, { backgroundColor: 'rgba(0,122,255,0.85)' }]}
        >
          <Text style={estilos.textoBotonGps}>{textoBotonGps}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleGrabacion}
          style={[
            estilos.botonGps,
            grabando && { backgroundColor: 'rgba(255,59,48,0.85)' },
            !grabando && { backgroundColor: 'rgba(255,149,0,0.85)' },
          ]}
        >
          <Text style={estilos.textoBotonGps}>
            {grabando ? '⏹ Detener grabación' : '⏺ Grabar ruta'}
          </Text>
        </TouchableOpacity>

        <View style={estilos.barraModos}>
          {Object.entries(MODOS).map(([clave, valor]) => (
            <TouchableOpacity
              key={clave}
              onPress={() => { setModo(valor); setPuntosRuta([]); }}
              style={[estilos.botonModo, modo === valor && { backgroundColor: COLORES_MODOS[clave] }]}
            >
              <Text style={[estilos.textoModo, modo === valor && estilos.textoModoActivo]}>
                {{ MARCADOR: '📍 Marcador', RUTA: '🛤️ Ruta', ZONA: '⚠️ Zona' }[clave]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {modo === MODOS.RUTA && puntosRuta.length > 0 && (
          <View style={estilos.contenedorRuta}>
            <Text style={estilos.textoPuntos}>📍 {puntosRuta.length} pts</Text>
            {puntosRuta.length >= 2 && (
              <TouchableOpacity onPress={fetchRuta} style={estilos.botonObtenerRuta}>
                {cargandoRuta ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={estilos.textoObtenerRuta}>🚗 Obtener ruta</Text>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setPuntosRuta([])}>
              <Text style={estilos.textoLimpiarRuta}>Limpiar</Text>
            </TouchableOpacity>
          </View>
        )}

        {modo === MODOS.ZONA && (
          <View style={estilos.contenedorRadio}>
            <Text style={estilos.textoRadioActual}>{radioZona}m</Text>
            {RADIOS.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRadioZona(r)}
                style={[estilos.botonRadio, radioZona === r && estilos.botonRadioActivo]}
              >
                <Text style={[estilos.textoRadio, radioZona === r && estilos.textoRadioActivo]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={estilos.filaAcciones}>
          <TouchableOpacity onPress={() => setMostrarLista(true)} style={estilos.botonAccion}>
            <Text style={estilos.textoAccion}>📋 {itemsLista.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={limpiarTodo} style={[estilos.botonAccion, estilos.botonAccionRojo]}>
            <Text style={estilos.textoAccionRojo}>🗑 Limpiar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ListaModal
        visible={mostrarLista}
        cerrar={() => setMostrarLista(false)}
        items={itemsLista}
        eliminar={eliminarItem}
      />
    </View>
  );
}
