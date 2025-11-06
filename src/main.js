import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Hay una nueva versión disponible. ¿Actualizar ahora?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('La app está lista para funcionar sin conexión 🛰️')
  },
})



createApp(App).mount('#app')
