require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

let weatherCache = { expiresAt: 0, value: null };

app.get('/api/weather', async (_request, response) => {
  if (!process.env.METEOSOURCE_API_KEY) {
    return response.status(503).json({
      error: 'El clima no esta configurado en el servidor',
    });
  }

  if (weatherCache.value && weatherCache.expiresAt > Date.now()) {
    return response.json(weatherCache.value);
  }

  try {
    const weatherResponse = await fetch(
      'https://www.meteosource.com/api/v1/free/point?lat=-34.6037&lon=-58.3816&sections=current&timezone=America%2FArgentina%2FBuenos_Aires&language=en&units=metric',
      {
        headers: {
          'X-API-Key': process.env.METEOSOURCE_API_KEY,
        },
      }
    );

    const weather = await weatherResponse.json();

    if (!weatherResponse.ok) {
      return response.status(weatherResponse.status).json({
        error: weather.detail || 'No se pudo consultar el clima',
      });
    }

    const result = {
      icon: weather.current?.icon_num ?? 1,
      summary: weather.current?.summary || 'Weather unavailable',
      temperature: weather.current?.temperature ?? null,
    };

    weatherCache = {
      value: result,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    return response.json(result);
  } catch (error) {
    console.error('Error al consultar el clima:', error);
    return response.status(502).json({
      error: 'No se pudo consultar el servicio meteorologico',
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`API lista en el puerto ${port}`);
});