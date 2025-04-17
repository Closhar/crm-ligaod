<template>
    <div @click="openModal" class="has-many-field cursor-pointer flex items-center">
      <Icon name="mdi:link" size="1.5em" />
      <span class="ml-2">{{ relatedCount }}</span>
    </div>
  
    <Modal v-if="showModal" @close="closeModal">
      <template #header>
        <h3>Related Records</h3>
      </template>
      <template #body>
        <table>
          <thead>
            <tr>
              <th>Record Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in relatedRecords" :key="record.id">
              <td>{{ record.name }}</td>
              <td>
                <button @click="deleteRecord(record.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <button @click="addRecord">Add Record</button>
      </template>
    </Modal>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    name: 'HasManyField',
    props: {
      apiUrl: {
        type: String,
        required: true
      },
      relatedId: {
        type: Number,
        required: true
      }
    },
    setup(props) {
      const showModal = ref(false);
      const relatedRecords = ref([]);
      const relatedCount = ref(0);
  
      const fetchRecords = async () => {
        const response = await fetch(`${props.apiUrl}/${props.relatedId}`);
        const records = await response.json();
        relatedRecords.value = records;
        relatedCount.value = records.length;
      };
  
      const openModal = async () => {
        await fetchRecords();
        showModal.value = true;
      };
  
      const closeModal = () => {
        showModal.value = false;
      };
  
      const deleteRecord = async (id) => {
        await fetch(`${props.apiUrl}/${id}`, { method: 'DELETE' });
        await fetchRecords(); // Refresh the records
      };
  
      const addRecord = async () => {
        // Logic to add a new record (e.g., open a form to add a new record)
      };
  
      return {
        showModal,
        relatedRecords,
        relatedCount,
        openModal,
        closeModal,
        deleteRecord,
        addRecord
      };
    }
  };
  </script>
  
  <style scoped>
  .has-many-field {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  </style>