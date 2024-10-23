<template>
  <div class="flex justify-center items-center min-h-screen">
    <div class="w-full max-w-xs">
      <form @submit.prevent="register" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 class="text-lg font-bold mb-4">Sign Up</h2>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
import { ref } from 'vue';
import { db } from '../firebase'; // Import Firestore
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router'; // Import useRouter

export default {
  name: 'SignUpComponent',
  setup() {
    const email = ref('');
    const password = ref('');
    const router = useRouter(); // Initialize useRouter

    const register = async () => {
      if (email.value && password.value) {
        try {
          const usersRef = collection(db, 'users');
          await addDoc(usersRef, {
            email: email.value,
            password: password.value, // Consider hashing passwords for security
          });
          alert('User registered successfully!');
          router.push({ name: 'Login' }); // Change 'Login' to the name of your route

        } catch (error) {
          console.error("Error adding document: ", error);
          alert('Failed to register user.');
        }
      } else {
        alert('Please fill in all fields.');
      }
    };

    return {
      email,
      password,
      register,
    };
  },
};
</script>

<style scoped>
/* Additional styles if needed */
</style>
