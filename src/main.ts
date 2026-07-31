import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import App from './App.vue'
import { queryClient } from './config/query-client'
import './style.css'

createApp(App).use(VueQueryPlugin, { queryClient }).mount('#app')
