# Plataformas moviles

## Base de datos y API

1. Crea la base de datos `plataformas_moviles` en MySQL y ejecuta `backend/schema.sql`. El script crea las tablas `usuarios` y `ranking` (conectada a los usuarios mediante `usuario_id`).
   Si ya tenias creada la tabla `ranking`, ejecuta una vez esta migracion en MySQL Workbench para conservar solo el mejor puntaje de cada jugador y evitar duplicados:

```sql
USE plataformas_moviles;
SET SQL_SAFE_UPDATES = 0;

DELETE anterior
FROM ranking AS anterior
JOIN ranking AS mayor
  ON mayor.usuario_id = anterior.usuario_id
 AND (
      mayor.puntaje > anterior.puntaje
      OR (mayor.puntaje = anterior.puntaje AND mayor.id < anterior.id)
 );

ALTER TABLE ranking
ADD UNIQUE KEY uq_ranking_usuario (usuario_id);

SET SQL_SAFE_UPDATES = 1;
```

   Luego reinicia el backend para que guarde el puntaje maximo en la fila existente.
2. Copia `backend/.env.example` como `backend/.env` y completa las credenciales de MySQL. El archivo `.env` es obligatorio si tu usuario root tiene contraseña.
3. Agrega tu clave de Meteosource en `backend/.env` como `METEOSOURCE_API_KEY=...`. La app consulta el clima actual de Buenos Aires al iniciar el juego, cambia la tonalidad del fondo según el código meteorológico y usa el fondo nocturno entre las 18:00 y las 06:00.
4. Instala y levanta la API:

```powershell
cd backend
npm install
npm start
```

5. Para Expo, define la direccion de la computadora que ejecuta la API. En el mismo equipo puedes usar `http://localhost:3000`; desde un telefono usa la IP local, por ejemplo:

```powershell
$env:EXPO_PUBLIC_API_URL="http://192.168.1.20:3000"
npm start
```

La app permite registrar/iniciar sesion y envia automaticamente el puntaje al endpoint protegido cuando termina una partida. El ranking consulta los puntajes guardados en MySQL y carga mas filas al desplazarse hasta el final. Si cambia la IP de tu Wi-Fi, define `EXPO_PUBLIC_API_URL` con la direccion del servidor y reinicia Expo.

## Crear APK para Android

1. Instala EAS CLI si aun no esta instalado: `npm install -g eas-cli`.
2. Inicia sesion con tu cuenta de Expo: `eas login`.
3. Desde la carpeta del proyecto, ejecuta `npm run build:apk`. Si EAS lo solicita, configura el proyecto con `eas build:configure`.
4. Al terminar la compilacion, descarga el APK desde el enlace que muestra EAS e instalalo en el dispositivo Android.

El perfil `preview` de `eas.json` genera un APK instalable. Para que el ranking y el guardado de puntajes funcionen, el APK necesita conectarse a la API: configura `EXPO_PUBLIC_API_URL` con una direccion accesible desde el telefono (no `localhost`) y deja el backend en ejecucion.