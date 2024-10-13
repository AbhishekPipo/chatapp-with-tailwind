<template>
  <div class="flex h-full">
    <!-- Message list -->
    <div class="w-1/3 bg-white rounded-lg shadow mr-4 overflow-y-auto">
      <div class="p-4 border-b">
        <input
          type="text"
          placeholder="Search"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>
      <ul>
        <li
          v-for="user in messages"
          :key="user.id"
          @click="selectContact(user)"
          class="border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
        >
          <div class="block p-4">
            <div class="flex items-center">
              <img
                :src="user.avatar"
                :alt="user.name"
                class="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p class="font-semibold">{{ user.name }}</p>
                <p class="text-sm text-gray-500">{{ user.lastMessage || 'No messages yet' }}</p>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Message content -->
    <div class="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
      <div class="p-4 border-b flex items-center justify-between">
        <div class="flex items-center">
          <img
            :src="selectedContact?.avatar || 'https://via.placeholder.com/40'"
            alt="User avatar"
            class="w-10 h-10 rounded-full mr-3"
          />
          <h2 class="text-lg font-semibold">{{ selectedContact?.name || 'Select a contact' }}</h2>
        </div>
      </div>

      <!-- Chat messages -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-for="(msg, index) in chatMessages" :key="index" :class="{'text-right': msg.senderId === currentUser.id}">
          <div class="flex items-start mb-2">
            <img
              :src="msg.senderId === currentUser.id ? currentUser.avatar : selectedContact.avatar"
              alt="User avatar"
              class="w-8 h-8 rounded-full mr-2"
            />
            <div :class="msg.senderId === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'">
              <p class="p-2 rounded-lg">{{ msg.text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Message input -->
      <div class="border-t p-4">
        <div class="flex items-center">
          <input
            type="text"
            v-model="newMessage"
            placeholder="Type a message..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg mr-2 focus:outline-none focus:ring focus:ring-blue-300"
          />
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            @click="sendMessage"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebase'; // Import Firestore
import { collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

export default {
  name: 'MessagesView',
  data() {
    return {
      currentUser: {
        id: 'currentUserId', // Simulating logged-in user ID
        name: 'You',
        avatar: 'https://via.placeholder.com/40',
      },
      messages: [], // List of users
      chatMessages: [], // Chat messages
      newMessage: '', // New message input
      selectedContact: null, // Currently selected contact
    };
  },
  created() {
    this.loadUsers(); // Load all users except the current user
  },
  methods: {
    async loadUsers() {
      // Retrieve current user data (this example assumes localStorage stores current user)
      const userData = localStorage.getItem('currentUser');
      const currentUserId = userData ? JSON.parse(userData).id : null;
   console.log(userData, 'current logged in user data');
   
      // Load users from Firestore
      const usersRef = collection(db, 'users');
      onSnapshot(usersRef, (snapshot) => {
        this.messages = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.id !== currentUserId); // Exclude current user
      });
    },
    selectContact(contact) {
      this.selectedContact = contact;
      this.loadChatMessages(contact.id); // Load messages for the selected contact
    },
    async loadChatMessages(contactId) {
      console.log(contactId,"conact id");
      
      const chatRef = collection(db, `messages`);
      onSnapshot(chatRef, (snapshot) => {
        this.chatMessages = snapshot.docs
          .map(doc => doc.data())
          .filter(msg => 
            (msg.senderId === this.currentUser.id && msg.receiverId === contactId) ||
            (msg.senderId === contactId && msg.receiverId === this.currentUser.id)
          );
      });
    },
    async sendMessage() {
  if (this.newMessage.trim() && this.selectedContact) {
    // Retrieve the current user data from localStorage
    const userData = localStorage.getItem('currentUser');
    const currentUser = userData ? JSON.parse(userData) : null;

    if (currentUser && currentUser.id) {
      // Add the new message to Firestore
      const chatRef = collection(db, 'messages');
      await addDoc(chatRef, {
        senderId: currentUser.id, // Use the retrieved senderId
        receiverId: this.selectedContact.id,
        text: this.newMessage,
        textTimestamp: serverTimestamp(),
      });

      this.newMessage = ''; // Clear the input after sending
    } else {
      alert('Current user not found!');
    }
  } else {
    alert('Please enter a message and select a contact!');
  }
}
  },
};
</script>

<style scoped>
/* Additional styles if needed */
</style>
