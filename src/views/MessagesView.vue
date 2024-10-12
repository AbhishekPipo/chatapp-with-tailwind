<template>
    <div class="flex h-full">
      <!-- Message list -->
      <div class="w-1/3 bg-white rounded-lg shadow mr-4 overflow-y-auto">
        <div class="p-4 border-b">
          <input type="text" placeholder="Search" class="w-full px-3 py-2 border rounded-lg">
        </div>
        <ul>
          <li v-for="message in messages" :key="message.id" class="border-b last:border-b-0">
            <a href="#" class="block p-4 hover:bg-gray-50">
              <div class="flex items-center">
                <img :src="message.avatar" :alt="message.name" class="w-10 h-10 rounded-full mr-3">
                <div>
                  <p class="font-semibold">{{ message.name }}</p>
                  <p class="text-sm text-gray-500">{{ message.lastMessage }}</p>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </div>
      
      <!-- Message content -->
      <div class="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <!-- Chat header -->
        <div class="p-4 border-b flex items-center justify-between">
          <div class="flex items-center">
            <img src="https://via.placeholder.com/40" alt="User avatar" class="w-10 h-10 rounded-full mr-3">
            <h2 class="text-lg font-semibold">Jason Binoffe</h2>
          </div>
          <button class="px-4 py-2 bg-gray-100 rounded-lg">View Profile</button>
        </div>
        
        <!-- Chat messages -->
        <div class="flex-1 overflow-y-auto p-4">
          <!-- Messages go here -->
        </div>
        
        <!-- Message input -->
        <div class="border-t p-4">
          <div class="flex items-center">
            <input type="text" placeholder="Type a message..." class="flex-1 px-4 py-2 border rounded-lg mr-2">
            <button class="px-4 py-2 bg-blue-500 text-white rounded-lg">Send</button>
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
        messages: [
          { id: 1, name: 'John Doe', avatar: 'https://via.placeholder.com/40', lastMessage: 'Hello there!' },
          { id: 2, name: 'Jane Smith', avatar: 'https://via.placeholder.com/40', lastMessage: 'How are you?' },
          // Add more messages here
        ]
      }
    }
  }
  </script>
  