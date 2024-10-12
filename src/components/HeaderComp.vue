<template>
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <h1 class="text-lg font-semibold text-gray-900">{{ currentPage }}</h1>
      <p class="text-gray-600" v-if="currentUser">{{ `Hi, ${currentUser.name}` }}</p>
      <p class="text-gray-600" v-else>Hi, Guest</p>
    </div>
  </header>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'; // Import useRoute from vue-router

export default {
  name: 'HeaderComp',
  setup() {
    const currentUser = ref(null); // Reactive reference for current user
    const route = useRoute(); // Get the current route

    onMounted(() => {
      // Retrieve user info from localStorage
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        currentUser.value = JSON.parse(userData); // Parse and set currentUser
      }
    });

    const currentPage = route.name; // Get the current route name directly

    return {
      currentUser,
      currentPage,
    };
  },
};
</script>

<style scoped>
/* Additional styles if needed */
</style>
