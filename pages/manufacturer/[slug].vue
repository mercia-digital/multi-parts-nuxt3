<template>
  <div class="container mx-auto p-4">
    <div v-if="error" class="error-container">
      <h1>Error Loading Manufacturer</h1>
      <p>{{ error.message }}</p>
      <NuxtLink to="/parts" class="back-button">Back to Parts</NuxtLink>
    </div>
    
    <div v-else-if="manufacturer" class="manufacturer-details">
      <!-- Breadcrumbs -->
      <Breadcrumbs :items="breadcrumbItems" class="mb-4" />
      
      <div class="text-right mb-10">
        <button @click="goBack" class="button go-back">
          Back to List
        </button>
      </div>
      
      <div class="manufacturer-header">
        <div class="manufacturer-logo" v-if="manufacturer.logo">
          <img 
            :src="getManufacturerLogoUrl(manufacturer.logo)" 
            :alt="manufacturer.name" 
            class="aspect-4/3"
          />
        </div>
        <h1 class="text-3xl font-bold mt-4">{{ manufacturer.name }}</h1>
        <p v-if="manufacturer.description" class="mt-2">{{ manufacturer.description }}</p>
      </div>
      
      <div class="manufacturer-content" v-if="manufacturer.description">
        <div v-html="manufacturerContent" class="content"></div>
      </div>
      
      <div class="parts-section mt-8">
        <h2 class="text-xl font-bold mb-4">Parts by {{ manufacturer.name }}</h2>
        
        <div v-if="parts">
          <div v-if="totalItems > 0">
            <div id="parts-list">
              <div class="w-full lg:table table-auto">
                <div class="text-white table-header-group">
                  <div class="table-row table-header">
                    <div class="table-cell px-4 py-2">Image</div>
                    <div class="table-cell px-4 py-2">Part Number</div>
                    <div class="table-cell px-4 py-2">Part Description</div>
                    <div class="table-cell px-4 py-2"></div> <!-- Actions Column -->
                  </div>
                </div>
                <div v-for="part in parts" :key="part.part_number" class="part">
                  <div class="image text-center p-2">
                    <img :src="getImageUrl(part.primary_image)" 
                         class="w-100px w-100px mx-auto"
                         :alt="part.title" />
                  </div>
                  <div class="pn p-2"><label>Part Number</label>{{ getPartNumber(part) }}</div>
                  <div class="title p-2 uppercase"><label>Part Description</label>{{ part.title }}</div>
                  <div class="actions p-2 flex justify-around">
                    <a :href="`/part/${part.part_number}`" class="button m-1">View Part</a>
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
              Showing {{ page != 1 ? (page - 1) * limit : 1 }} to {{ limit * page > totalItems ? totalItems : limit * page }}
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
          <div v-else>
            <h3 style="text-align: center; padding: 50px">No parts found for this manufacturer.</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAsyncData, useHead } from '#app';
import { usePartsService, getManufacturerLogoUrl } from '~/services/partsService';
import Breadcrumbs from '~/components/Breadcrumbs.vue';
import he from 'he';

const route = useRoute();
const router = useRouter();
const partsService = usePartsService();

// Pagination state
const page = ref(parseInt(route.query.page) || 1);
const limit = ref(parseInt(route.query.limit) || 25);

// Use Nuxt's useAsyncData for SSR data fetching
const { data: manufacturerData, error, refresh } = await useAsyncData(
  `manufacturer-${route.params.slug}-${page.value}-${limit.value}`,
  async () => {
    try {
      // Get manufacturer data
      const manufacturer = await partsService.getManufacturerBySlug(route.params.slug);
      
      if (!manufacturer) {
        throw new Error('Manufacturer not found');
      }
      
      // Get parts by this manufacturer with pagination
      const partsResponse = await partsService.getPartsByManufacturer(manufacturer.id, page.value, limit.value);
      
      // Transform and validate the data
      const transformedData = {
        ...manufacturer,
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
    } catch (err) {
      console.error('Error fetching manufacturer:', err);
      throw err;
    }
  },
  {
    default: () => null,
    watch: [() => route.query.page, () => route.query.limit]
  }
);

// Watch for route query changes and refresh data
watch([() => route.query.page, () => route.query.limit], () => {
  refresh();
});

// Process data
const manufacturer = computed(() => manufacturerData.value);
const parts = computed(() => manufacturerData.value?.parts || []);
const totalItems = computed(() => manufacturerData.value?.totalItems || 0);

// Pagination computed properties
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

// Function to update the URL parameters
const updateUrl = () => {
  const queryParams = { ...route.query };
  
  if (page.value !== 1) {
    queryParams.page = page.value;
  } else {
    delete queryParams.page;
  }
  
  if (limit.value !== 25) {
    queryParams.limit = limit.value;
  } else {
    delete queryParams.limit;
  }
  
  router.push({ path: route.path, query: queryParams });
};

// Pagination methods
const goToPage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value || newPage === page.value) return;
  page.value = newPage;
  updateUrl();
};

const changeLimit = (event) => {
  limit.value = parseInt(event.target.value);
  page.value = 1; // Reset to first page when changing limit
  updateUrl();
};

// Function to get the display part number if it exists, otherwise use the regular part number
const getPartNumber = (part) => {
  return part.display_part_number || part.part_number;
};

// Get image URL for product images
const getImageUrl = (image) => {
  if (!image) return 'https://order.multi-inc.com/assets/56e3344c-a815-4804-9745-d9d05987ce6a?fit=inside&width=100&height=100';
  return `https://order.multi-inc.com/assets/${image.id}?fit=inside&width=100&height=100`;
};

// Decode HTML content
const manufacturerContent = computed(() => {
  if (!manufacturer.value || !manufacturer.value.description) return '';
  return he.decode(manufacturer.value.description);
});

// Breadcrumb items
const breadcrumbItems = computed(() => {
  if (!manufacturer.value) return [];
  
  return [
    { name: 'Home', path: '/' },
    { name: 'Parts', path: '/parts' },
    { name: manufacturer.value.name, path: `/manufacturer/${route.params.slug}` }
  ];
});

// Navigation
const goBack = () => {
  navigateTo('/parts');
};

// Set SEO meta tags
useHead({
  title: `${manufacturer.value?.name || 'Manufacturer'} | MULTI, INC. Parts Catalog`,
  meta: [
    { name: 'description', content: manufacturer.value?.description ? he.decode(manufacturer.value.description).replace(/<[^>]*>/g, '').substring(0, 160) : 'Browse parts by this manufacturer.' },
    { property: 'og:title', content: `${manufacturer.value?.name || 'Manufacturer'} | MULTI, INC. Parts Catalog` },
    { property: 'og:description', content: manufacturer.value?.description ? he.decode(manufacturer.value.description).replace(/<[^>]*>/g, '').substring(0, 160) : 'Browse parts by this manufacturer.' },
    { name: 'canonical', content: `https://parts.multi-inc.com/manufacturer/${route.params.slug}` }
  ],
  link: [
    { rel: 'canonical', href: `https://parts.multi-inc.com/manufacturer/${route.params.slug}` }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': manufacturer.value?.name || 'Manufacturer',
        'description': manufacturer.value?.description ? he.decode(manufacturer.value.description).replace(/<[^>]*>/g, '') : 'Browse parts by this manufacturer.'
      })
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbItems.value.map((item, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': item.name,
          'item': `https://parts.multi-inc.com${item.path}`
        }))
      })
    }
  ]
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #304d6d;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 2rem;
}

.back-button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #304d6d;
  color: white;
  text-decoration: none;
  border-radius: 0.25rem;
}

.manufacturer-header {
  margin-bottom: 1.5rem;
}

.manufacturer-content {
  margin-bottom: 2rem;
}

.content {
  line-height: 1.6;
}

.parts-section {
  margin-top: 8rem;
}

.no-parts {
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 0.5rem;
  border: 1px dashed #ccc;
}

.button {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  text-decoration: none;
  transition: background-color 0.3s;
}

.go-back {
  background-color: #304d6d;
  color: white;
}

.go-back:hover {
  background-color: #1e3a5f;
}

.request-quote {
  background-color: #4CAF50;
  color: white;
}

.request-quote:hover {
  background-color: #3e8e41;
}

hr.alt {
  border: none;
  border-top: 1px solid #304d6d;
  margin: 1rem 0;
}

#parts-list {
  font-size: 18px;
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

  &>div {
    @media screen and (max-width: 1023px) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    @media screen and (max-width: 768px) {
      display: grid;
      grid-template-columns: 1fr;
    }
  }

  .part {
    @media screen and (min-width: 1024px) {
      display: table-row;

      &>div {
        display: table-cell;
        vertical-align: middle;
        text-align: center;

        label {
          display: none;
        }

        &:first-of-type {
          height: 115px;
        }
      }

      &:nth-of-type(odd) {
        background-color: #eff7ff;
      }
    }

    @media screen and (max-width: 1023px) {
      max-width: 480px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      border: solid 1px #d2e9fc;
      font-weight: bold;

      label {
        &:after {
          content: ':';
        }

        margin-right: 10px;
        font-weight: normal;
        font-style: italic;
      }

      .image {
        order: 0;
        background-color: #eff7ff;
      }

      .pn {
        order: 1;
      }

      .title {
        order: 2;
        word-break: break-word;
      }

      .actions {
        width: 100%;
        order: 3;
        background-color: #eff7ff;
      }
    }
  }
}

.button {
  border-radius: 50px;
  padding: 10px 15px;
  color: #fff;
  white-space: nowrap;
  transition: all .3s ease;
}

.actions {
  .button {
    background-color: #dc602e;

    &:hover {
      background-color: #2275b5;
    }
  }
}

.no-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #666;
  border: 1px dashed #ccc;
}

.manufacturer-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 320px;
  border-radius: 8px;
  padding: 1rem;
}

.manufacturer-logo img {
  max-height: 640px;
  width: auto;
}

/* Add pagination styles */
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