<template>
  <div class="flex items-center justify-center h-screen bg-gray-100">
    <div class="bg-white p-8 rounded shadow-md w-80">
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
      <form @submit.prevent="login">
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium text-gray-700">Email</label>
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
      
      <div class="mt-6 text-center">
        <button
          @click="googleSignIn"
          class="w-full bg-red-600 text-white rounded-md py-2 hover:bg-red-700"
        >
          Sign in with Google
        </button>
      </div>
      <p class="mt-4 text-sm text-gray-600 text-center">
        Don't have an account? 
        <router-link to="/signup" class="text-blue-600 hover:underline">Sign Up</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../firebase'; // Import Firestore instance
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore'; // Import Firestore methods
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; // Import Firebase Auth and Google provider

export default {
  name: 'LoginComponent',
  setup() {
    const username = ref('');
    const password = ref('');
    const router = useRouter();

    // Normal email/password login
    const login = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', username.value));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();

        if (userDoc.password === password.value) {
          // Store user in localStorage
          localStorage.setItem('currentUser', JSON.stringify(userDoc));
          alert('Login successful!');
          router.push({ name: 'Messages' });
        } else {
          alert('Invalid username or password.');
        }
      } else {
        alert('Invalid username or password.');
      }
    };

    // Google SSO login
    const googleSignIn = async () => {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();

      try {
        // Sign in with Google
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Prepare user data
        const userData = {
          email: user.email,
          id: user.uid, // Firebase UID
          name: user.displayName,
          password: 'admin@123', // Default password, can be omitted
          URL: '', // Placeholder for user URL
          description: '', // Placeholder for user description
        };

        // Reference to the user's document in Firestore
        const userDocRef = doc(db, 'users', user.uid);

        // Check if the user already exists in Firestore
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          // If user doesn't exist, create the document in Firestore
          await setDoc(userDocRef, userData);
          console.log('New user document created in Firestore.');
        } else {
          console.log('User document already exists in Firestore.');
        }

        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // Redirect to the Messages page
        alert('Google sign-in successful!');
        router.push({ name: 'Messages' });
      } catch (error) {
        console.error('Google sign-in failed:', error.message);
        alert('Google sign-in failed. Please try again.');
      }
    };

    return {
      username,
      password,
      login,
      googleSignIn,
    };
  },
};
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
