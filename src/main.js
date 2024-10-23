import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/tailwind.css';
import '@fortawesome/fontawesome-free/css/all.css';
import VueToast from 'vue-toast-notification'; // Import the VueToast plugin
import 'vue-toast-notification/dist/theme-default.css'; // Optional: Import default styles

// Create the Vue app and use the plugins
createApp(App)
  .use(router)
  .use(VueToast) // Register the VueToast plugin
  .mount('#app');
