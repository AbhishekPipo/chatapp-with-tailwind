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

    <!-- Likes List Popup -->
    <div v-if="showLikesPopup" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Liked by</h3>
          <button @click="closeLikesPopup" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="max-h-64 overflow-y-auto">
          <div v-if="selectedMessage?.likedBy?.length" class="space-y-2">
            <div v-for="userId in selectedMessage.likedBy" :key="userId" class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
              <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span class="text-white text-sm">{{ getUserInitial(userId) }}</span>
              </div>
              <span>{{ getUserName(userId) }}</span>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-4">
            No likes yet
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Body -->
    <div class="flex-1 p-4 overflow-y-auto space-y-4">
      <div v-for="message in messages" :key="message.id" class="flex flex-col">
        <p :class="[messageClass(message), 'text-xs text-gray-600']">{{ message.sender }}</p>
        <div :class="[messageClass(message), 'max-w-xs lg:max-w-md']">
          <div class="bg-blue-100 text-blue-900 rounded-lg p-3 shadow-md">
            <p class="text-sm">{{ message.content }}</p>

            <!-- Image with Comments -->
            <div v-if="message.imageUrl" class="space-y-2">
              <img :src="message.imageUrl" alt="Uploaded image" class="w-full rounded-lg" />
              
              <!-- Comments Section -->
              <div class="mt-2 pt-2 border-t border-blue-200">
                <!-- Comment Input -->
                <div class="flex items-center gap-2 mb-2">
                  <input
                    v-model="commentInputs[message.id]"
                    type="text"
                    placeholder="Add a comment..."
                    class="flex-1 px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    @keyup.enter="addComment(message.id)"
                  />
                  <button 
                    @click="addComment(message.id)"
                    class="text-blue-500 hover:text-blue-700"
                  >
                    <i class="fas fa-paper-plane"></i>
                  </button>
                </div>

                <!-- Comments List -->
                <div class="space-y-2">
                  <div v-if="message.comments && message.comments.length > 0">
                    <div 
                      v-for="(comment, index) in message.comments" 
                      :key="index"
                      class="flex items-start gap-2 group"
                    >
                      <div class="w-6 h-6 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center">
                        <span class="text-white text-xs">{{ comment.sender[0].toUpperCase() }}</span>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-baseline gap-2">
                          <span class="text-xs font-semibold">{{ comment.sender }}</span>
                          <span class="text-xs text-gray-500">{{ comment.time }}</span>
                        </div>
                        <p class="text-sm">{{ comment.content }}</p>
                      </div>
                      <!-- Delete comment button -->
                      <button 
                        v-if="comment.senderId === currentUser.id"
                        @click="deleteComment(message.id, index)"
                        class="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i class="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Likes -->
              <div class="flex items-center justify-between mt-2">
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
                  <span 
                    @click.stop="openLikesPopup(message)" 
                    :class="{'text-red-500': isLiked(message)}" 
                    class="text-sm cursor-pointer hover:underline"
                  >
                    {{ message.likes || 0 }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Video Content -->
            <p v-if="message.videoUrl" class="text-sm">
              <video controls class="w-full rounded-lg">
                <source :src="message.videoUrl" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </p>
            <p class="text-xs text-right text-gray-500">{{ message.time }}</p>
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
          <i class="fas fa-link"></i>
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
import { collection, addDoc, onSnapshot, serverTimestamp, updateDoc, doc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
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
      currentUser: {}, // assuming you populate this with the current user's info
      messages: [],
      file: null,
      isLikeAnimating: false,
      groupData: { ...this.group },
      showLikesPopup: false,
      selectedMessage: null,
      userCache: {}, // cache to store fetched user details
      commentInputs: {}, // stores comments for each message
    };
  },
  methods: {
    // Determine the message alignment (left or right)
    messageClass(message) {
      return message.senderId === this.currentUser.id ? 'self-end' : 'self-start';
    },
    
    // Open file upload dialog
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    // Show popup of users who liked the message
    openLikesPopup(message) {
      this.selectedMessage = message;
      this.showLikesPopup = true;
      if (message.likedBy) {
        message.likedBy.forEach(this.fetchUserData);
      }
    },
    
    // Close the likes popup
    closeLikesPopup() {
      this.showLikesPopup = false;
      this.selectedMessage = null;
    },
    
    // Fetch user details from Firestore if not already cached
    async fetchUserData(userId) {
      if (this.userCache[userId]) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          this.userCache[userId] = userDoc.data();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },
    
    // Get the user's name from cache
    getUserName(userId) {
      return this.userCache[userId]?.name || 'Unknown User';
    },
    
    // Get the user's initial (first letter of their name)
    getUserInitial(userId) {
      const name = this.getUserName(userId);
      return name[0]?.toUpperCase() || '?';
    },

    // Add a comment to the message
    async addComment(messageId) {
  console.log(messageId, 'message id');

  const comment = this.commentInputs[messageId]?.trim();
  if (!comment) return;

  const messageRef = doc(db, 'GroupMessages', this.group.id, 'messages', messageId);
  const newComment = {
    content: comment,
    sender: this.currentUser.name,
    senderId: this.currentUser.id,
    time: new Date().toLocaleTimeString(), // local time
  };

  try {
    // First, set the timestamp in a separate update
    await updateDoc(messageRef, {
      timestamp: serverTimestamp() // Set the server timestamp separately
    });

    // Then, add the new comment without using serverTimestamp inside arrayUnion
    await updateDoc(messageRef, {
      comments: arrayUnion(newComment)
    });

    this.commentInputs[messageId] = ''; // Clear input after submitting
  } catch (error) {
    console.error('Error adding comment:', error);
  }
},

    // Delete a comment from the message
    async deleteComment(messageId, commentIndex) {
      const message = this.messages.find(m => m.id === messageId);
      if (!message || !message.comments) return;

      const commentToDelete = message.comments[commentIndex];
      if (commentToDelete.senderId !== this.currentUser.id) return;

      const messageRef = doc(db, 'GroupMessages', this.group.id, 'messages', messageId);

      try {
        await updateDoc(messageRef, {
          comments: arrayRemove(commentToDelete)
        });
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    },

    // Check if the current user has liked the message
    isLiked(message) {
      return message.likedBy?.includes(this.currentUser.id) || false;
    },

    // Toggle the like/unlike functionality for a message
    async toggleLike(message) {
      if (!message.id) {
        console.error('Message ID is missing');
        return;
      }

      const messageRef = doc(db, 'GroupMessages', this.group.id, 'messages', message.id);
      const isCurrentlyLiked = this.isLiked(message);

      try {
        this.isLikeAnimating = true;
        
        await updateDoc(messageRef, {
          likes: (message.likes || 0) + (isCurrentlyLiked ? -1 : 1),
          likedBy: isCurrentlyLiked
            ? (message.likedBy || []).filter(id => id !== this.currentUser.id)
            : [...(message.likedBy || []), this.currentUser.id]
        });

        setTimeout(() => {
          this.isLikeAnimating = false;
        }, 300);
      } catch (error) {
        console.error('Error toggling like:', error);
        this.isLikeAnimating = false;
      }
    },

    // Handle the sending of a message
    async sendMessage() {
      if (this.newMessage.trim() !== '' || this.file) {
        const messageData = {
          sender: this.currentUser.name,
          senderId: this.currentUser.id,
          content: this.newMessage.trim(),
          timestamp: serverTimestamp(),
          time: new Date().toLocaleTimeString(),
          likes: 0,
          likedBy: [],
          comments: []
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
        }

        try {
          await addDoc(collection(db, 'GroupMessages', this.group.id, 'messages'), messageData);
          this.newMessage = ''; // Clear message input
          this.file = null; // Reset file input
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    },

    // Handle file upload (image/video)
    async uploadFile(file) {
      const storage = getStorage();
      const storageReference = storageRef(storage, `uploads/${file.name}`);
      
      try {
        const snapshot = await uploadBytes(storageReference, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
      } catch (error) {
        console.error('Error uploading file:', error);
        return null;
      }
    },

    // Handle file input change (for image/video)
    onFileChange(event) {
      const files = event.target.files;
      if (files && files.length > 0) {
        this.file = files[0];
      }
    }
  },
  async created() {
    // Fetch group data when component is mounted
    this.currentUser = {
      id: '123', // Set your current user's ID here
      name: 'John Doe' // Set your current user's name here
    };
    
    const messagesQuery = collection(db, 'GroupMessages', this.group.id, 'messages');
    onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      this.messages = newMessages;
    });
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