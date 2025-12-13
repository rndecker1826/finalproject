<template>
  <div class="p-2 max-w-4xl mx-auto">

    <h1 class="text-2xl font-bold text-center mb-4">
      {{ city }}, {{ state }} — Hourly Weather
    </h1>

    <div v-if="chartData" class="w-full bg-white rounded-xl shadow p-4">
      <div class="relative h-[50vh] min-h-[320px]">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <p v-else class="text-center text-gray-500 mt-6">
      Loading hourly weather…
    </p>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { Bar } from "vue-chartjs";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Tooltip,
  Legend
} from "chart.js";

import { getHourlyForecast } from "../services/WeatherService.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Tooltip,
  Legend
);

const route = useRoute();

const chartData = ref(null);
const temps = ref([]);
const rain = ref([]);
const labels = ref([]);

const city = ref("");
const state = ref("");

onMounted(async () => {
  const decoded = decodeURIComponent(route.params.location);
  const parts = decoded.split(",");

  city.value = parts[0];
  state.value = parts[1] ?? "";

  const hours = await getHourlyForecast(`${city.value},${state.value}`);

  temps.value = hours.map(h => h.temp_f);
  rain.value  = hours.map(h => h.precip_in);
  labels.value = hours.map(h => h.time.slice(11, 16));

  chartData.value = {
    labels: labels.value,
    datasets: [
      {
        type: "line",
        label: "Temperature (°F)",
        data: temps.value,
        borderColor: "rgba(99, 135, 255, 0.74)", // line color
        backgroundColor: "rgba(99, 125, 255, 0.2)",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 1,
        yAxisID: "y",
      },
      {
        type: "bar",
        label: "Rainfall (inches)",
        data: rain.value.map(v => Number(v.toFixed(2))),
        backgroundColor: "rgba(54, 235, 172, 0.6)", // bar color
        borderColor: "rgba(1, 236, 153, 1)",
        yAxisID: "y1",
      },
    ],
  };
});

const chartOptions = computed(() => {
  const maxTemp = Math.max(...temps.value, 100);
  const maxRain = Math.max(...rain.value, 0.3);

  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
      },
      y1: {
        beginAtZero: true,
        position: "right",
      },
    },
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
  };
});
</script>


<style scoped>
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>