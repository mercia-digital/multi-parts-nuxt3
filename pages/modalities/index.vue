<template>
  <div class="container mx-auto px-4 py-8">
    <Breadcrumbs :items="breadcrumbs" />
    <h1 class="text-3xl font-bold my-6">Browse by Modality</h1>
    <div v-if="error" class="text-red-500">
      <p>There was an error fetching the modalities. Please try again later.</p>
      <p v-if="error.message">Error: {{ error.message }}</p>
    </div>
    <div v-else-if="pending" class="text-center">
      <p>Loading modalities...</p> <!-- Basic loading indicator -->
    </div>
    <div v-else-if="modalities && modalities.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="modality in modalities" :key="modality.id" class="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow text-center">
        <NuxtLink :to="`/modality/${modality.slug}`" class="flex flex-col items-center">
          <h2 class="text-xl font-semibold">{{ modality.name }}</h2>
        </NuxtLink>
      </div>
    </div>
    <div v-else class="text-center">
      <p>No modalities found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCollectionService } from '~/services/collectionService';
import Breadcrumbs from '~/components/Breadcrumbs.vue';

const { fetchCollection } = useCollectionService();
const modalities = ref([]);
const pending = ref(true);
const error = ref(null);

// Breadcrumbs
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Modalities', path: '/modalities' },
];

// Fetch modalities
const loadModalities = async () => {
  pending.value = true;
  error.value = null;
  try {
    // Specify fields to fetch, especially 'id', 'name', and 'slug'
    const { data, error: fetchError } = await fetchCollection({ 
      collection: 'modalities', 
      fields: 'id,name,slug' // Ensure slug is fetched for the link
    });

    if (fetchError.value) {
      throw fetchError.value; 
    }
    modalities.value = data.value?.data || [];
  } catch (err) {
    console.error('Error fetching modalities:', err);
    error.value = err;
  } finally {
    pending.value = false;
  }
};

onMounted(loadModalities);

// SEO
useHead({
  title: 'Medical Equipment Modalities | MULTI, INC.',
  meta: [
    { name: 'description', content: 'Explore medical equipment parts by modality. Find CT scanners, MRI machines, X-Ray systems, and more at MULTI, INC.' },
    { property: 'og:title', content: 'Medical Equipment Modalities | MULTI, INC.' },
    { property: 'og:description', content: 'Explore medical equipment parts by modality. Find CT scanners, MRI machines, X-Ray systems, and more.' },
    // Add other OG tags as needed
  ],
  link: [
    { rel: 'canonical', href: 'https://parts.multi-inc.com/modalities' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Browse by Modality',
        description: 'List of medical equipment modalities available at MULTI, INC.',
        url: 'https://parts.multi-inc.com/modalities',
        // Optionally, list items if the number is manageable and data is available
        // "hasPart": modalities.value.map(m => ({
        //   "@type": "ProductGroup", // Or appropriate type
        //   "name": m.name,
        //   "url": `https://parts.multi-inc.com/modality/${m.slug}`
        // }))
      }),
    },
  ],
});

</script>

<style scoped>
/* Add any component-specific styles here if needed */
.container {
  /* Basic container styling if not handled globally */
}
</style>
