import { createRouter, createWebHistory } from 'vue-router'
import Messages from '../views/MessagesView.vue'
import LoginView from '@/views/LoginView.vue'
import GroupsView from '@/views/GroupsView.vue'

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
  {
    path: '/groups',
    name: 'Groups',
    component: GroupsView
    // Add the GroupsView component here
  }
  // Add more routes here
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router