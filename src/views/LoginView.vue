<template>
    <div class="flex items-center justify-center h-screen bg-gray-100">
      <div class="bg-white p-8 rounded shadow-md w-80">
        <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
        <form @submit.prevent="login">
          <div class="mb-4">
            <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              v-model="username"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
            />
          </div>
          <div class="mb-6">
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              v-model="password"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            class="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'LoginComponent',
    setup() {
      const username = ref('');
      const password = ref('');
      const router = useRouter();
  
      // Static data for demonstration purposes
      const staticData = {
        username: 'admin',
        password: 'password123',
      };
  
      const login = () => {
        if (username.value === staticData.username && password.value === staticData.password) {
          alert('Login successful!');
          // Redirect to messages (adjust the route name as necessary)
          router.push({ name: 'Messages' }); // Ensure you have a route named 'Messages'
        } else {
          alert('Invalid username or password.');
        }
      };
  
      return {
        username,
        password,
        login,
      };
    },
  };
  </script>
  
  <style scoped>
  /* Additional styles if needed */
  </style>
  