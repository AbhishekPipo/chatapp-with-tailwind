<template>
    <div class="bg-white w-64 h-screen flex flex-col">
      <div class="p-4 border-b">
        <h1 class="text-xl font-semibold">floakly</h1>
      </div>
      <nav class="flex-1 overflow-y-auto">
        <ul class="p-2">
          <li v-for="item in menuItems" :key="item.name" class="mb-2">
            <router-link :to="item.route" class="flex items-center p-2 rounded-lg hover:bg-gray-100">
              <component :is="item.icon" class="w-5 h-5 mr-3" />
              {{ item.name }}
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
  </template>
  
  <script>
  import { HomeIcon, UsersIcon, ChatBubbleLeftEllipsisIcon, UserGroupIcon, GiftIcon, UserCircleIcon } from '@heroicons/vue/24/outline'
  
  export default {
    name: 'SidebarComp',
    data() {
      return {
        menuItems: [
          { name: 'Dashboard', icon: HomeIcon, route: '/' },
          { name: 'People', icon: UsersIcon, route: '/people' },
          { name: 'Messages', icon: ChatBubbleLeftEllipsisIcon, route: '/messages' },
          { name: 'Groups', icon: UserGroupIcon, route: '/groups' },
          { name: 'Giving', icon: GiftIcon, route: '/giving' },
          { name: 'My Profile', icon: UserCircleIcon, route: '/profile' },
        ]
      }
    }
  }
  </script>