<template>
  <div id="search-filters" class="p-6 mb-6 rounded-lg flex flex-wrap gap-4 justify-end">
    <div class="w-9/12 flex-grow">
      <input 
        type="text" 
        v-model="searchTerm" 
        @keyup.enter="search" 
        placeholder="Search by Keyword"
        class="px-4 py-2 w-full border rounded-full" 
      />
    </div>
    <div class="clear-search-wrapper w-2/12">
      <div class="clear-search">
        <a href="/parts" class="block button text-center transition-all duration-300">Clear Filters</a>
      </div>
    </div>
    <div class="w-full lg:w-5/12 flex-grow">
      <DropDown 
        @option-selected="selectManufacturer" 
        ref="manufacturerDD" 
        :selected-value="manufacturer"
        collection="manufacturers" 
        placeholder="Filter by Manufacturer"
      ></DropDown>
    </div>
    <div class="w-full lg:w-5/12 flex-grow">
      <DropDown 
        @option-selected="selectModality" 
        ref="modalityDD" 
        :selected-value="modality"
        collection="modalities" 
        placeholder="Filter by Modality"
      ></DropDown>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  initialSearchTerm: {
    type: String,
    default: ''
  },
  initialManufacturer: {
    type: String,
    default: ''
  },
  initialModality: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['search', 'clear']);

const router = useRouter();
const route = useRoute();

const searchTerm = ref(props.initialSearchTerm);
const manufacturer = ref(props.initialManufacturer);
const modality = ref(props.initialModality);

const manufacturerDD = ref(null);
const modalityDD = ref(null);

// Function to update the URL parameters based on the current state
const updateUrl = () => {
  const queryParams = { ...route.query };

  if (searchTerm.value) {
    queryParams.term = searchTerm.value;
  } else {
    delete queryParams.term;
  }

  if (manufacturer.value) {
    queryParams.manufacturer = manufacturer.value;
  } else {
    delete queryParams.manufacturer;
  }

  if (modality.value) {
    queryParams.modality = modality.value;
  } else {
    delete queryParams.modality;
  }

  // Preserve page and limit if they exist
  if (!queryParams.page) {
    delete queryParams.page;
  }
  if (!queryParams.limit) {
    delete queryParams.limit;
  }

  router.push({ path: route.path, query: queryParams });
};

// Search function that emits the search event
const search = () => {
  updateUrl();
  emit('search', {
    term: searchTerm.value,
    manufacturer: manufacturer.value,
    modality: modality.value
  });
};

// Clear all filters
const clearFilters = () => {
  searchTerm.value = '';
  manufacturer.value = '';
  modality.value = '';
  
  if (manufacturerDD.value) {
    manufacturerDD.value.clearFilters();
  }
  
  if (modalityDD.value) {
    modalityDD.value.clearFilters();
  }
  
  updateUrl();
  emit('clear');
};

// Select manufacturer from dropdown
const selectManufacturer = (option) => {
  manufacturer.value = option.name;
  search();
};

// Select modality from dropdown
const selectModality = (option) => {
  modality.value = option.name;
  search();
};

// Watch for changes in the route query to update the component state
watch(() => route.query, (newQuery) => {
  if (newQuery.term !== undefined && newQuery.term !== searchTerm.value) {
    searchTerm.value = newQuery.term;
  }
  
  if (newQuery.manufacturer !== undefined && newQuery.manufacturer !== manufacturer.value) {
    manufacturer.value = newQuery.manufacturer;
  }
  
  if (newQuery.modality !== undefined && newQuery.modality !== modality.value) {
    modality.value = newQuery.modality;
  }
}, { deep: true });

// Expose methods to parent components
defineExpose({
  clearFilters,
  search,
  getFilters: () => ({
    term: searchTerm.value,
    manufacturer: manufacturer.value,
    modality: modality.value
  })
});
</script>

<style lang="less" scoped>
#search-filters {
  background-color: #e0e4e9;

  .clear-search-wrapper {
    @media screen and (max-width: 1023px) {
      min-width: 200px;
      order: 10;
    }

    .clear-search {
      a {
        background-color: #304d6d;

        &:hover {
          background-color: firebrick;
        }
      }
    }
  }
}

.button {
  border-radius: 50px;
  padding: 10px 15px;
  color: #fff;
  white-space: nowrap;
  transition: all .3s ease;
}
</style> 