import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import GameView from "../views/GameView.vue";
import ScoresView from "../views/ScoresView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/game",
    name: "game",
    component: GameView,
  },
  {
    path: "/scores",
    name: "scores",
    component: ScoresView,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
