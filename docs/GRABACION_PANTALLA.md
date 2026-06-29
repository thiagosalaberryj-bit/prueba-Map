# Grabación y uso compartido de pantalla

## Problema

Al grabar la pantalla de la app con la grabadora de Android, o al compartir pantalla
por Google Meet / AnyDesk, aparecía un mensaje indicando que el contenido estaba oculto
por motivos de seguridad.

## Causa

El flag `FLAG_SECURE` de Android estaba siendo aplicado a la ventana de la app.
Este flag impide que el contenido de la ventana aparezca en capturas de pantalla,
grabaciones de pantalla, y uso compartido de pantalla (screen sharing).

El flag no estaba siendo seteado explícitamente por ninguna librería del proyecto,
pero el runtime nativo de Expo (especialmente en Expo Go) lo aplica internamente.

## Solución

### 1. Instalar `expo-screen-capture`

Se agregó la dependencia `expo-screen-capture`, que expone funciones nativas para
controlar `FLAG_SECURE` desde JavaScript:

```bash
npx expo install expo-screen-capture
```

### 2. `allowScreenCaptureAsync()` al iniciar

En `App.js` se importó y llamó `allowScreenCaptureAsync()` al montar el componente
principal, para limpiar `FLAG_SECURE` de la ventana:

```js
import { allowScreenCaptureAsync } from 'expo-screen-capture';

useEffect(() => {
  allowScreenCaptureAsync().catch(() => {});
  // ...
}, []);
```

### 3. `AppState` listener para re-aplicar al volver al frente

Se agregó un listener de `AppState` que vuelve a llamar `allowScreenCaptureAsync()`
cada vez que la app pasa a estado `active`. Esto cubre los casos en los que Android
re-aplica `FLAG_SECURE` al reconstruir la Activity (por ejemplo, al volver de una
llamada de Meet o después de aceptar el permiso de superposición):

```js
useEffect(() => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      allowScreenCaptureAsync().catch(() => {});
    }
  });
  allowScreenCaptureAsync().catch(() => {});
  // ...
  return () => subscription.remove();
}, []);
```

## Archivos modificados

- `App.js` — import de `allowScreenCaptureAsync`, llamado en `useEffect`, y listener
  de `AppState`

## Dependencias agregadas

- `expo-screen-capture`

## Resultado

- Grabación de pantalla con la grabadora nativa de Android: funciona
- Compartir pantalla en Google Meet: funciona
- Compartir pantalla en AnyDesk: no funciona (el problema está del lado de
  AnyDesk, no de la app. Ver nota abajo.)

## Nota sobre AnyDesk

AnyDesk en Android tiene limitaciones propias con el uso compartido de pantalla
en dispositivos modernos. Para que funcione, requiere:

1. Activar el **Servicio de Accesibilidad** de AnyDesk (Ajustes → Accesibilidad)
2. Permitir **"Dibujar sobre otras apps"** para AnyDesk
3. En algunos dispositivos, desactivar optimizaciones de batería

Como Google Meet funciona correctamente, se confirma que `FLAG_SECURE` está
limpiado y el problema es específico de AnyDesk.
