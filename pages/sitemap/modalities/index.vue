<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Modalities Sitemap</h1>
    <div v-if="error" class="text-red-500">
      <p>Error fetching modalities: {{ error.message }}</p>
    </div>
    <div v-else-if="pending" class="text-gray-500">
      <p>Loading modalities...</p>
    </div>
    <ul v-else-if="modalities && modalities.length" class="list-disc pl-5">
      <li v-for="modality in modalities" :key="modality.id" class="mb-2">
        <NuxtLink :to="`/sitemap/modalities/${modality.slug}`" class="text-blue-600 hover:underline">
          {{ modality.name }}
        </NuxtLink>
      </li>
    </ul>
    <div v-else class="text-gray-500">
      <p>No modalities found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCollectionService } from '~/services/collectionService';
import { useHead } from '#app'; // Nuxt 3 composable

// Define page meta
definePageMeta({
  layout: false, // Exclude default layout
  prerender: true, // Enable prerendering for static generation
});

const { fetchCollection } = useCollectionService();
const modalities = ref([]);
const pending = ref(true);
const error = ref(null);

// Fetch modalities
const loadModalities = async () => {
  pending.value = true;
  error.value = null;
  try {
    // Ensure 'slug' is fetched along with 'id' and 'name'
    const { data, error: fetchError } = await fetchCollection({
      collection: 'modalities',
      fields: 'id,name,slug', // Explicitly request id, name, and slug
      // sort: 'name' // Optional: if you want to sort by name alphabetically
    });

    if (fetchError.value) {
      throw fetchError.value;
    }
    modalities.value = data.value?.data || [];
  } catch (err) {
    console.error('Error fetching modalities for sitemap:', err);
    error.value = err;
  } finally {
    pending.value = false;
  }
};

// Load modalities on component setup
await loadModalities(); // Using await here makes setup async

// Set SEO and metadata
useHead({
  title: 'Modalities Sitemap | MULTI, INC.',
  meta: [
    { 
      name: 'description', 
      content: 'Sitemap listing all medical equipment modalities available at MULTI, INC. Find links to detailed sitemaps for each modality.' 
    },
    { name: 'robots', content: 'noindex, follow' } // Typically sitemap indexes are not indexed themselves
  ],
  // Add any other relevant head properties, like link tags if needed
});
</script>

<style scoped>
/* Minimal styling as it's a sitemap */
.container {
  font-family: Arial, sans-serif;
  padding: 20px;
}
h1 {
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}
ul {
  margin-top: 10px;
}
li {
  line-height: 1.8;
}
</style>
