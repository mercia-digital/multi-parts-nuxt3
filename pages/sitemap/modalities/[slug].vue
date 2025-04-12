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

// Disable default layout to exclude header and footer
definePageMeta({
  layout: false
})

const route = useRoute()
const { slug } = route.params

// Compute the modality name once
const modalityName = computed(() => decodeURIComponent(slug))

// Fetch parts for the modality from cached endpoint
const { data: modalityData } = await useAsyncData(`modality-${slug}`, () => 
  $fetch(`/api/sitemap/modalities/${slug}`)
)

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