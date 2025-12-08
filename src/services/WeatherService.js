const API_KEY = "62b7a288f3324fbb8b711132250812";
const BASE = "https://api.weatherapi.com/v1";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return await res.json();
}

function buildURL(endpoint, params) {
  return `${BASE}/${endpoint}?key=${API_KEY}&${params}`;
}

export async function getCurrentWeather(loc) {
  const url = buildURL("current.json", `q=${encodeURIComponent(loc)}`);
  return await fetchJSON(url);
}

export async function getHourlyForecast(loc) {
  const url = buildURL("forecast.json",
    `q=${encodeURIComponent(loc)}&days=1&aqi=no&alerts=no`
  );
  const data = await fetchJSON(url);
  return data.forecast.forecastday[0].hour;
}

export async function getFiveDayForecast(loc) {
  const url = buildURL("forecast.json",
    `q=${encodeURIComponent(loc)}&days=5&aqi=no&alerts=no`
  );
  const data = await fetchJSON(url);
  return data.forecast.forecastday;
}