<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Conditionally render Sidebar and Header -->
    <Sidebar v-if="!isLoginRoute" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Header v-if="!isLoginRoute" />
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
        <div class="container mx-auto px-6 py-8">
          <router-view></router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/SidebarComp.vue'
import Header from './components/HeaderComp.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'App',
  components: {
    Sidebar,
    Header
  },
  setup() {
    const route = useRoute()

    // Computed property to check if the current route is the login route
    const isLoginRoute = computed(() => {
      return route.name === 'Login' // Adjust this to match your login route's name
    })

    return {
      isLoginRoute,
    }
  },
}
</script>

<style scoped>
/* Add any additional styles here */
</style>
