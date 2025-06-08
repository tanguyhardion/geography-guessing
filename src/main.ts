import { createApp } from "vue";
import "./style.scss";
import App from "./App.vue";
import { pinia } from "./store"; // Import Pinia instance
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);

// Add click animation to all buttons
document.addEventListener("DOMContentLoaded", () => {
  // Function to add click animation
  const addClickAnimation = (button: HTMLButtonElement) => {
    button.addEventListener("click", () => {
      button.classList.remove("animate-click");
      // Force reflow
      button.offsetHeight;
      button.classList.add("animate-click");

      setTimeout(() => {
        button.classList.remove("animate-click");
      }, 600);
    });
  };

  // Add to existing buttons
  document.querySelectorAll("button").forEach(addClickAnimation);

  // Add to dynamically created buttons
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.tagName === "BUTTON") {
            addClickAnimation(element as HTMLButtonElement);
          }
          // Also check for buttons inside added elements
          element.querySelectorAll?.("button").forEach(addClickAnimation);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
});

// Global directive for button click animation (alternative approach)
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
app.mount("#app");
