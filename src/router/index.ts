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

// Redirect to Home if the user refreshes on /game
router.beforeEach((to, from, next) => {
  // If this is the first navigation (from is START) and going to /game, redirect to home
  if (to.name === "Game" && from.name == null && window.performance && performance.navigation.type === 1) {
    next({ name: "Home" });
  } else {
    next();
  }
});

export default router;
