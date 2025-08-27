console.log('Bar')
console.log(import.meta.env)
console.log(__APP_VERSION__)

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
