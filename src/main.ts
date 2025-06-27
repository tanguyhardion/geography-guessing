import { createApp } from "vue";
import "./style.scss";
import App from "./App.vue";
import { pinia } from "./store"; // Import Pinia instance
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import router from "./router";

const app = createApp(App);

// Global directive for button click animation (Vue way)
app.directive("click-animate", {
  mounted(el: HTMLElement) {
    el.addEventListener("click", () => {
      el.classList.remove("animate-click");
      // Force reflow to ensure class removal is processed
      el.offsetHeight;
      el.classList.add("animate-click");

      // Remove class after animation completes
      setTimeout(() => {
        el.classList.remove("animate-click");
      }, 600);
    });
  },
});

app.use(pinia); // Use Pinia
app.use(Toast, {
  position: "top-center",
  timeout: 3000, // Default timeout for toasts
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
  transition: "Vue-Toastification__fade",
  maxToasts: 1, // Ensures only one toast is visible at a time
  newestOnTop: true, // New toasts replace old ones
});
app.use(router);
app.mount("#app");
