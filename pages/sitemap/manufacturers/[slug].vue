<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <NuxtLink to="/sitemap" class="text-blue-600 hover:underline">
        ← Back to Sitemap
      </NuxtLink>
    </div>

    <h1 class="text-3xl font-bold mb-8">{{ manufacturer.name }} Parts Sitemap</h1>

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

// Disable default layout to exclude header and footer
definePageMeta({
  layout: false
})

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
  const parts = (partsResponse.data || []).map(part => ({
    part_number: part.part_number,
    display_part_number: part.display_part_number,
    title: part.title
  }))

  return {
    manufacturer,
    parts,
    totalItems: partsResponse.meta?.filter_count || 0
  }
}, {
  // Cache the response for 24 hours
  key: `manufacturer-${slug}`,
  cache: {
    maxAge: 86400 // 24 hours in seconds
  }
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