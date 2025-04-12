<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <NuxtLink to="/sitemap" class="text-blue-600 hover:underline">
        ← Back to Sitemap
      </NuxtLink>
    </div>

    <h1 class="text-3xl font-bold mb-8">{{ manufacturer.name }} Parts Sitemap</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="part in parts" :key="part.part_number" class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-2">
          <NuxtLink 
            :to="`/part/${part.part_number}`"
            class="text-blue-600 hover:underline"
          >
            {{ part.title }}
          </NuxtLink>
        </h2>
        <p class="text-gray-600">{{ part.description }}</p>
        <div class="mt-2">
          <span class="text-sm text-gray-500">Part #: {{ getPartNumber(part) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePartsService } from '~/services/partsService';
import { computed } from 'vue';

const route = useRoute()
const { slug } = route.params
const partsService = usePartsService()

// Fetch manufacturer and their parts
const { data: manufacturerData } = await useAsyncData(`manufacturer-${slug}`, async () => {
  const manufacturer = await partsService.getManufacturerBySlug(slug)
  if (!manufacturer) return null
  
  // Get all parts by this manufacturer without pagination
  const partsResponse = await partsService.getPartsByManufacturer(manufacturer.id, 1, -1)
  
  // Transform and validate the data
  const transformedData = {
    manufacturer,
    parts: (partsResponse.data || []).map(part => {
      // Ensure required fields exist
      if (!part.part_number) {
        console.warn('Part missing part_number:', part);
      }
      
      // Transform image data
      if (part.primary_image) {
        part.primary_image = {
          id: typeof part.primary_image === 'object' ? part.primary_image.id : part.primary_image,
          src: `https://order.multi-inc.com/assets/${typeof part.primary_image === 'object' ? part.primary_image.id : part.primary_image}?fit=inside&width=100&height=100`,
          alt: part.title || 'Part Image'
        };
      }
      
      // Ensure manufacturer data is properly structured
      if (part.manufacturer && typeof part.manufacturer === 'string') {
        part.manufacturer = { name: part.manufacturer };
      }
      
      return part;
    }),
    totalItems: partsResponse.meta?.filter_count || 0
  };
  
  return transformedData;
})

// Process the data
const manufacturer = computed(() => manufacturerData.value?.manufacturer || {})
const parts = computed(() => manufacturerData.value?.parts || [])

// Helper function to get display part number
const getPartNumber = (part) => {
  return part.display_part_number || part.part_number
}

// SEO metadata
useHead({
  title: `MULTI, Inc. - ${manufacturer.value?.name || 'Manufacturer'} Parts Sitemap`,
  meta: [
    {
      name: 'description',
      content: `Browse all ${manufacturer.value?.name || 'manufacturer'} parts available at MULTI, Inc.`
    }
  ]
})
</script> 