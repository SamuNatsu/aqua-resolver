/* Main entrance */
import { createApp } from 'vue'

// Plugins
import pinia from './stores'
import router from './router'

// Global stylesheet
import 'normalize.css'
import './style.css'
import 'vue-multiselect/dist/vue3-multiselect.css'

// Root component
import App from './App.vue'

// Create application
createApp(App)
  .use(pinia)
  .use(router)
  .mount('#app')
