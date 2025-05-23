<template>
  <div class="container mx-auto p-4">
    <div v-if="error && error.message === 'Modality not found'" class="error-container text-center py-10">
      <h1 class="text-2xl font-bold mb-4">Modality Not Found</h1>
      <p class="mb-6">The modality you are looking for could not be found.</p>
      <NuxtLink to="/modalities" class="button">Back to Modalities List</NuxtLink>
    </div>
    <div v-else-if="error" class="error-container text-center py-10">
      <h1 class="text-2xl font-bold mb-4">Error Loading Modality</h1>
      <p class="mb-6">{{ error.message }}</p>
      <NuxtLink to="/modalities" class="button">Back to Modalities List</NuxtLink>
    </div>
    
    <div v-else-if="modality" class="modality-details">
      <!-- Breadcrumbs -->
      <Breadcrumbs :items="breadcrumbItems" class="mb-4" />
      
      <div class="text-right mb-10">
        <button @click="goBack" class="button go-back">
          Back to List
        </button>
      </div>
      
      <div class="modality-header text-center">
        <h1 class="text-3xl font-bold mt-4">{{ modality.name }}</h1>
        <p v-if="modality.description" class="mt-2 text-gray-700" v-html="modalityDescription"></p>
      </div>
      
      <div class="parts-section mt-8">
        <h2 class="text-xl font-bold mb-4 text-center">Parts for {{ modality.name }}</h2>
        
        <div v-if="parts && parts.length > 0">
          <div id="parts-list">
            <div class="w-full lg:table table-auto">
              <div class="text-white table-header-group">
                <div class="table-row table-header">
                  <div class="table-cell px-4 py-2">Image</div>
                  <div class="table-cell px-4 py-2">Part Number</div>
                  <div class="table-cell px-4 py-2">Part Description</div>
                  <div class="table-cell px-4 py-2">Manufacturer</div>
                  <div class="table-cell px-4 py-2"></div> <!-- Actions Column -->
                </div>
              </div>
              <div v-for="part in parts" :key="part.part_number" class="part">
                <div class="image text-center p-2">
                  <img :src="getImageUrl(part.primary_image)" 
                       class="w-100px w-100px mx-auto"
                       :alt="part.title || 'Part image'" />
                </div>
                <div class="pn p-2"><label>Part Number</label>{{ getPartNumber(part) }}</div>
                <div class="title p-2 uppercase"><label>Part Description</label>{{ part.title }}</div>
                <div class="manufacturer p-2"><label>Manufacturer</label>{{ part.manufacturer?.name || 'N/A' }}</div>
                <div class="actions p-2 flex justify-around">
                  <NuxtLink :to="`/part/${part.part_number}`" class="button m-1">View Part</NuxtLink>
                  <a :href="`https://www.multi-inc.com/request-a-quote-parts?part_numbers=${getPartNumber(part)}`"
                      class="button m-1" target="_blank">Request a Quote</a>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div id="pagination" class="flex justify-center items-center gap-2 mt-4">
            <button @click="goToPage(page - 1)" :disabled="page === 1"><i class="fa-solid fa-arrow-left"></i></button>
            <button v-for="p in paginationRange" :key="p" @click="goToPage(p)" class="number"
              :class="[{ 'current': p === page }]">
              {{ p }}
            </button>
            <button @click="goToPage(page + 1)" :disabled="page === totalPages"><i class="fa-solid fa-arrow-right"></i></button>
          </div>
          <div id="pagination" class="flex justify-center items-center gap-2 mt-4">
            <button @click="goToPage(1)" :disabled="page === 1"><i class="fa-solid fa-arrow-left-to-line"></i> First</button>
            <button @click="goToPage(totalPages)" :disabled="page === totalPages">Last <i class="fa-solid fa-arrow-right-to-line"></i></button>
          </div>
          <div class="showing text-center">
            Showing {{ page != 1 ? (page - 1) * limit + 1 : 1 }} to {{ Math.min(limit * page, totalItems) }}
            of {{ totalItems }} records
          </div>
          <div class="flex justify-end">
            <div class="ppp m-4 p-2 rounded">
              <label>Parts Per Page:</label>
              <select v-model="limit" @change="changeLimit" class="rounded-full p-2">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
        <div v-else-if="!partsPending" class="text-center py-10">
          <h3 class="text-xl">No parts found for this modality.</h3>
          <p class="mt-2">Please check back later or browse other modalities.</p>
        </div>
         <div v-if="partsPending" class="text-center py-10">
          <p>Loading parts...</p>
        </div>
      </div>
    </div>
     <div v-else-if="dataPending" class="text-center py-20">
      <p>Loading modality details...</p> <!-- Or a spinner component -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter, createError } from '#app'; // Assuming Nuxt 3 imports
import { useAsyncData, useHead,navigateTo } from '#app';
import { usePartsService } from '~/services/partsService';
import Breadcrumbs from '~/components/Breadcrumbs.vue';
import he from 'he';

const route = useRoute();
const router = useRouter();
const { getModalityBySlug, getPartsByModality } = usePartsService();

// Pagination state from query params
const page = ref(parseInt(route.query.page) || 1);
const limit = ref(parseInt(route.query.limit) || 25);
const dataPending = ref(true); // For initial modality load
const partsPending = ref(false); // Specifically for parts loading after modality is fetched

const { data: modalityData, error } = await useAsyncData(
  `modality-${route.params.slug}-${page.value}-${limit.value}`,
  async () => {
    dataPending.value = true;
    partsPending.value = true;
    try {
      const currentSlug = route.params.slug;
      const modality = await getModalityBySlug(currentSlug);
      
      if (!modality) {
        dataPending.value = false;
        partsPending.value = false;
        // Use Nuxt's createError for proper 404 handling
        throw createError({ statusCode: 404, message: 'Modality not found', fatal: true });
      }
      
      // Fetch parts only if modality is found
      // Make sure getPartsByModality handles empty parts list gracefully
      const partsResponse = await getPartsByModality(modality.name, page.value, limit.value);

      dataPending.value = false;
      partsPending.value = false;
      return {
        ...modality,
        parts: partsResponse?.data || [],
        totalItems: partsResponse?.meta?.filter_count || 0,
      };
    } catch (err) {
      dataPending.value = false;
      partsPending.value = false;
      // Re-throw error to be caught by Nuxt error handling or displayed by the template
      if (err.statusCode === 404) {
        return null; // Allows template to handle "Modality not found" specifically if error object is checked
      }
      throw err; // For other errors
    }
  },
  { 
    watch: [() => route.query.page, () => route.query.limit, () => route.params.slug] 
  }
);

// Computed properties for template
const modality = computed(() => modalityData.value);
const parts = computed(() => modalityData.value?.parts || []);
const totalItems = computed(() => modalityData.value?.totalItems || 0);

// Handle case where modalityData is null (e.g., 404 handled by error prop)
if (!modality.value && !error.value) {
   // This can happen if useAsyncData returns null without an error (e.g. if modified to return null on 404)
   // Or if data is still pending for some reason and not yet available.
   // For a direct 404, the error.value should be set by createError.
}


// Pagination
const totalPages = computed(() => Math.ceil(totalItems.value / limit.value));
const paginationRange = computed(() => {
  const totalDisplayed = 5;
  let start = page.value - Math.floor(totalDisplayed / 2);
  start = Math.max(start, 1);
  let end = start + totalDisplayed - 1;
  end = Math.min(end, totalPages.value);
  if (end - start + 1 < totalDisplayed && start > 1) {
    start = Math.max(end - totalDisplayed + 1, 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

const updateUrl = () => {
  const queryParams = { ...route.query };
  if (page.value !== 1) queryParams.page = page.value;
  else delete queryParams.page;
  if (limit.value !== 25) queryParams.limit = limit.value;
  else delete queryParams.limit;
  router.push({ path: route.path, query: queryParams });
};

const goToPage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value || newPage === page.value) return;
  page.value = newPage;
  updateUrl();
};

const changeLimit = (event) => {
  limit.value = parseInt(event.target.value);
  page.value = 1;
  updateUrl();
};

// Helper functions
const getPartNumber = (part) => part.display_part_number || part.part_number;
const getImageUrl = (image) => {
  if (!image || !image.id) return 'https://order.multi-inc.com/assets/56e3344c-a815-4804-9745-d9d05987ce6a?fit=inside&width=100&height=100&format=webp'; // Default placeholder
  return `https://order.multi-inc.com/assets/${image.id}?fit=inside&width=100&height=100&format=webp`;
};

const modalityDescription = computed(() => {
  if (!modality.value || !modality.value.description) return '';
  return he.decode(modality.value.description);
});

// Breadcrumbs
const breadcrumbItems = computed(() => {
  if (!modality.value) return [
    { name: 'Home', path: '/' },
    { name: 'Modalities', path: '/modalities' },
  ];
  return [
    { name: 'Home', path: '/' },
    { name: 'Modalities', path: '/modalities' },
    { name: modality.value.name, path: `/modality/${route.params.slug}` }
  ];
});

// Navigation
const goBack = () => {
  navigateTo('/modalities');
};

// SEO
useHead(() => {
  const baseTitle = modality.value ? `Modality ${modality.value.name} Parts` : 'Modality Parts';
  const pageTitle = `${baseTitle} | MULTI, INC.`;
  const pageDescription = modality.value 
    ? `Find and order parts for ${modality.value.name} medical equipment. Browse our extensive catalog at MULTI, INC.`
    : 'Browse parts for various medical equipment modalities at MULTI, INC.';
  const canonicalUrl = `https://parts.multi-inc.com/modality/${route.params.slug}`;

  const schemaOrg = [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ProductGroup', // Using ProductGroup for a category of products
        name: modality.value?.name || 'Modality',
        description: modality.value?.description ? he.decode(modality.value.description).replace(/<[^>]*>/g, '') : pageDescription,
        url: canonicalUrl,
        // If parts are loaded and you want to list them (can be verbose)
        // "hasProduct": parts.value.map(part => ({
        //   "@type": "Product",
        //   "name": part.title,
        //   "partNumber": getPartNumber(part),
        //   "url": `https://parts.multi-inc.com/part/${part.part_number}`,
        //   "image": getImageUrl(part.primary_image),
        //   "manufacturer": part.manufacturer?.name ? { "@type": "Organization", "name": part.manufacturer.name } : undefined
        // }))
      }),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems.value.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `https://parts.multi-inc.com${item.path}`,
        })),
      }),
    },
  ];

  return {
    title: pageTitle,
    meta: [
      { name: 'description', content: pageDescription.substring(0,160) },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: pageDescription.substring(0,160) },
      { property: 'og:url', content: canonicalUrl },
      // Add og:image if a relevant image for the modality exists
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl }
    ],
    script: schemaOrg,
  };
});

</script>

<style scoped>
/* Styles are largely copied from manufacturer/[slug].vue, with minor adjustments if needed */
.error-container {
  text-align: center;
  padding: 2rem;
}

.button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem; /* equivalent to rounded-md */
  text-decoration: none;
  transition: background-color 0.3s;
  background-color: #304d6d; /* Theme primary color */
  color: white;
  font-weight: 600; /* semibold */
}
.button:hover {
  background-color: #1e3a5f; /* Darker shade for hover */
}

.go-back {
  background-color: #304d6d;
  color: white;
}
.go-back:hover {
  background-color: #1e3a5f;
}

.modality-header {
  margin-bottom: 1.5rem;
}

.parts-section {
  margin-top: 2rem; /* Reduced from 8rem to 2rem */
}

#parts-list {
  font-size: 16px; /* Adjusted from 18px */
  margin-bottom: 50px;

  @media screen and (min-width: 1024px) {
    border-right: 1px solid #d2e9fc;
    border-bottom: 1px solid #d2e9fc;

    .table-cell,
    .part>div {
      border-top: 1px solid #d2e9fc;
      border-left: 1px solid #d2e9fc;
    }
  }

  .table-header-group {
    @media screen and (max-width: 1023px) {
      display: none;
    }
  }

  .table-header {
    background-color: #304d6d;

    .table-cell {
      vertical-align: middle;
      text-align: center;
      font-weight: bold;
    }
  }

  &>div { /* This targets the direct div children of #parts-list */
    @media screen and (max-width: 1023px) { /* For tablets */
      display: grid;
      grid-template-columns: 1fr; /* Stack parts in a single column */
      gap: 20px; /* Space between part cards */
    }
  }

  .part {
    @media screen and (min-width: 1024px) { /* Desktop view: table row */
      display: table-row;

      &>div { /* Direct div children are table cells */
        display: table-cell;
        vertical-align: middle;
        text-align: center;

        label {
          display: none;
        }

        &:first-of-type { /* Image cell */
          height: 115px;
        }
      }

      &:nth-of-type(odd) {
        background-color: #eff7ff;
      }
    }

    @media screen and (max-width: 1023px) { /* Mobile/Tablet view: card */
      max-width: 580px; /* Max width for cards on larger tablet screens */
      width: 100%;
      margin: 0 auto 20px auto; /* Centered with bottom margin */
      display: flex;
      flex-direction: column;
      border: solid 1px #d2e9fc;
      border-radius: 8px; /* Rounded corners for card */
      overflow: hidden; /* Ensure content respects border radius */
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* Subtle shadow */

      label {
        &:after {
          content: ':';
        }
        margin-right: 10px;
        font-weight: normal;
        font-style: italic;
        color: #555; /* Softer color for labels */
      }
      
      & > div { /* Styling for sections within the card */
        padding: 12px; /* Consistent padding */
        border-bottom: 1px solid #e2e8f0; /* Separator line */
      }
      & > div:last-child {
        border-bottom: none; /* No border for the last item (actions) */
      }

      .image {
        order: 0;
        background-color: #f8fafc; /* Light background for image area */
        padding: 1rem; /* More padding for image */
      }
      .image img {
        max-height: 150px; /* Slightly larger images in card view */
        width: auto;
      }

      .pn { order: 1; }
      .title { order: 2; word-break: break-word; font-size: 1.1em; font-weight: bold; }
      .manufacturer { order: 3; }

      .actions {
        order: 4;
        background-color: #f8f8f8; /* Light grey background for actions */
        display: flex;
        flex-direction: column; /* Stack buttons on small screens */
        gap: 10px; /* Space between buttons */
        align-items: center;
      }
      .actions .button {
        width: 90%; /* Make buttons wider */
        text-align: center;
      }
       @media screen and (min-width: 480px) { /* Side-by-side buttons on slightly larger screens */
        .actions {
          flex-direction: row;
          justify-content: space-around;
        }
        .actions .button {
          width: auto; /* Auto width for side-by-side */
        }
      }
    }
  }
}

.actions .button {
  background-color: #dc602e; /* Existing button color */
  border-radius: 50px;
  padding: 10px 15px;
  color: #fff;
  white-space: nowrap;
  transition: all .3s ease;
}
.actions .button:hover {
  background-color: #2275b5; /* Existing hover color */
}


/* Pagination styles - largely same as manufacturer page */
#pagination {
  margin-top: 2rem;
  margin-bottom: 1rem;
}
#pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #d2e9fc;
  background-color: white;
  color: #304d6d;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
#pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
#pagination button.number {
  min-width: 2.5rem;
  text-align: center;
}
#pagination button.number.current {
  background-color: #304d6d;
  color: white;
  border-color: #304d6d;
}
#pagination button:hover:not(:disabled) {
  background-color: #eff7ff;
  border-color: #304d6d;
}
#pagination button.number.current:hover {
  background-color: #1e3a5f;
}

.showing {
  text-align: center;
  color: #666;
  margin: 1rem 0;
}

.ppp {
  background-color: #f9f9f9;
  border: 1px solid #d2e9fc;
  border-radius: 0.5rem;
}
.ppp label {
  margin-right: 0.5rem;
  color: #666;
}
.ppp select {
  border: 1px solid #d2e9fc;
  background-color: white;
  color: #304d6d;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
}
.ppp select:hover {
  border-color: #304d6d;
}
</style>
