<template>
  <!-- Background Wraper (responsive) -->
  <div class="relative min-h-screen overflow-hidden">

    <!-- Low-Resolution Background (shows first) -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
      :style="{
        backgroundImage: `url(${lowResBg})`,
        opacity: showHighRes ? 0 : 1
      }"
    ></div>

    <!-- High-Resolution Background (fades in) -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
      :style="{
        backgroundImage: `url(${highResBg})`,
        opacity: showHighRes ? 1 : 0
      }"
    ></div>

    <!-- Dark Overlay -->
    <div
      v-if="bgDark"
      class="absolute inset-0 bg-black/55 transition-opacity duration-600"
    ></div>

    <!-- Main Content -->
    <div class="relative z-20 p-6 max-w-xl mx-auto">

      <!-- Search Row -->
      <div class="flex flex-wrap gap-3 mb-6">
        <input
          v-model="searchQuery"
          placeholder="City, State"
          class="flex-1 px-4 py-2 rounded"
        />

        <button
          @click="searchWeather"
          class="bg-blue-600 px-4 py-2 text-white rounded"
        >
          Search
        </button>

        <button
          @click="saveLocation"
          :disabled="!weather"
          class="bg-green-600 px-4 py-2 text-white rounded"
        >
          Save
        </button>
      </div>

      <!-- Weather card -->
      <WeatherCard
        class="mb-12"
        v-if="weather"
        :city="weather.location.name"
        :state="weather.location.region"
        :temp="Math.round(weather.current.temp_f)"
        :description="weather.current.condition.text"
        :icon="weather.current.condition.icon"
        :high="Math.round(weather.forecast.forecastday[0].day.maxtemp_f)"
        :low="Math.round(weather.forecast.forecastday[0].day.mintemp_f)"
      />

      <p v-else class="text-white">Loading...</p>
      <!-- Saved locations list (with padding below) -->
      <LocationList
        class="mb-10"
        :locations="saved"
        @select="selectSaved"
        @remove="removeSaved"
      />



    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, watch } from "vue";
import WeatherCard from "../components/WeatherCard.vue";
import LocationList from "../components/LocationList.vue";
import { getCurrentWeather } from "../services/WeatherService.js";
import { StoreLocation } from "../store/StoreLocation.js";

//  Weather + Saved Location State
const weather = ref(null);
const searchQuery = ref("");
const saved = ref([]);

onMounted(() => {
  const stored = localStorage.getItem("savedLocations");
  if (stored) saved.value = JSON.parse(stored);

  // Load a default weather entry
  searchQuery.value = "Raleigh, NC";
  searchWeather();
});

async function searchWeather() {
  if (!searchQuery.value.trim()) return;

  const current = await getCurrentWeather(searchQuery.value);

  const forecast = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=62b7a288f3324fbb8b711132250812&q=${searchQuery.value}&days=1`
  ).then(r => r.json());

  weather.value = {
    ...current,
    forecast: forecast.forecast,
  };

  StoreLocation.city = weather.value.location.name;
  StoreLocation.state = weather.value.location.region;
}

function saveLocation() {
  if (!weather.value) return;

  const entry = {
    city: weather.value.location.name,
    state: weather.value.location.region,
  };

  const exists = saved.value.some(
    l => l.city === entry.city && l.state === entry.state
  );

  if (!exists) {
    saved.value.push(entry);
    localStorage.setItem("savedLocations", JSON.stringify(saved.value));
  }
}

function selectSaved(loc) {
  searchQuery.value = `${loc.city},${loc.state}`;
  searchWeather();
}

function removeSaved(loc) {
  saved.value = saved.value.filter(
    l => !(l.city === loc.city && l.state === loc.state)
  );
  localStorage.setItem("savedLocations", JSON.stringify(saved.value));
}

// Background Loading (Low to High-Resolution)

const lowResBg = ref("");
const highResBg = ref("");
const showHighRes = ref(false);
const bgDark = ref(false);

// Choose background based on weather conditions
const bg = computed(() => {
  if (!weather.value) {
    return { low: "", high: "", dark: false };
  }

  const condition = weather.value.current.condition.text.toLowerCase();
  const isNight = weather.value.current.is_day === 0;

  const pick = (file) =>
    new URL(`../assets/backgrounds/${file}`, import.meta.url).href;

  // Map weather condition to (GIF or JPG)
  let file = "clear.jpg";

  if (condition.includes("storm")) file = "storm.gif";
  else if (condition.includes("snow")) file = "snow.gif";
  else if (condition.includes("rain")) file = "rainy.gif";
  else if (condition.includes("cloud")) file = "cloudy.gif";
  else if (isNight) file = "night.jpg";

  // Progressive loading:
  const isGif = file.endsWith(".gif");

  return {
    low: isGif ? pick(file) : pick(file.replace(".jpg", "_low.jpg")),
    high: pick(file),
    dark:
      isNight ||
      ["rain", "storm", "snow"].some((w) => condition.includes(w)),
  };
});

// Load high-resolution lazily and fade-in
watch(
  bg,
  (newBg) => {
    showHighRes.value = false;

    lowResBg.value = newBg.low;
    bgDark.value = newBg.dark;

    const img = new Image();
    img.src = newBg.high;

    img.onload = () => {
      highResBg.value = newBg.high;
      showHighRes.value = true;
    };
  },
  { immediate: true }
);
</script>


<style scoped>
/* Ensure images fill screen properly */
.bg-cover {
  background-size: cover;
}
</style>
