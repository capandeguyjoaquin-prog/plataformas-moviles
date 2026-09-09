# Plataformas moviles

## Base de datos y API

1. Ejecuta en MySQL el contenido de `backend/schema.sql` despues de crear `plataformas_moviles` y la tabla `ranking`.
2. Copia `backend/.env.example` como `backend/.env` y completa las credenciales de MySQL. El archivo `.env` es obligatorio si tu usuario root tiene contraseña.
3. Instala y levanta la API:

```powershell
cd backend
npm install
npm start
```

4. Para Expo, define la direccion de la computadora que ejecuta la API. En el mismo equipo puedes usar `http://localhost:3000`; desde un telefono usa la IP local, por ejemplo:

```powershell
$env:EXPO_PUBLIC_API_URL="http://192.168.1.20:3000"
npm start
```

La app permite registrar/iniciar sesion y envia automaticamente el puntaje al endpoint protegido cuando termina una partida. El valor por defecto de la app apunta a `10.0.20.203`; si cambia la IP de tu Wi-Fi, define `EXPO_PUBLIC_API_URL` y reinicia Expo.