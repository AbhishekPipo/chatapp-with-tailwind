<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Chat Header -->
    <div class="flex items-center justify-between p-4 border-b bg-gray-100">
      <div class="flex items-center gap-4">
        <button @click="$emit('back')" class="text-blue-500">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <span class="text-white text-lg font-bold">{{ group.name[0].toUpperCase() }}</span>
          </div>
          <div>
            <h3 class="font-semibold">{{ group.name }}</h3>
            <p class="text-sm text-gray-500">{{ group.members.length }} members</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Body -->
    <div class="flex-1 p-4 overflow-y-auto space-y-4">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['flex', message.user === currentUser ? 'justify-end' : 'justify-start']"
      >
        <div class="w-auto max-w-md">
          <div :class="[message.user === currentUser ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-900', 'rounded-lg p-3 shadow-md']">
            <p class="text-sm">{{ message.text }}</p>
            <p class="text-xs text-right text-gray-500">{{ formatDate(message.timestamp) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="p-4 border-t bg-gray-100">
      <div class="flex items-center">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type a message..."
          class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage" class="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
          <i class="fas fa-paper-plane">SEND</i>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ChatInterface',
  props: {
    group: Object
  },
  data() {
    return {
      newMessage: '',
      currentUser: 'user1', // Simulate current user, replace with actual user data
      messages: [
        // Sample messages
        { user: 'user1', text: 'Hey, how are you?', timestamp: new Date() },
        { user: 'user2', text: 'I’m good, what about you?', timestamp: new Date() },
        { user: 'user1', text: 'Doing great! Thanks for asking.', timestamp: new Date() },
      ]
    };
  },
  methods: {
    messageClass(message) {
      return message.user === this.currentUser
        ? 'self-end' // Align messages from the current user to the right
        : 'self-start'; // Align messages from other users to the left
    },
    sendMessage() {
      if (this.newMessage.trim() !== '') {
        this.messages.push({
          user: this.currentUser,
          text: this.newMessage,
          timestamp: new Date()
        });
        this.newMessage = '';
        this.scrollToBottom();
      }
    },
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return `${date.getHours()}:${date.getMinutes()}`;
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const chatBody = this.$el.querySelector('.overflow-y-auto');
        chatBody.scrollTop = chatBody.scrollHeight;
      });
    }
  }
};
</script>

<style scoped>
/* Adjust chat UI based on the message sender */
.self-start {
  align-self: flex-start;
}

.self-end {
  align-self: flex-end;
}

/* Styling for message bubbles */
.bg-blue-100 {
  background-color: #ebf8ff;
}

.text-blue-900 {
  color: #2b6cb0;
}
</style>