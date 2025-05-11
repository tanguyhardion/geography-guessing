import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { pinia } from './store' // Import Pinia instance

const app = createApp(App)
app.use(pinia) // Use Pinia
app.mount('#app')
