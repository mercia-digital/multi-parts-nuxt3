<template>
  <div class="container mx-auto px-4 py-8">
    <Breadcrumbs :items="breadcrumbs" />
    <h1 class="text-3xl font-bold my-6">Our Manufacturers</h1>
    <div v-if="error" class="text-red-500">
      <p>There was an error fetching the manufacturers. Please try again later.</p>
      <p>Error: {{ error.message }}</p>
    </div>
    <div v-else-if="pending" class="text-center">
      <p>Loading manufacturers...</p> <!-- Basic loading indicator -->
    </div>
    <div v-else-if="manufacturers && manufacturers.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="manufacturer in manufacturers" :key="manufacturer.id" class="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
        <NuxtLink :to="`/manufacturer/${manufacturer.slug}`" class="flex flex-col items-center text-center">
          <img 
            v-if="manufacturer.logo" 
            :src="getManufacturerLogoUrl(manufacturer.logo)" 
            :alt="`${manufacturer.name} Logo`" 
            class="h-24 w-auto object-contain mb-4"
          />
          <div 
            v-else 
            class="h-24 w-full bg-gray-200 flex items-center justify-center text-gray-500 mb-4 rounded"
          >
            No Logo
          </div>
          <h2 class="text-xl font-semibold">{{ manufacturer.name }}</h2>
        </NuxtLink>
      </div>
    </div>
    <div v-else class="text-center">
      <p>No manufacturers found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCollectionService } from '~/services/collectionService';
import { getManufacturerLogoUrl } from '~/services/partsService'; // Assuming this path and function exist
import Breadcrumbs from '~/components/Breadcrumbs.vue'; // Assuming this path

const { fetchCollection } = useCollectionService();
const manufacturers = ref([]);
const pending = ref(true);
const error = ref(null);

// Breadcrumbs
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Manufacturers', path: '/manufacturer' },
];

// Fetch manufacturers
const loadManufacturers = async () => {
  pending.value = true;
  error.value = null;
  try {
    const { data, error: fetchError } = await fetchCollection({ collection: 'manufacturers', fields: 'id,name,slug,logo.*' });
    if (fetchError.value) {
      throw fetchError.value; // Throw if there's an error in the response
    }
    manufacturers.value = data.value?.data || []; // Directus wraps data in a 'data' property
  } catch (err) {
    console.error('Error fetching manufacturers:', err);
    error.value = err;
  } finally {
    pending.value = false;
  }
};

loadManufacturers();

// SEO
useHead({
  title: 'Manufacturers | MULTI, INC.',
  meta: [
    { name: 'description', content: 'Browse our list of trusted medical equipment manufacturers. Find parts and services from top brands in the industry.' },
    { property: 'og:title', content: 'Manufacturers | MULTI, INC.' },
    { property: 'og:description', content: 'Browse our list of trusted medical equipment manufacturers.' },
    // Add other OG tags as needed, e.g., image
  ],
  link: [
    { rel: 'canonical', href: 'https://parts.multi-inc.com/manufacturer' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Our Manufacturers',
        description: 'List of medical equipment manufacturers featured by MULTI, INC.',
        url: 'https://parts.multi-inc.com/manufacturer',
        // Optionally, list items if the number is manageable
        // "hasPart": manufacturers.value.map(m => ({
        //   "@type": "Organization",
        //   "name": m.name,
        //   "url": `https://parts.multi-inc.com/manufacturer/${m.slug}`
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
