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
          v-for="message in messages"
          :key="message.id"
          @click="selectContact(message)"
          class="border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
        >
          <div class="block p-4">
            <div class="flex items-center">
              <img
                :src="message.avatar"
                :alt="message.name"
                class="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p class="font-semibold">{{ message.name }}</p>
                <p class="text-sm text-gray-500">{{ message.lastMessage }}</p>
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
        <div v-for="(msg, index) in chatMessages" :key="index" :class="{'text-right': msg.sender === currentUser.name}">
          <div class="flex items-start mb-2">
            <img
              :src="msg.sender === currentUser.name ? currentUser.avatar : selectedContact.avatar"
              alt="User avatar"
              class="w-8 h-8 rounded-full mr-2"
            />
            <div :class="msg.sender === currentUser.name ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'">
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
export default {
  name: 'MessagesView',
  data() {
    return {
      currentUser: {
        name: 'You', // Simulating logged-in user
        avatar: 'https://via.placeholder.com/40',
      },
      messages: [
        { id: 1, name: 'John Doe', avatar: 'https://via.placeholder.com/40', lastMessage: 'Hello there!' },
        { id: 2, name: 'Jane Smith', avatar: 'https://via.placeholder.com/40', lastMessage: 'How are you?' },
        // Add more messages here
      ],
      chatMessages: [], // To store chat messages
      newMessage: '', // For the new message input
      selectedContact: null, // To store the currently selected contact
    };
  },
  methods: {
    selectContact(contact) {
      // Clear current chat messages before selecting a new contact
      this.storeChatMessages();
      this.selectedContact = contact;
      this.chatMessages = []; // Clear messages for the new contact
    },
    sendMessage() {
      if (this.newMessage.trim() && this.selectedContact) {
        // Add the new message to chatMessages array
        this.chatMessages.push({ sender: this.currentUser.name, text: this.newMessage });
        this.newMessage = ''; // Clear the input after sending

        // Optionally, simulate a response from the contact
        this.simulateContactResponse(this.selectedContact.name);
      } else {
        alert('Please enter a message and select a contact!');
      }
    },
    storeChatMessages() {
      if (this.selectedContact) {
        console.log(`Storing messages for ${this.selectedContact.name}:`, this.chatMessages);
        // Here, you can implement logic to persist chat messages to a database or local storage.
      }
    },
    simulateContactResponse(contactName) {
      // Simulate a response from the contact after a delay
      setTimeout(() => {
        this.chatMessages.push({ sender: contactName, text: "Thanks for your message!" });
      }, 1000); // Adjust the delay as needed
    },
  },
};
</script>

<style scoped>
/* Additional styles if needed */
</style>
