<template>
  <nav class="bg-blue-700 text-white p-4 flex gap-4">
    <RouterLink to="/" class="font-bold">Home</RouterLink>

    <RouterLink :to="hourlyLink" class="font-bold">Hourly</RouterLink>

    <RouterLink :to="forecastLink" class="font-bold">5 Day Forecast</RouterLink>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { StoreLocation } from "../store/StoreLocation.js";

// If nothing loaded yet, fall back to a default.
const loc = computed(() => {
    if (!StoreLocation.city) {
        return " ";
    }
    return `${StoreLocation.city},${StoreLocation.state}`;
});

const hourlyLink = computed(() => `/hourly/${encodeURIComponent(loc.value)}`);
const forecastLink = computed(() => `/forecast/${encodeURIComponent(loc.value)}`);
</script>