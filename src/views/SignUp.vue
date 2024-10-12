<template>
    <div class="flex justify-center items-center min-h-screen">
      <div class="w-full max-w-xs">
        <form @submit.prevent="handleSignUp" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 class="text-2xl font-bold mb-4">Sign Up</h2>
          <div class="mb-4">
            <label for="newUsername" class="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input
              v-model="newUsername"
              id="newUsername"
              type="text"
              placeholder="Your username"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div class="mb-6">
            <label for="newPassword" class="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              v-model="newPassword"
              id="newPassword"
              type="password"
              placeholder="********"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div class="flex items-center justify-between">
            <button
              type="submit"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        newUsername: '',
        newPassword: '',
      };
    },
    methods: {
      handleSignUp() {
        // Simulate static data check
        if (this.newUsername && this.newPassword) {
          alert('Sign up successful!');
        } else {
          alert('Please fill in all fields.');
        }
      },
    },
  };
  </script>
  
  <style scoped>
  </style>
  