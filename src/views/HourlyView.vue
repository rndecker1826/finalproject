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

import { Bar } from "vue-chartjs";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

  const forceControllers = {
    line: LineElement,
    bar: BarElement,
  }

// Register Chart.js Components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip  
  Legend,
);

const route = useRoute();

// Chart reactive data
const chartData = ref(null);
const temps = ref([]);
const rain = ref([]);
const labels = ref([]);

const city = ref("");
const state = ref("");

// Fetch hourly forecast
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
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.35)",
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 1,
        yAxisID: "y"
      },
      {
        type: "bar",
        label: "Rainfall (inches)",
        data: rain.value.map(v => Number(v.toFixed(2))),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderRadius: 5,
        barPercentage: 0.85,
        categoryPercentage: 0.9,
        yAxisID: "y1"
      }
    ]
  };
});

// Chart Options (Perfectly aligned grids)
const chartOptions = computed(() => {
  const maxTemp = Math.max(...temps.value, 100);
  const maxRain = Math.max(...rain.value, 0.3);

  return {
    responsive: true,
    maintainAspectRatio: false,

    scales: {
      x: {
        ticks: {
          maxRotation: 0
        },
        grid: {
          color: "rgba(0, 0, 0, 0.08)"
        }
      },

      y: {
        beginAtZero: true,
        suggestedMax: Math.ceil(maxTemp / 30) * 30,
        ticks: { stepSize: 10 },
        grid: {
          color: "rgba(0, 0, 0, 0.12)",
          lineWidth: 1
        },
        title: { display: true, text: "Temperature (°F)" }
      },

      y1: {
        beginAtZero: true,
        suggestedMax: Math.ceil(maxRain / 0.03) * 0.03,
        ticks: { stepSize: 0.05 },
        position: "right",
        grid: {
          drawOnChartArea: true, 
          color: "rgba(0, 0, 0, 0.12)"
        },
        title: { display: true, text: "Rainfall (inches)" }
      }
    },

    plugins: {
      legend: {
        labels: { font: { size: 16 } }
      },
      tooltip: {
        mode: "index",
        intersect: false
      }
    }
  };
});
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
