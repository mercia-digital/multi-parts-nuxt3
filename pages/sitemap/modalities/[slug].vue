<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <NuxtLink to="/sitemap" class="text-blue-600 hover:underline">
        ← Back to Sitemap
      </NuxtLink>
    </div>

    <h1 class="text-3xl font-bold mb-8">{{ modalityName }} Parts Sitemap</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="part in parts" :key="part.part_number" class="p-4">
        <NuxtLink 
            :to="`/part/${part.part_number}`"
            class="hover:underline"
          >
            {{ part.title }} -- {{ getPartNumber(part) }}
          </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePartsService } from '~/services/partsService';
import { computed } from 'vue';
import { useStorage } from '~/composables/useStorage';

// Disable default layout to exclude header and footer
definePageMeta({
  layout: false
})

const route = useRoute()
const { slug } = route.params
const partsService = usePartsService()

// Compute the modality name once
const modalityName = computed(() => decodeURIComponent(slug))

// Fetch parts for the modality
const { data: modalityData } = await useAsyncData(`modality-${slug}`, async () => {
  const storage = useStorage()
  const cacheKey = `sitemap:modality:${slug}`
  
  // Try to get cached data
  const cachedData = await storage.getItem(cacheKey)
  if (cachedData) {
    console.log('Cache hit for modality:', slug)
    return cachedData
  }
  
  console.log('Cache miss for modality:', slug)
  // Get all parts for this modality without pagination
  const partsResponse = await partsService.getPartsByModality(modalityName.value, 1, -1)
  
  // Transform and validate the data
  const transformedData = {
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
  
  // Cache the data
  await storage.setItem(cacheKey, transformedData, { ttl: 86400 }) // 24 hours
  
  return transformedData;
}, {
  // Cache the response for 24 hours
  key: `modality-${slug}`,
  cache: {
    maxAge: 86400 // 24 hours in seconds
  }
})

// Process the data
const parts = computed(() => modalityData.value?.parts || [])

// Helper function to get display part number
const getPartNumber = (part) => {
  return part.display_part_number || part.part_number
}

// SEO metadata
useHead({
  title: `MULTI, INC. - ${modalityName.value || 'Modality'} Parts Sitemap`,
  meta: [
    {
      name: 'description',
      content: `Browse all ${modalityName.value || 'modality'} parts available at MULTI, INC.`
    }
  ]
})
</script> 