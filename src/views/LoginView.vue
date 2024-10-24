<template>
  <div class="flex items-center justify-center h-screen bg-gray-100">
    <div class="bg-white p-8 rounded shadow-md w-80">
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
      <form @submit.prevent="login">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
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
import { useToast } from 'vue-toast-notification'; // Import useToast

export default {
  name: 'LoginComponent',
  setup() {
    const email = ref('');
    const password = ref('');
    const router = useRouter();
    const toast = useToast(); // Initialize toast

    const login = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.value));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        
        // Check if the password matches
        if (userDoc.password === password.value) {
          // User logged in successfully, store their data
          const usernameFromEmail = userDoc.email.split('@')[0]; // Extract username from email
          const userData = {
            URL: userDoc.URL || '', // Default to empty if not set
            description: userDoc.description || '', // Default to empty if not set
            email: userDoc.email,
            id: querySnapshot.docs[0].id, // Use document ID from Firestore
            name: userDoc.name || usernameFromEmail, // Default name if not set
            password: userDoc.password, // Default password if not set
          };

          localStorage.setItem('currentUser', JSON.stringify(userData));

          await setDoc(doc(db, 'users', querySnapshot.docs[0].id), {
            ...userData, // Spread the existing data
          });

          // Show success toast
          toast.success('Login successful!',{
            position: 'top-right', 
          }); // Use toast
          router.push({ name: 'Messages' });
        } else {
          toast.error('Invalid email or password.',{
            position: 'top-right', 
          }); // Use toast
        }
      } else {
        // If no user found
        toast.error('User not found.',{
          position: 'top-right', 
        }); // Use toast
      }
    };

    // Google SSO login
    const googleSignIn = async () => {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        // Prepare user data
        const userData = {
          email: user.email,
          id: user.uid, // Firebase UID
          name: user.displayName || 'User', // Default name if not provided
          password: 'admin@123', // Default password, can be omitted
          URL: '', // Placeholder for user URL
          description: '', // Placeholder for user description
        };
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, userData);
          console.log('New user document created in Firestore.');
        } else {
          console.log('User document already exists in Firestore.');
        }
        localStorage.setItem('currentUser', JSON.stringify(userData));
        toast.success('Google sign-in successful!',{
          position: 'top-right', 
        }); // Use toast
        router.push({ name: 'Messages' });
      } catch (error) {
        console.error('Google sign-in failed:', error.message);
        toast.error('Google sign-in failed. Please try again.',{
          position: 'top-right', 
        }); // Use toast
      }
    };

    return {
      email,
      password,
      login,
      googleSignIn,
    };
  },
};
</script>

<style scoped>

</style>

