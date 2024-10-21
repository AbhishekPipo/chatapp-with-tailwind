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
      <div v-for="message in messages" :key="message.id" class="flex flex-col">
        <!-- Display the sender's name above the message -->
        <p :class="[messageClass(message), 'text-xs text-gray-600']">{{ message.sender }}</p>
        <div :class="[messageClass(message), 'max-w-xs lg:max-w-md']">
          <div class="bg-blue-100 text-blue-900 rounded-lg p-3 shadow-md">
            <p class="text-sm">{{ message.content }}</p>
            <p v-if="message.imageUrl" class="text-sm">
              <img :src="message.imageUrl" alt="Uploaded image" class="w-full rounded-lg" />
            </p>
            <p v-if="message.videoUrl" class="text-sm">
              <video controls class="w-full rounded-lg">
                <source :src="message.videoUrl" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </p>
            <p class="text-xs text-right text-gray-500">{{ message.time }}</p>
            <div class="flex items-center justify-between mt-2">
              <button @click="likeMessage(message)" class="text-blue-500">Like</button>
              <span class="text-xs text-gray-500">{{ message.likes || 0 }} likes</span>
            </div>
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
        <input
          type="file"
          @change="onFileChange"
          accept="image/*,video/*"
          class="ml-2"
        />
        <button @click="sendMessage" class="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
          <i class="fas fa-paper-plane"></i>
          SEND
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, addDoc, onSnapshot, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export default {
  name: 'ChatInterface',
  props: {
    group: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      newMessage: '',
      currentUser: {}, // Will be populated from localStorage
      messages: [], // Will contain messages with their IDs
      file: null,
    };
  },
  methods: {
    messageClass(message) {
      return message.senderId === this.currentUser.id
        ? 'self-end'
        : 'self-start';
    },
    async sendMessage() {
      if (this.newMessage.trim() !== '' || this.file) {
        const messageData = {
          sender: this.currentUser.name,
          senderId: this.currentUser.id,
          content: this.newMessage.trim(),
          timestamp: serverTimestamp(),
          time: new Date().toLocaleTimeString(),
          likes: 0
        };

        if (this.file) {
          const fileUrl = await this.uploadFile(this.file);
          if (fileUrl) {
            if (this.file.type.startsWith('image/')) {
              messageData.imageUrl = fileUrl;
            } else if (this.file.type.startsWith('video/')) {
              messageData.videoUrl = fileUrl;
            }
          }
          this.file = null;
        }

        try {
          await addDoc(collection(db, 'GroupMessages', this.group.id, 'messages'), messageData);
          this.newMessage = '';
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    },
    async uploadFile(file) {
      const storage = getStorage();
      const fileName = `${Date.now()}-${file.name}`; // Add timestamp to prevent naming conflicts
      const storageReference = storageRef(storage, `${file.type.startsWith('image/') ? 'images' : 'videos'}/${fileName}`);
      
      try {
        const snapshot = await uploadBytes(storageReference, file);
        return await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error('Error uploading file:', error);
        return null;
      }
    },
    async likeMessage(message) {
  if (!message.id) {
    console.error('Message ID is missing');
    return;
  }

  const messageRef = doc(db, 'GroupMessages', this.group.id, 'messages', message.id);

  // Check if the user has already liked the message
  if (message.likedBy && message.likedBy.includes(this.currentUser.id)) {
    console.log('User has already liked this message');
    return;
  }

  try {
    await updateDoc(messageRef, {
      likes: (message.likes || 0) + 1,
      likedBy: message.likedBy ? [...message.likedBy, this.currentUser.id] : [this.currentUser.id]
    });
  } catch (error) {
    console.error('Error updating likes:', error);
  }
},
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          this.file = file;
        } else {
          alert('Please select an image or video file');
        }
      }
    },
    listenForMessages() {
      const messagesRef = collection(db, 'GroupMessages', this.group.id, 'messages');
      onSnapshot(messagesRef, (snapshot) => {
        this.messages = snapshot.docs.map(doc => ({
          id: doc.id,  // Include the document ID
          ...doc.data()
        }));
        this.scrollToBottom();
      });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const chatBody = this.$el.querySelector('.overflow-y-auto');
        chatBody.scrollTop = chatBody.scrollHeight;
      });
    }
  },
  mounted() {
    // Fetch current user from localStorage
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (storedUser) {
      this.currentUser = storedUser;
    }

    // Start listening for messages
    this.listenForMessages();
  }
};
</script>

<style scoped>
.self-start {
  align-self: flex-start;
  margin-right: auto;
}

.self-end {
  align-self: flex-end;
  margin-left: auto;
}

.bg-blue-100 {
  background-color: #ebf8ff;
}

.text-blue-900 {
  color: #2b6cb0;
}
</style>