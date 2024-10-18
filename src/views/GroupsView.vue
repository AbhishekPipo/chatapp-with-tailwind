<template>
  <div class="flex h-screen">
    <!-- Groups List (Left Sidebar) -->
    <div v-if="!selectedGroup" class="w-full bg-gray-50">
      <div class="max-w-4xl mx-auto p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-2xl font-bold">Your Groups</h1>
          <button @click="$router.push('/create-group')" class="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <i class="fas fa-plus"></i> Create New Group
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
            v-for="group in filteredGroups" 
            :key="group.id"
            class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            @click="selectGroup(group)"
          >
            <div class="p-4">
              <!-- Group Header -->
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <span class="text-white text-xl font-bold">{{ group.name[0].toUpperCase() }}</span> <!-- First letter of the group name -->
                </div>
                <div>
                  <h3 class="font-semibold text-lg">{{ group.name }}</h3>
                  <p class="text-sm text-gray-500">{{ group.members.length }} members</p>
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
import { collection, getDocs } from "firebase/firestore"; // Import Firestore methods
import { db } from '../firebase'; // Import the Firebase Firestore instance
import ChatInterface from '../components/ChatInterface.vue'; // Import the previous chat interface component

export default {
  name: 'GroupsView',
  components: {
    ChatInterface
  },
  data() {
    return {
      searchQuery: '',
      selectedGroup: null,
      groups: [] // Initialize groups array as empty
    };
  },
  computed: {
    filteredGroups() {
      return this.groups.filter(group => 
        group.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },
  methods: {
    selectGroup(group) {
      this.selectedGroup = group;
    },
    async fetchGroups() {
      const groupsSnapshot = await getDocs(collection(db, "Groups")); // Fetch the groups from Firebase Firestore
      const groupsArray = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() // Destructure and assign the document data to the group object
      }));
      this.groups = groupsArray; // Update the groups array with fetched data
    }
  },
  async mounted() {
    await this.fetchGroups(); // Fetch groups when the component is mounted
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
