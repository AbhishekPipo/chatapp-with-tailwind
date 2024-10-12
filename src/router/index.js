import { createRouter, createWebHistory } from 'vue-router'
import Messages from '../views/MessagesView.vue'
import LoginView from '@/views/LoginView.vue'

const routes = [
  {
    path: '/messages',
    name: 'Messages',
    component: Messages
  },
  {
    path: '/',
    name: 'Login',
    component: LoginView
  },
  // Add more routes here
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router