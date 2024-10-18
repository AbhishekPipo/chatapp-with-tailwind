<template>
    <div class="flex h-screen bg-gray-50">
      <!-- Main Chat Area -->
      <div class="flex-1 flex flex-col">
        <!-- Header -->
        <div class="h-16 border-b flex items-center px-4 justify-between bg-white">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-white font-bold">H</span>
            </div>
            <div>
              <h1 class="font-semibold">Hatypo Studio</h1>
              <p class="text-sm text-gray-500">Raul Typing...</p>
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
          <div class="text-center text-sm text-gray-500 mb-4">Today, June 13</div>
          
          <!-- Message 1 -->
          <div class="flex gap-3 mb-4">
            <div class="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-medium">Adhitya P.</span>
                <span class="text-sm text-gray-500">14:23 PM</span>
              </div>
              <p class="bg-white p-3 rounded-lg shadow-sm max-w-md mt-1">
                Hello guys!
                I want to share the results of today's exploration,
              </p>
              <div class="mt-2">
                <img 
                  src="/api/placeholder/300/200"
                  alt="Project preview"
                  class="rounded-lg border shadow-sm"
                />
              </div>
            </div>
          </div>
  
          <!-- Message 2 -->
          <div class="flex gap-3 mb-4">
            <div class="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-medium">Raul Khaq</span>
                <span class="text-sm text-gray-500">15:12 PM</span>
              </div>
              <p class="bg-white p-3 rounded-lg shadow-sm max-w-md mt-1">
                Wow! I like the gradient! Good 😊
              </p>
            </div>
          </div>
  
          <!-- Message 3 -->
          <div class="flex gap-3 mb-4 justify-end">
            <div class="text-right">
              <div class="flex items-center gap-2 justify-end">
                <span class="text-sm text-gray-500">15:13 PM</span>
                <span class="font-medium">You</span>
              </div>
              <p class="bg-blue-500 text-white p-3 rounded-lg shadow-sm max-w-md mt-1">
                Great! 🔥 You can Shot tomorrow. 💪🎯
              </p>
            </div>
            <div class="w-8 h-8 rounded-full bg-blue-300 flex-shrink-0"></div>
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
            <div class="flex gap-2">
              <button class="p-2 hover:bg-gray-200 rounded-full">
                <i class="fas fa-image text-gray-600"></i>
              </button>
              <button class="p-2 hover:bg-gray-200 rounded-full">
                <i class="fas fa-smile text-gray-600"></i>
              </button>
              <button class="p-2 hover:bg-gray-200 rounded-full">
                <i class="fas fa-paper-plane text-gray-600"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Right Sidebar -->
      <div class="w-80 border-l bg-white">
        <div class="p-4">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-white text-2xl font-bold">H</span>
            </div>
          </div>
          <h2 class="text-xl font-bold text-center">Hatypo Studio</h2>
          <p class="text-center text-gray-500 text-sm">Create something New</p>
        </div>
  
        <!-- Members Section -->
        <div class="border-t">
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold">Members</h3>
              <i class="fas fa-chevron-down"></i>
            </div>
            <button class="flex items-center gap-2 text-blue-500 mb-4">
              <i class="fas fa-plus"></i>
              <span>Add Member</span>
            </button>
            <div class="space-y-3">
              <div v-for="member in members" :key="member" class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-gray-300"></div>
                <span>{{ member }}</span>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Attachments Section -->
        <div class="border-t">
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold">Attachments</h3>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="space-y-3">
              <div v-for="attachment in attachments" :key="attachment.type" class="flex items-center gap-3">
                <i :class="attachment.icon + ' text-gray-600'"></i>
                <div class="flex-1">
                  <div class="font-medium">{{ attachment.type }}</div>
                  <div class="text-sm text-gray-500">{{ attachment.files }} Files - {{ attachment.size }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ChatInterface',
    data() {
      return {
        newMessage: '',
        members: [
          'Faza Dzikrulloh',
          'Adhitya P.',
          'Raul Khaq',
          'Vito Arvy',
          'Nola Sofyan'
        ],
        attachments: [
          {
            type: 'Document',
            files: '129',
            size: '375 MB',
            icon: 'fas fa-file-alt'
          },
          {
            type: 'Photo',
            files: '938',
            size: '1.7 GB',
            icon: 'fas fa-image'
          },
          {
            type: 'Videos',
            files: '96',
            size: '2.3 GB',
            icon: 'fas fa-video'
          },
          {
            type: 'Other Files',
            files: '171',
            size: '1.9 GB',
            icon: 'fas fa-folder'
          }
        ]
      }
    },
    methods: {
      // Add methods for handling messages, uploads, etc.
    }
  }
  </script>
  
  <style scoped>
  /* Add any additional custom styles here */
  </style>