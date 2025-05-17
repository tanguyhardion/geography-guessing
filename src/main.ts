import { createApp } from "vue";
import "./style.scss";
import App from "./App.vue";
import { pinia } from "./store"; // Import Pinia instance
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);
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
  newestOnTop: true // New toasts replace old ones
});
app.mount("#app");
