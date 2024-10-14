<template>
  <div class="flex h-full">
    <!-- Message list -->
    <div class="w-1/3 bg-white rounded-lg shadow mr-4 overflow-y-auto">
      <div class="p-4 border-b">
        <input
          type="text"
          placeholder="Search"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          v-model="searchQuery"
        />
      </div>
      <ul>
        <li
          v-for="user in filteredMessages"
          :key="user.id"
          @click="selectContact(user)"
          class="border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
        >
          <div class="block p-4 flex items-center">
            <div class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-grow">
              <p class="font-semibold">{{ user.name }}</p>
              <p class="text-sm text-gray-500">{{ user.lastMessage || 'No messages yet' }}</p>
            </div>
            <span class="text-xs text-gray-400">
              {{ user.online ? 'Online' : 'Offline' }}
            </span>
          </div>
        </li>
      </ul>
      <div v-if="messages.length === 0" class="p-4 text-center text-gray-500">
        {{ offline ? 'You are offline. Showing cached users.' : 'No users available.' }}
      </div>
    </div>

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
          <button class="text-blue-500" @click="toggleMute(selectedContact.id)">
            {{ isMuted(selectedContact.id) ? 'Unmute' : 'Mute' }}
          </button>
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
                <p>{{ formatMessage(msg.text) }}</p>
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
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore';

export default {
  name: 'MessagesView',
  data() {
    return {
      currentUser: {
        id: 'currentUserId',
        name: 'You',
      },
      messages: [],
      chatMessages: [],
      newMessage: '',
      selectedContact: null,
      offline: false,
      searchQuery: '',
      mutedContacts: new Set(),
    };
  },
  computed: {
    filteredMessages() {
      return this.messages.filter(user => 
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },
  created() {
    this.loadCurrentUser();
    this.setupNetworkListener();
    this.loadUsers();
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

      // Load users from local storage first
      const cachedUsers = JSON.parse(localStorage.getItem('cachedUsers') || '[]');
      this.messages = cachedUsers.filter(user => user.id !== this.currentUser.id);

      try {
        // Fetch from Firestore and update local storage
        const snapshot = await getDocs(usersRef);
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        localStorage.setItem('cachedUsers', JSON.stringify(users));
        this.messages = users.filter(user => user.id !== this.currentUser.id);

        // Set up real-time listener
        onSnapshot(usersRef, (snapshot) => {
          const updatedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          localStorage.setItem('cachedUsers', JSON.stringify(updatedUsers));
          this.messages = updatedUsers.filter(user => user.id !== this.currentUser.id);
        }, (error) => {
          console.error('Error in real-time listener:', error);
          this.offline = true;
        });
      } catch (error) {
        console.error('Error fetching users:', error);
        this.offline = true;
      }
    },
    selectContact(contact) {
      this.selectedContact = contact;
      this.loadChatMessages(contact.id);
    },
    async loadChatMessages(contactId) {
      const chatRef = collection(db, 'messages');
      const q = query(chatRef, orderBy('textTimestamp', 'asc'));

      // Load messages from local storage first
      const cachedMessages = JSON.parse(localStorage.getItem(`chatMessages_${contactId}`) || '[]');
      this.chatMessages = this.filterAndFormatMessages(cachedMessages, contactId);

      try {
        // Fetch from Firestore and update local storage
        const snapshot = await getDocs(q);
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          textTimestamp: doc.data().textTimestamp?.toDate(),
        }));
        localStorage.setItem(`chatMessages_${contactId}`, JSON.stringify(messages));
        this.chatMessages = this.filterAndFormatMessages(messages, contactId);

        // Set up real-time listener
        onSnapshot(q, (snapshot) => {
          const updatedMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            textTimestamp: doc.data().textTimestamp?.toDate(),
          }));
          localStorage.setItem(`chatMessages_${contactId}`, JSON.stringify(updatedMessages));
          this.chatMessages = this.filterAndFormatMessages(updatedMessages, contactId);
        }, (error) => {
          console.error('Error in real-time listener for messages:', error);
        });
      } catch (error) {
        console.error('Error loading chat messages:', error);
      }
    },
    filterAndFormatMessages(messages, contactId) {
      return messages
        .filter(msg =>
          (msg.senderId === this.currentUser.id && msg.receiverId === contactId) ||
          (msg.senderId === contactId && msg.receiverId === this.currentUser.id)
        )
        .map(msg => ({
          ...msg,
          textTimestamp: msg.textTimestamp instanceof Date ? msg.textTimestamp : new Date(msg.textTimestamp),
        }));
    },
    async sendMessage() {
      if (!this.newMessage || !this.selectedContact) return;

      const newMsg = {
        senderId: this.currentUser.id,
        receiverId: this.selectedContact.id,
        text: this.newMessage,
        textTimestamp: new Date(),
      };

      // Optimistically update UI
      this.chatMessages.push(newMsg);

      try {
        await addDoc(collection(db, 'messages'), {
          ...newMsg,
          textTimestamp: serverTimestamp(),
        });

        // Update local storage
        const cachedMessages = JSON.parse(localStorage.getItem(`chatMessages_${this.selectedContact.id}`) || '[]');
        cachedMessages.push(newMsg);
        localStorage.setItem(`chatMessages_${this.selectedContact.id}`, JSON.stringify(cachedMessages));

        this.newMessage = ''; // Clear input
      } catch (error) {
        console.error('Error sending message:', error);
        // You might want to notify the user that the message wasn't sent
      }
    },
    formatMessage(message) {
      return message.replace(/:\)/g, '😊').replace(/:\(/g, '😢');
    },
    formatTimestamp(timestamp) {
      return timestamp ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    },
    isMuted(contactId) {
      return this.mutedContacts.has(contactId);
    },
    toggleMute(contactId) {
      if (this.isMuted(contactId)) {
        this.mutedContacts.delete(contactId);
      } else {
        this.mutedContacts.add(contactId);
      }
      // Persist muted contacts to localStorage
      localStorage.setItem('mutedContacts', JSON.stringify(Array.from(this.mutedContacts)));
    },
    setupNetworkListener() {
      window.addEventListener('online', () => {
        this.offline = false;
        this.loadUsers(); // Refresh data when coming back online
      });

      window.addEventListener('offline', () => {
        this.offline = true;
      });

      // Initial offline status
      this.offline = !navigator.onLine;
    },
  },
  mounted() {
    // Load muted contacts from localStorage
    const savedMutedContacts = JSON.parse(localStorage.getItem('mutedContacts') || '[]');
    this.mutedContacts = new Set(savedMutedContacts);
  },
};
</script>