import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import GamePage from "../pages/GamePage.vue";
import StatsPage from "../pages/StatsPage.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", name: "Home", component: HomePage },
  { path: "/game", name: "Game", component: GamePage },
  { path: "/stats", name: "Stats", component: StatsPage },
];

const router = createRouter({
  history: createWebHistory("/geography-guessing/"),
  routes,
});

export default router;
