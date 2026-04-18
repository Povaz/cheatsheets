import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import { topics } from './lib/content.js'

// Temporary (Phase 2 checkpoint): confirm parsed structure.
// Remove after sign-off.
console.log('[content] topics:', topics)

createApp(App).mount('#app')
