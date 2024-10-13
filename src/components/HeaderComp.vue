<template>
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <h1 class="text-lg font-semibold text-gray-900">{{ currentPage }}</h1>
      <div class="relative" @click="toggleDropdown">
        <p class="text-gray-600 cursor-pointer" v-if="currentUser">{{ `Hi, ${currentUser.name}` }}</p>
        <p class="text-gray-600 cursor-pointer" v-else>Hi, Guest</p>
        
        <!-- Dropdown Menu -->
        <div v-if="isDropdownOpen" class="absolute right-0 mt-2 w-48 bg-white border border-gray-300 shadow-lg rounded-md z-10">
          <a @click="viewProfile" class="block px-4 py-2 text-gray-800 hover:bg-gray-200">Profile</a>
          <a @click="logout" class="block px-4 py-2 text-gray-800 hover:bg-gray-200">Logout</a>
        </div>
      </div>
    </div>
  </header>
</template>
<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Import useRouter from vue-router

export default {
  name: 'HeaderComp',
  setup() {
    const currentUser = ref(null); // Reactive reference for current user
    const route = useRoute(); // Get the current route
    const router = useRouter(); // Get the router instance
    const isDropdownOpen = ref(false); // Reactive reference for dropdown state

    onMounted(() => {
      // Retrieve user info from localStorage
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        currentUser.value = JSON.parse(userData); // Parse and set currentUser
      }
    });

    const currentPage = route.name; // Get the current route name directly

    // Method to toggle dropdown menu visibility
    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };

    // Method to handle viewing the profile
    const viewProfile = () => {
      console.log('Viewing profile for:', currentUser.value.name);
      // Implement the logic to navigate to the profile page
      router.push('/profile'); // Example route to the profile page
    };

    // Method to handle logout
    const logout = () => {
      console.log('Logging out...');
      // Clear user data from localStorage
      localStorage.removeItem('currentUser');
      currentUser.value = null; // Reset currentUser
      // Redirect to the login page
      router.push('/'); // Change '/login' to the desired route for your login page
    };

    return {
      currentUser,
      currentPage,
      toggleDropdown,
      viewProfile,
      logout,
      isDropdownOpen, // Expose isDropdownOpen to the template
    };
  },
};
</script>
