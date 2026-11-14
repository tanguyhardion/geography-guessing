import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import { getMode } from "../game/modes";

// The mode (and optional continent) live in the URL, so a game survives a
// refresh and can be linked to directly. Leaflet and Chart.js are only
// downloaded by the pages that need them.
const routes: RouteRecordRaw[] = [
  { path: "/", name: "Home", component: HomePage },
  {
    path: "/jouer/:modeId",
    name: "Game",
    component: () => import("../pages/GamePage.vue"),
    beforeEnter: (to) => (getMode(to.params.modeId) ? true : { name: "Home" }),
  },
  {
    path: "/stats",
    name: "Stats",
    component: () => import("../pages/StatsPage.vue"),
  },
  { path: "/:pathMatch(.*)*", redirect: { name: "Home" } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

export default router;
