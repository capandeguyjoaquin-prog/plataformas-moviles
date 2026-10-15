# Plataformas moviles

## Base de datos y API

1. Crea la base de datos `plataformas_moviles` en MySQL y ejecuta `backend/schema.sql`. El script crea las tablas `usuarios` y `ranking` (conectada a los usuarios mediante `usuario_id`).
2. Copia `backend/.env.example` como `backend/.env` y completa las credenciales de MySQL. El archivo `.env` es obligatorio si tu usuario root tiene contraseña.
3. Agrega tu clave de Meteosource en `backend/.env` como `METEOSOURCE_API_KEY=...`. La app consulta el clima actual de Buenos Aires al iniciar el juego y cambia la tonalidad del fondo según el código meteorológico.
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