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
import { useCollectionService } from '~/services/collectionService'; // Added for generate function
import { computed } from 'vue';
import { useRoute, useAsyncData, createError, useHead } from '#app'; // Ensure createError and useHead are imported

// Disable default layout to exclude header and footer
definePageMeta({
  layout: false,
  prerender: {
    enabled: true,
    async generate() {
      const { fetchCollection } = useCollectionService(); 
      try {
        const { data: modalitiesResponse } = await fetchCollection({ 
          collection: 'modalities', 
          fields: 'slug,name' // Fetch slug and name
        });
        const modalities = modalitiesResponse.value?.data || [];
        if (!modalities.length) {
          console.warn('Sitemap generation: No modalities found for sitemap/modalities/[slug].vue');
          return [];
        }
        return modalities.map(modality => {
          if (!modality.slug) {
            console.warn(`Sitemap generation: Modality "${modality.name || 'Unknown'}" is missing a slug.`);
            return null; 
          }
          return { url: `/sitemap/modalities/${modality.slug}` }; // Use slug here
        }).filter(item => item !== null);
      } catch (e) {
        console.error('Error during sitemap generation for modalities:', e);
        return []; 
      }
    }
  }
});

const route = useRoute();
const partsService = usePartsService();
const { slug } = route.params;

// Fetch modality details and its parts for the sitemap
const { data: pageData, error } = await useAsyncData(
  `modality-sitemap-${slug}`, 
  async () => {
    const modalityDetails = await partsService.getModalityBySlug(slug);

    if (!modalityDetails) {
      // Throw a 404 error if modality is not found, Nuxt will handle rendering the error page
      throw createError({ statusCode: 404, message: `Modality with slug "${slug}" not found.`, fatal: true });
    }
    
    // Fetch parts using the name from the fetched modalityDetails
    const partsResponse = await partsService.getPartsByModalityForSitemap(modalityDetails.name, 1, -1); // -1 for limit to get all parts
    
    return {
      modality: modalityDetails, // Store the fetched modality details
      parts: partsResponse?.data || [],
      totalItems: partsResponse?.meta?.filter_count || 0
    };
  }
  // No explicit key needed here, useAsyncData generates one. Caching can be added if desired.
);

// Computed properties to access modality and parts data
const modality = computed(() => pageData.value?.modality);
const parts = computed(() => pageData.value?.parts || []);
// Use the fetched modality name for display. Fallback to decoded slug if modality data isn't loaded yet.
const modalityName = computed(() => modality.value?.name || decodeURIComponent(slug));

// Helper function to get display part number or fall back to part_number
const getPartNumber = (part) => {
  return part.display_part_number || part.part_number;
};

// SEO metadata using computed properties for dynamic content
useHead(() => ({
  title: `Parts Sitemap for ${modalityName.value} | MULTI, INC.`,
  meta: [
    {
      name: 'description',
      content: `Sitemap listing all available parts for the ${modalityName.value} modality at MULTI, INC. Find direct links to part details.`
    },
    { name: 'robots', content: 'noindex, follow' } // Sitemaps themselves are often not indexed
  ],
  link: [
    // Ensure the canonical URL uses the slug from the route parameters
    { rel: 'canonical', href: `https://parts.multi-inc.com/sitemap/modalities/${slug}` }
  ]
}));
</script>