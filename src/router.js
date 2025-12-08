import { createRouter, createWebHistory } from 'vue-router'

import HomeView from './views/HomeView.vue'
import HourlyView from './views/HourlyView.vue'
import ForecastView from './views/ForecastView.vue'

const routes = [
    { path: '/', name: 'Home', component: HomeView },
    { path: '/hourly', name: 'Hourly', component: HourlyView },
    { path: '/forecast', name: 'Forecast', component: ForecastView },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router