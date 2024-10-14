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
              <div class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
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
      <div v-if="!selectedContact" class="flex-1 flex flex-col items-center justify-center text-center">
        <p class="text-gray-500">Welcome to Floakly Chat App</p>
        <p class="mt-2 text-gray-400">Start texting your friends and family!</p>
      </div>
      <div v-else class="flex-1 flex flex-col">
        <div class="p-4 border-b flex items-center justify-between">
          <div class="flex items-center">
            <div
              class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3"
            >
              {{ selectedContact.name.charAt(0).toUpperCase() }}
            </div>
            <h2 class="text-lg font-semibold">{{ selectedContact?.name }}</h2>
          </div>
        </div>

        <!-- Chat messages -->
        <div class="flex-1 overflow-y-auto p-4">
          <div>
            <div 
              v-for="(msg, index) in chatMessages" 
              :key="index" 
              :class="{'flex justify-end': msg.senderId === currentUser.id, 'flex justify-start': msg.senderId !== currentUser.id}"
              class="mb-4 items-end"
            >
              <div 
                v-if="msg.senderId !== currentUser.id"
                class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2"
              >
                {{ selectedContact.name.charAt(0).toUpperCase() }}
              </div>
              <div 
                :class="[
                  'max-w-[70%] rounded-lg p-3', 
                  msg.senderId === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                ]"
              >
                <p>{{ msg.text }}</p>
                <span class="text-xs opacity-75 block mt-1">
                  {{ formatTimestamp(msg.textTimestamp) }}
                </span>
              </div>
              <div 
                v-if="msg.senderId === currentUser.id"
                class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center ml-2"
              >
                {{ currentUser.name.charAt(0).toUpperCase() }}
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
              @keyup.enter="sendMessage"
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
  </div>
</template>

<script>
import { db } from '../firebase'; // Import Firestore
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';

export default {
  name: 'MessagesView',
  data() {
    return {
      currentUser: {
        id: 'currentUserId', // Replace with actual logged-in user ID
        name: 'You',
        avatar: 'https://via.placeholder.com/40', // Replace with actual user avatar
      },
      messages: [], // List of users
      chatMessages: [], // Chat messages
      newMessage: '', // New message input
      selectedContact: null, // Currently selected contact
    };
  },
  created() {
    this.loadUsers(); // Load all users except the current user
    this.loadCurrentUser(); // Load current user data
  },
  methods: {
    loadCurrentUser() {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      } else {
        console.error('Current user not found in localStorage');
      }
    },
    async loadUsers() {
      const usersRef = collection(db, 'users');
      onSnapshot(usersRef, (snapshot) => {
        this.messages = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.id !== this.currentUser.id); // Exclude current user
      });
    },
    selectContact(contact) {
      this.selectedContact = contact;
      this.loadChatMessages(contact.id);
    },
    async loadChatMessages(contactId) {
      const chatRef = collection(db, 'messages');
      const q = query(chatRef, orderBy('textTimestamp', 'asc'));
      
      onSnapshot(q, (snapshot) => {
        this.chatMessages = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            textTimestamp: doc.data().textTimestamp?.toDate()
          }))
          .filter(msg => 
            (msg.senderId === this.currentUser.id && msg.receiverId === contactId) || 
            (msg.senderId === contactId && msg.receiverId === this.currentUser.id)
          );
      });
    },
    async sendMessage() {
      if (this.newMessage.trim() && this.selectedContact) {
        try {
          const chatRef = collection(db, 'messages');
          await addDoc(chatRef, {
            senderId: this.currentUser.id,
            receiverId: this.selectedContact.id,
            text: this.newMessage,
            textTimestamp: serverTimestamp(),
          });

          this.newMessage = ''; // Clear the input after sending
        } catch (error) {
          console.error('Error sending message:', error);
          alert('Failed to send message. Please try again.');
        }
      } else {
        alert('Please enter a message and select a contact!');
      }
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      return new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
  },
};
</script>