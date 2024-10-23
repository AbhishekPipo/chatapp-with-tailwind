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
              {{ user?.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div class="flex-grow">
              <p class="font-semibold">{{ user?.name || 'Unknown User' }}</p>
              <p class="text-sm text-gray-500">{{ user?.lastMessage || 'No messages yet' }}</p>
            </div>
            <span class="text-xs text-gray-400">
              {{ user?.online ? 'Online' : 'Offline' }}
            </span>
          </div>
        </li>
      </ul>
      <div v-if="messages.length === 0" class="p-4 text-center text-gray-500">
        {{ offline ? 'You are offline. Showing cached users.' : 'No users available.' }}
      </div>
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
              {{ selectedContact?.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <h2 class="text-lg font-semibold">{{ selectedContact?.name || 'Unknown User' }}</h2>
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
                {{ selectedContact?.name?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <div 
                :class="[
                  'max-w-[70%] rounded-lg p-3', 
                  msg.senderId === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                ]"
              >
                <p>{{ formatMessage(msg.text || '') }}</p>
                <span class="text-xs opacity-75 block mt-1">
                  {{ formatTimestamp(msg.textTimestamp) }}
                </span>
              </div>
              <div 
                v-if="msg.senderId === currentUser.id"
                class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center ml-2"
              >
                {{ currentUser?.name?.charAt(0)?.toUpperCase() || '?' }}
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
              :disabled="!newMessage.trim()"
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore';
import { useWebSocket } from '../WebSocketManager';

export default {
  name: 'MessagesView',
  setup() {
    const { socket, isConnected, error } = useWebSocket('wss://ws.jam.dev/graphql');

    // State
    const currentUser = ref({
      id: 'currentUserId',
      name: 'You',
    });
    const messages = ref([]);
    const chatMessages = ref([]);
    const newMessage = ref('');
    const selectedContact = ref(null);
    const offline = ref(false);
    const searchQuery = ref('');
    const mutedContacts = ref(new Set());

    // Computed
    const filteredMessages = computed(() => 
      messages.value.filter(user => 
        user?.name?.toLowerCase()?.includes(searchQuery.value?.toLowerCase() || '') ?? false
      )
    );

    // Methods
    const loadCurrentUser = () => {
      try {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          currentUser.value = JSON.parse(userData);
        } else {
          console.error('Current user not found in localStorage');
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };

    const loadUsers = async () => {
      const usersRef = collection(db, 'users');

      // Load users from local storage first
      try {
        const cachedUsers = JSON.parse(localStorage.getItem('cachedUsers') || '[]');
        messages.value = cachedUsers.filter(user => user.id !== currentUser.value?.id);
      } catch (error) {
        console.error('Error loading cached users:', error);
      }

      try {
        // Fetch from Firestore and update local storage
        const snapshot = await getDocs(usersRef);
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        localStorage.setItem('cachedUsers', JSON.stringify(users));
        messages.value = users.filter(user => user.id !== currentUser.value?.id);

        // Set up real-time listener
        const unsubscribe = onSnapshot(usersRef, (snapshot) => {
          const updatedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          localStorage.setItem('cachedUsers', JSON.stringify(updatedUsers));
          messages.value = updatedUsers.filter(user => user.id !== currentUser.value?.id);
        }, (error) => {
          console.error('Error in real-time listener:', error);
          offline.value = true;
        });

        onUnmounted(() => {
          unsubscribe();
        });
      } catch (error) {
        console.error('Error fetching users:', error);
        offline.value = true;
      }
    };

    const selectContact = (contact) => {
      if (!contact?.id) return;
      selectedContact.value = contact;
      loadChatMessages(contact.id);
    };

    const loadChatMessages = async (contactId) => {
      if (!contactId) return;
      
      const chatRef = collection(db, 'messages');
      const q = query(chatRef, orderBy('textTimestamp', 'asc'));

      // Load messages from local storage first
      try {
        const cachedMessages = JSON.parse(localStorage.getItem(`chatMessages_${contactId}`) || '[]');
        chatMessages.value = filterAndFormatMessages(cachedMessages, contactId);
      } catch (error) {
        console.error('Error loading cached messages:', error);
      }

      try {
        // Fetch from Firestore and update local storage
        const snapshot = await getDocs(q);
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          textTimestamp: doc.data().textTimestamp?.toDate(),
        }));
        localStorage.setItem(`chatMessages_${contactId}`, JSON.stringify(messages));
        chatMessages.value = filterAndFormatMessages(messages, contactId);

        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const updatedMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            textTimestamp: doc.data().textTimestamp?.toDate(),
          }));
          localStorage.setItem(`chatMessages_${contactId}`, JSON.stringify(updatedMessages));
          chatMessages.value = filterAndFormatMessages(updatedMessages, contactId);
        }, (error) => {
          console.error('Error in real-time listener for messages:', error);
        });

        onUnmounted(() => {
          unsubscribe();
        });
      } catch (error) {
        console.error('Error loading chat messages:', error);
      }
    };

    const filterAndFormatMessages = (messages, contactId) => {
      if (!messages || !contactId) return [];
      
      return messages
        .filter(msg =>
          (msg?.senderId === currentUser.value?.id && msg?.receiverId === contactId) ||
          (msg?.senderId === contactId && msg?.receiverId === currentUser.value?.id)
        )
        .map(msg => ({
          ...msg,
          textTimestamp: msg.textTimestamp instanceof Date ? msg.textTimestamp : new Date(msg.textTimestamp),
        }));
    };

    const sendMessage = async () => {
      if (!newMessage.value?.trim() || !selectedContact.value?.id) return;

      const newMsg = {
        senderId: currentUser.value?.id,
        receiverId: selectedContact.value?.id,
        text: newMessage.value.trim(),
        textTimestamp: new Date(),
      };

      try {
        // Optimistically update UI
        chatMessages.value.push(newMsg);

        await addDoc(collection(db, 'messages'), {
          ...newMsg,
          textTimestamp: serverTimestamp(),
        });

        // Update local storage
        const cachedMessages = JSON.parse(localStorage.getItem(`chatMessages_${selectedContact.value.id}`) || '[]');
        cachedMessages.push(newMsg);
        localStorage.setItem(`chatMessages_${selectedContact.value.id}`, JSON.stringify(cachedMessages));

        newMessage.value = ''; // Clear input
      } catch (error) {
        console.error('Error sending message:', error);
        // Remove the optimistically added message
        chatMessages.value = chatMessages.value.filter(msg => msg !== newMsg);
      }
    };

    const formatMessage = (message = '') => {
      return message.replace(/:\)/g, '😊').replace(/:\(/g, '😢');
    };

    const formatTimestamp = (timestamp) => {
      if (!timestamp) return '';
      try {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (error) {
        console.error('Error formatting timestamp:', error);
        return '';
      }
    };

    const isMuted = (contactId) => {
      return contactId ? mutedContacts.value.has(contactId) : false;
    };

    const toggleMute = (contactId) => {
      if (!contactId) return;
      
      if (isMuted(contactId)) {
        mutedContacts.value.delete(contactId);
      } else {
        mutedContacts.value.add(contactId);
      }
      // Persist muted contacts to localStorage
      localStorage.setItem('mutedContacts', JSON.stringify(Array.from(mutedContacts.value)));
    };

    const setupNetworkListener = () => {
      const handleOnline = () => {
        offline.value = false;
        loadUsers(); // Refresh data when coming back online
      };

      const handleOffline = () => {
        offline.value = true;
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Initial offline status
      offline.value = !navigator.onLine;

      onUnmounted(() => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page is now visible, refresh data
        loadUsers();
        if (selectedContact.value?.id) {
          loadChatMessages(selectedContact.value.id);
        }
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      loadCurrentUser();
      setupNetworkListener();
      loadUsers();
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Load muted contacts from localStorage
      try {
        const savedMutedContacts = JSON.parse(localStorage.getItem('mutedContacts') || '[]');
        mutedContacts.value = new Set(savedMutedContacts);
      } catch (error) {
        console.error('Error loading muted contacts:', error);
      }
    });

    onUnmounted(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    });

    // Return
    return {
      currentUser,
      messages,
      chatMessages,
      newMessage,
      selectedContact,
      offline,
      searchQuery,
      mutedContacts,
      filteredMessages,
      selectContact,
      sendMessage,
      formatMessage,
      formatTimestamp,
      isMuted,
      toggleMute,
      socket,
      isConnected,
      error
    };
  }
};
</script>