<template>
  <div class="p-6">

    <h1 class="text-3xl font-bold mb-4">
      {{ city }}, {{ state }} — 5 Day Forecast
    </h1>

    <p v-if="loading">Loading forecast…</p>
    <p v-if="error" class="text-red-600">{{ error }}</p>

    <table v-if="!loading && !error" class="w-full bg-white shadow rounded">
      <thead class="bg-gray-200">
        <tr>
          <th class="p-2 text-left">Day</th>
          <th class="p-2 text-left">Condition</th>
          <th class="p-2 text-left">High</th>
          <th class="p-2 text-left">Low</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="d in forecast" :key="d.date">
          <!-- ✅ formatted date -->
          <td class="p-2 text-left">{{ formatDate(d.date) }}</td>

          <!-- ✅ icon + text aligned, consistent sizing -->
          <td class="p-2 flex items-center gap-2">
            <img
              :src="'https:' + d.day.condition.icon"
              class="sm:w-8 sm:h-8 w-6 h-6 object-contain"
            >
            <span class="text-sm">{{ d.day.condition.text }}</span>
          </td>

          <td class="p-2 text-left">{{ Math.round(d.day.maxtemp_f) }}°F</td>
          <td class="p-2 text-left">{{ Math.round(d.day.mintemp_f) }}°F</td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getFiveDayForecast } from "../services/WeatherService.js";

const route = useRoute();

const city = ref("");
const state = ref("");
const forecast = ref([]);
const loading = ref(true);
const error = ref("");

/** ✅ Format YYYY-MM-DD → MM-DD-YYYY */
const formatDate = (dateStr) => {
  const [y, m, d] = dateStr.split("-");
  return `${m}-${d}-${y}`;
};

onMounted(async () => {
  try {
    const decoded = decodeURIComponent(route.params.location);
    const parts = decoded.split(",");

    city.value = parts[0];
    state.value = parts[1];

    const query = `${city.value},${state.value}`;

    const days = await getFiveDayForecast(query);
    forecast.value = days;

  } catch (e) {
    error.value = e.message;

  } finally {
    loading.value = false;
  }
});
</script>