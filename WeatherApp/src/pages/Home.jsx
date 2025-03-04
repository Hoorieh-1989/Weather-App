import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import FavoriteLocations from '../components/FavoriteLocations';
import Header from '../components/Header';

import '../App.css';

const Home = () => {
  const [city, setCity] = useState('Stockholm');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Handle city search input
  const handleSearch = (e) => {
    setCity(e.target.value);
  };

  // Set the city to the selected favorite location
  const handleFavoriteClick = (location) => {
    setCity(location);
    reorderFavorites(location);
  };

  // Add city to favorites and save to localStorage
  const addFavorite = (location) => {
    if (!favorites.includes(location)) {
      const updatedFavorites = [location, ...favorites];  // Adds to the top
      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    }
  };

  // Remove city from favorites and update localStorage
  const removeFavorite = (location) => {
    const updatedFavorites = favorites.filter(fav => fav !== location);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  // Reorder favorites by moving the selected location to the top
  const reorderFavorites = (location) => {
    const updatedFavorites = [location, ...favorites.filter(fav => fav !== location)];
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  // Fetch weather and forecast data
  const fetchWeatherData = async (city) => {
    try {
      const res = await fetch(`https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${import.meta.env.VITE_API_KEY}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const currentWeather = data.data[0];
      const dailyForecast = getDailyForecast(data.data);

      // Update last updated time
      const currentTime = new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
      setLastUpdated(currentTime);

      return { 
        current: {
          ...currentWeather,
          temperature: currentWeather.temp,
          humidity: currentWeather.rh,
          temp_min: currentWeather.min_temp,
          temp_max: currentWeather.max_temp,
          sunrise: new Date(currentWeather.sunrise_ts * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
          sunset: new Date(currentWeather.sunset_ts * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          description: currentWeather.weather.description,
          icon: currentWeather.weather.icon
        },
        forecast: dailyForecast
      };
    } catch (err) {
      setError('Invalid city or API request failed: ' + err.message);
    }
  };

  // Convert valid_date (string) to a Date object
  const getDailyForecast = (data) => {
    return data.slice(1, 9).map(item => ({
      date: new Date(item.valid_date + "T00:00:00"),
      sunrise: new Date(item.sunrise_ts * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(item.sunset_ts * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      temp_min: item.min_temp || "N/A",
      temp_max: item.max_temp || "N/A",
      humidity: item.rh || "N/A",
      description: item.weather?.description || "N/A",
      icon: item.weather?.icon || "",
    }));
  };

  // Fetch data when the city changes
  useEffect(() => {
    const fetchData = async () => {
      if (!city.trim()) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWeatherData(city);
        if (data) {
          setWeather(data.current);
          setForecast(data.forecast);
        } else {
          setError('Failed to fetch weather data');
        }
      } catch (err) {
        setError('API request failed: ' + err.message);
      }
      setLoading(false);
    };
    fetchData();
  }, [city]);

  // Load favorites from localStorage when the component mounts
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(savedFavorites);
  }, []);

  return (
    <div className="home-container">
      <Header />
      <div className="head">
        <h1 className="city-name">{city}</h1>
        <SearchBar value={city} onChange={(e) => setCity(e.target.value)} />
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      {weather && (
        <div className="current-weather">
          <h3 className="current-temperature">
            {weather.temperature}°C
            <img
              src={`https://www.weatherbit.io/static/img/icons/${weather.icon}.png`}
              alt={weather.description}
              className="weather-icon"
            />
          </h3>
          <p className="weather-description">{weather.description}</p>
          <p className="weather-humidity">Humidity: {weather.humidity}%</p>
          <p className="weather-min-max">
            Min: {weather.temp_min}°C | Max: {weather.temp_max}°C
          </p>
          <p className="weather-sunrise-sunset">
            Sunrise: {weather.sunrise} | Sunset: {weather.sunset}
          </p>
          <p className="weather-last-updated">Last updated: {lastUpdated}</p>
          <button
            className="add-favorite-btn"
            onClick={() => addFavorite(city)}
            disabled={favorites.includes(city)}
          >
            {favorites.includes(city) ? 'Added to Favorites' : 'Add to Favorites'}
          </button>
        </div>
      )}

      <div className="forecast">
        <h3>Forecast for the next 8 days</h3>
        {forecast.length === 0 ? (
          <p>No forecast data available.</p>
        ) : (
          <div className="forecast-cards">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-card">
                <h4>{day.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</h4>
                <p>Min: {day.temp_min}°C | Max: {day.temp_max}°C</p>
                <p>Humidity: {day.humidity}%</p>
                <p>{day.description}</p>
                <img
                  src={`https://www.weatherbit.io/static/img/icons/${day.icon}.png`}
                  alt={day.description}
                  className="weather-icon"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="favorites">
        <h3>Favorite Locations</h3>
        <FavoriteLocations
          favorites={favorites}
          onFavoriteClick={handleFavoriteClick}
          removeFavorite={removeFavorite}
        />
      </div>
    </div>
  );
};

export default Home;
