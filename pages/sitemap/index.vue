<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">MULTI, Inc. Sitemap</h1>
    
    <!-- Manufacturers Section -->
    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-6">Manufacturers</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <NuxtLink 
          v-for="manufacturer in manufacturers" 
          :key="manufacturer.slug"
          :to="`/sitemap/manufacturers/${manufacturer.slug}`"
          class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div class="text-center">
            <div class="text-lg font-medium text-blue-600 hover:text-blue-800">
              {{ manufacturer.name }}
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Modalities Section -->
    <div>
      <h2 class="text-2xl font-semibold mb-6">Modalities</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink 
          v-for="modality in modalities" 
          :key="modality.name"
          :to="`/sitemap/modalities/${encodeURIComponent(modality.name)}`"
          class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div class="text-center">
            <div class="text-lg font-medium text-blue-600 hover:text-blue-800">
              {{ modality.name }}
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCollectionService } from '~/services/collectionService';
import { computed } from 'vue';

// Fetch manufacturers and modalities data using the collection service
const { data: manufacturersData } = await useAsyncData('manufacturers', () => 
  useCollectionService().fetchCollection({ collection: 'manufacturers' })
)

const { data: modalitiesData } = await useAsyncData('modalities', () => 
  useCollectionService().fetchCollection({ collection: 'modalities' })
)

// Process the data
const manufacturers = computed(() => manufacturersData.value?.data.data || [])
const modalities = computed(() => modalitiesData.value?.data.data || [])

// SEO metadata
useHead({
  title: 'MULTI, Inc. - Sitemap',
  meta: [
    {
      name: 'description',
      content: 'Browse our comprehensive sitemap to find medical equipment parts by manufacturer and modality.'
    }
  ]
})
</script> 