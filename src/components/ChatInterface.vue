<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="h-16 border-b flex items-center px-4 justify-between bg-white">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span class="text-white font-bold">G</span> <!-- Indicating Group -->
          </div>
          <div>
            <h1 class="font-semibold">{{ chatTitle }}</h1>
            <p class="text-sm text-gray-500">{{ typingStatus }}</p>
          </div>
        </div>
        <div class="flex gap-4">
          <button class="p-2"><i class="fas fa-video text-gray-600"></i></button>
          <button class="p-2"><i class="fas fa-phone text-gray-600"></i></button>
          <button class="p-2"><i class="fas fa-comment text-gray-600"></i></button>
        </div>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="text-center text-sm text-gray-500 mb-4">Today, {{ currentDate }}</div>
        
        <div v-for="message in messages" :key="message.id" class="flex gap-3 mb-4" :class="{'justify-end': message.sender === 'You'}">
          <div class="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" v-if="message.sender !== 'You'"></div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ message.sender }}</span>
              <span class="text-sm text-gray-500">{{ message.time }}</span>
            </div>
            <p class="bg-white p-3 rounded-lg shadow-sm max-w-md mt-1">{{ message.content }}</p>
            <img v-if="message.imageUrl" :src="message.imageUrl" alt="Attachment" class="rounded-lg border shadow-sm mt-2 max-w-md"/>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 border-t bg-white">
        <div class="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
          <input
            type="text"
            placeholder="Add a comment..."
            class="flex-1 bg-transparent outline-none px-2"
            v-model="newMessage"
          />
          <input type="file" @change="uploadImage" class="hidden" ref="fileInput" />
          <div class="flex gap-2">
            <button @click="triggerFileInput" class="p-2 hover:bg-gray-200 rounded-full">
              <i class="fas fa-image text-gray-600"></i>
            </button>
            <button @click="sendMessage" class="p-2 hover:bg-gray-200 rounded-full">
              <i class="fas fa-paper-plane text-gray-600"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Sidebar (Members and Attachments Sections) -->
    <!-- Omitted for brevity -->
  </div>
</template>

<script>
import { db, storage } from '../firebase'; // Ensure you have this path correctly
import { collection, query, orderBy, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default {
  name: 'ChatInterface',
  data() {
    return {
      chatTitle: 'Group Chat', // Change for group chat
      typingStatus: 'Typing...',
      currentDate: new Date().toLocaleDateString(),
      newMessage: '',
      messages: [], // Will be dynamically loaded
      chatId: 'exampleGroupId', // Set dynamically based on active group chat
      imageFile: null
    };
  },
  mounted() {
    this.loadGroupMessages();
  },
  methods: {
    async loadGroupMessages() {
      const messagesRef = collection(db, 'groupMessages'); // Changed to groupMessages
      const q = query(messagesRef, orderBy('timestamp', 'asc')); // Adjusted to load group messages
      onSnapshot(q, (snapshot) => {
        this.messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      });
    },
    async sendMessage() {
      if (this.newMessage.trim() === '' && !this.imageFile) return;

      let imageUrl = '';
      if (this.imageFile) {
        const storageRef = ref(storage, `groupChats/${this.chatId}/${Date.now()}_${this.imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, this.imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
        this.imageFile = null;
      }

      const messageData = {
        sender: 'You', // Replace with actual user logic
        content: this.newMessage,
        imageUrl,
        timestamp: serverTimestamp(),
        time: new Date().toLocaleTimeString()
      };

      await addDoc(collection(db, 'groupMessages'), messageData); // Adjusted to add to groupMessages
      this.newMessage = '';
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    uploadImage(event) {
      this.imageFile = event.target.files[0];
    }
  }
};
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
