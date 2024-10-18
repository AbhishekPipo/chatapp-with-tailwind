<template>
    <div class="flex h-screen">
      <!-- Groups List (Left Sidebar) -->
      <div v-if="!selectedGroup" class="w-full bg-gray-50">
        <div class="max-w-4xl mx-auto p-6">
          <!-- Header -->
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-2xl font-bold">Your Groups</h1>
            <button class="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <i class="fas fa-plus"></i>
              Create New Group
            </button>
          </div>
  
          <!-- Search Bar -->
          <div class="mb-6">
            <div class="relative">
              <input 
                type="text" 
                placeholder="Search groups..." 
                class="w-full px-4 py-3 pl-10 bg-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                v-model="searchQuery"
              />
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
  
          <!-- Groups Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="group in groups" 
              :key="group.id"
              class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              @click="selectGroup(group)"
            >
              <div class="p-4">
                <!-- Group Header -->
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center" :class="group.bgColor">
                    <span class="text-white text-xl font-bold">{{ group.name[0] }}</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg">{{ group.name }}</h3>
                    <p class="text-sm text-gray-500">{{ group.members }} members</p>
                  </div>
                </div>
  
                <!-- Last Message -->
                <div class="mb-4">
                  <p class="text-sm text-gray-600 line-clamp-2">{{ group.lastMessage }}</p>
                </div>
  
                <!-- Group Stats -->
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-clock"></i>
                    <span>{{ group.lastActive }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="fas fa-message"></i>
                    <span>{{ group.messageCount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Chat Interface -->
      <ChatInterface v-else :group="selectedGroup" @back="selectedGroup = null" />
    </div>
  </template>
  
  <script>
  import ChatInterface from '../components/ChatInterface.vue' // Import the previous chat interface component
  
  export default {
    name: 'GroupsView',
    components: {
      ChatInterface
    },
    data() {
      return {
        searchQuery: '',
        selectedGroup: null,
        groups: [
          {
            id: 1,
            name: 'Hatypo Studio',
            members: 5,
            lastMessage: 'Great! 🔥 You can Shot tomorrow. 💪🎯',
            lastActive: '2 min ago',
            messageCount: '2.4k',
            bgColor: 'bg-blue-500'
          },
          {
            id: 2,
            name: 'Design Team',
            members: 8,
            lastMessage: 'The new design system is ready for review. Please check and provide feedback.',
            lastActive: '15 min ago',
            messageCount: '1.8k',
            bgColor: 'bg-purple-500'
          },
          {
            id: 3,
            name: 'Marketing Squad',
            members: 6,
            lastMessage: 'Campaign metrics for Q2 are looking great! Nice work everyone.',
            lastActive: '1 hour ago',
            messageCount: '956',
            bgColor: 'bg-green-500'
          },
          {
            id: 4,
            name: 'Development Hub',
            members: 12,
            lastMessage: 'New sprint planning session scheduled for tomorrow at 10 AM.',
            lastActive: '3 hours ago',
            messageCount: '3.2k',
            bgColor: 'bg-orange-500'
          },
          {
            id: 5,
            name: 'Product Strategy',
            members: 7,
            lastMessage: 'Updated roadmap documents are now available in the shared folder.',
            lastActive: '5 hours ago',
            messageCount: '1.5k',
            bgColor: 'bg-pink-500'
          },
          {
            id: 6,
            name: 'Customer Support',
            members: 9,
            lastMessage: 'New ticket resolution guidelines have been posted.',
            lastActive: 'Yesterday',
            messageCount: '4.1k',
            bgColor: 'bg-teal-500'
          }
        ]
      }
    },
    methods: {
      selectGroup(group) {
        this.selectedGroup = group;
      },
      computed: {
        filteredGroups() {
          return this.groups.filter(group => 
            group.name.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  </style>