<template>
  <div class="bg-white/80 p-6 rounded shadow flex gap-5">
    <img :src="iconUrl" class="w-16 h-16">

    <div>
      <h2 class="text-2xl font-bold">{{ city }}, {{ state }}</h2>

      <p class="text-xl">{{ temp }}°</p>
      <p class="text-gray-600">{{ description }}</p>

      <div v-if="high !== null && low !== null" class="mt-2 text-sm">
        <strong>High:</strong> {{ high }}°
        <span class="ml-4"><strong>Low:</strong> {{ low }}°</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  city: String,
  state: String,
  temp: Number,
  description: String,
  icon: String,
  high: Number,
  low: Number,
});

const iconUrl = computed(() =>
  props.icon ? "https:" + props.icon : ""
);
</script>