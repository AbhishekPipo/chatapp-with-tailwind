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
            <span class="text-white text-lg font-bold">{{ groupData.name[0].toUpperCase() }}</span>
          </div>
          <div>
            <h3 class="font-semibold">{{ groupData.name }}</h3>
            <p class="text-sm text-gray-500">{{ groupData.members.length }} members</p>
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
            <!-- Show like button only for messages with images -->
            <div v-if="message.imageUrl" class="flex items-center justify-between mt-2">
              <button 
                @click="toggleLike(message)" 
                class="flex items-center gap-1 focus:outline-none"
                :class="{ 'like-animation': isLikeAnimating }"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  :class="[
                    'w-5 h-5 transition-all duration-200 ease-in-out',
                    isLiked(message) ? 'text-red-500 fill-current' : 'text-gray-500'
                  ]"
                  viewBox="0 0 24 24"
                  :fill="isLiked(message) ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span :class="{'text-red-500': isLiked(message)}" class="text-sm">
                  {{ message.likes || 0 }}
                </span>
              </button>
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
          ref="fileInput"
          @change="onFileChange"
          accept="image/*,video/*"
          class="hidden"
        />
        <button @click="triggerFileInput" class="ml-2 text-gray-500">
          <i class="fas fa-link"></i> <!-- Chain icon -->
        </button>
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
      isLikeAnimating: false,
      groupData: { ...this.group }, // Create a copy of the group object

    };
  },
  methods: {
    messageClass(message) {
      return message.senderId === this.currentUser.id
        ? 'self-end'
        : 'self-start';
    },
    triggerFileInput() {
    this.$refs.fileInput.click(); // Programmatically click the hidden file input
  },
    
    isLiked(message) {
      return message.likedBy?.includes(this.currentUser.id) || false;
    },

    async toggleLike(message) {
      if (!message.id) {
        console.error('Message ID is missing');
        return;
      }

      const messageRef = doc(db, 'GroupMessages', this.group.id, 'messages', message.id);
      const isCurrentlyLiked = this.isLiked(message);

      try {
        // Start animation
        this.isLikeAnimating = true;
        
        await updateDoc(messageRef, {
          likes: (message.likes || 0) + (isCurrentlyLiked ? -1 : 1),
          likedBy: isCurrentlyLiked
            ? (message.likedBy || []).filter(id => id !== this.currentUser.id)
            : [...(message.likedBy || []), this.currentUser.id]
        });

        // End animation after a short delay
        setTimeout(() => {
          this.isLikeAnimating = false;
        }, 300);
      } catch (error) {
        console.error('Error toggling like:', error);
        this.isLikeAnimating = false;
      }
    },

    async sendMessage() {
      if (this.newMessage.trim() !== '' || this.file) {
        const messageData = {
          sender: this.currentUser.name,
          senderId: this.currentUser.id,
          content: this.newMessage.trim(),
          timestamp: serverTimestamp(), // Firebase timestamp
          time: new Date().toLocaleTimeString(),
          likes: 0,
          likedBy: [] // Initialize empty likedBy array
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
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => {
      const aTimestamp = a.timestamp ? a.timestamp.toMillis() : 0; // Handle null timestamps
      const bTimestamp = b.timestamp ? b.timestamp.toMillis() : 0; // Handle null timestamps
      return aTimestamp - bTimestamp; // Sort in ascending order
    });

    this.scrollToBottom(); // Scroll to bottom after loading messages
  });
},
listenForGroupMembers() {
    const groupRef = doc(db, 'Groups', this.group.id); // Fetch group document by ID
    onSnapshot(groupRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const groupData = docSnapshot.data();
        this.groupData.members = groupData.members || []; // Update the local copy of members
      } else {
        console.error('Group document does not exist');
      }
    });
  },

    scrollToBottom() {
      this.$nextTick(() => {
        const chatBody = this.$el.querySelector('.flex-1');
        chatBody.scrollTop = chatBody.scrollHeight;
      });
    }
  },
  mounted() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    this.listenForMessages();
    this.listenForGroupMembers(); // Listen for changes in group members
  }
};
</script>
<style>
.like-animation {
  animation: likeAnimation 0.3s ease;
}

@keyframes likeAnimation {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
