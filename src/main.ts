import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import 'katex/dist/katex.min.css'
import App from './App.vue'
import router from './router'
import i18n from './locales'
import { marked } from 'marked'
import markedKatex from 'marked-katex-extension'

marked.use(markedKatex({
  throwOnError: false
}));

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')