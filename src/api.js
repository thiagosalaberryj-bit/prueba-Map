import { URLS, HEADERS_API } from './constantes';

export async function buscarDireccion(texto) {
  if (texto.length < 3) return [];
  const url = `${URLS.NOMINATIM}?q=${encodeURIComponent(texto)}&format=json&limit=5&addressdetails=1`;
  const respuesta = await fetch(url, { headers: HEADERS_API });
  if (!respuesta.ok) throw new Error(`Error Nominatim: ${respuesta.status}`);
  return respuesta.json();
}

export async function obtenerRuta(puntos) {
  if (puntos.length < 2) throw new Error('Se necesitan al menos 2 puntos');
  const coordenadas = puntos
    .map((p) => `${p.longitude},${p.latitude}`)
    .join(';');
  const url = `${URLS.OSRM}/${coordenadas}?geometries=geojson&overview=full`;
  const respuesta = await fetch(url, { headers: HEADERS_API });
  if (!respuesta.ok) throw new Error(`Error OSRM: ${respuesta.status}`);
  const datos = await respuesta.json();
  if (!datos.routes?.length) throw new Error('No se encontró ruta');
  return datos.routes[0];
}
