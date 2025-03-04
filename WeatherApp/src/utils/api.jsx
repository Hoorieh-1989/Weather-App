import axios from 'axios';

const apiKey = import.meta.env.VITE_API_KEY;  // Access API key from environment variable

export const fetchWeatherData = async (city) => {
  try {
    // Use the correct API key from the environment variable
    const res = await fetch(`https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${apiKey}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const currentWeather = data.data[0];
    const forecastData = data.data.slice(1, 6);

    return {
      current: {
        temperature: currentWeather.temp,
        description: currentWeather.weather.description,
        humidity: currentWeather.rh,
        city: city,
        sunrise: new Date(currentWeather.sunrise * 1000).toLocaleTimeString(), // Ensure correct date format
        sunset: new Date(currentWeather.sunset * 1000).toLocaleTimeString(), // Ensure correct date format
        icon: currentWeather.weather.icon,
      },
      forecast: forecastData.map((item) => ({
        date: new Date(item.timestamp_local * 1000).toLocaleDateString('en-GB', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short',
          year: 'numeric'
        }), // Ensure the timestamp is converted to milliseconds
        temp_min: item.min_temp,
        temp_max: item.max_temp,
        description: item.weather.description,
        icon: item.weather.icon
      }))
    };
  } catch (err) {
    console.error('Error fetching weather data:', err);
    throw err;
  }
};
