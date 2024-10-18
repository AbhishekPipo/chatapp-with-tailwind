<template>
    <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 class="text-xl font-bold mb-4">Create New Group</h2>
      <form @submit.prevent="createGroup">
        <div class="mb-4">
          <label class="block text-gray-700">Group Name</label>
          <input 
            v-model="groupName" 
            type="text" 
            placeholder="Enter group name" 
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-700">Add Members</label>
          <input 
            v-model="groupMembers" 
            type="text" 
            placeholder="Enter member IDs, separated by commas" 
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button 
          type="submit" 
          class="bg-blue-500 text-white px-4 py-2 rounded-lg w-full mt-4"
        >
          Create Group
        </button>
      </form>
    </div>
  </template>
  
  <script>
  import { db } from '../firebase.js';
  import { collection, addDoc } from 'firebase/firestore';
  
  export default {
    data() {
      return {
        groupName: '',
        groupMembers: ''
      };
    },
    methods: {
      async createGroup() {
        const membersArray = this.groupMembers.split(',').map(member => member.trim());
  
        try {
          await addDoc(collection(db, 'Groups'), {
            name: this.groupName,
            members: membersArray
          });
          this.$router.push('/groups'); // Redirect to the groups list after creating the group
        } catch (error) {
          console.error('Error creating group:', error);
        }
      }
    }
  };
  </script>