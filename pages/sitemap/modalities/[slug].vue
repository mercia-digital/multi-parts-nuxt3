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
            {{ he.decode(part.title || '') }} -- {{ getPartNumber(part) }}
          </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePartsService } from '~/services/partsService';
import { computed } from 'vue';
import he from 'he';

// Disable default layout to exclude header and footer
definePageMeta({
  layout: false,
  // Generate static HTML at build time
  prerender: {
    enabled: true,
    // Generate all modality sitemaps
    async generate() {
      const partsService = usePartsService()
      const modalities = await partsService.getModalities()
      return modalities.map(modality => ({
        url: `/sitemap/modalities/${encodeURIComponent(modality.name)}`
      }))
    }
  }
})

const route = useRoute()
const { slug } = route.params
const partsService = usePartsService()

// Compute the modality name once
const modalityName = computed(() => decodeURIComponent(slug))

// Fetch parts for the modality
const { data: modalityData } = await useAsyncData(`modality-${slug}`, async () => {
  // Get all parts for this modality without pagination using minimal fields
  const partsResponse = await partsService.getPartsByModalityForSitemap(modalityName.value, 1, -1)
  
  return {
    parts: partsResponse.data || [],
    totalItems: partsResponse.meta?.filter_count || 0
  }
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