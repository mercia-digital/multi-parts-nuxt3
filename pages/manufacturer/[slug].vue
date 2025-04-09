<template>
  <div class="container mx-auto p-4">
    <div v-if="pending" class="loading-container">
      <div class="spinner"></div>
      <p>Loading manufacturer details...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
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
        
        <div v-if="parts.length === 0" class="no-parts">
          <p>No parts found for this manufacturer.</p>
          <p class="mt-2">Please check back later or contact us for more information.</p>
          <a href="https://www.multi-inc.com/contact" target="_blank" class="button request-quote mt-4">
            Contact Us
          </a>
        </div>
        
        <div v-else id="parts-list">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAsyncData, useHead } from '#app';
import { usePartsService, getManufacturerLogoUrl } from '~/services/partsService';
import Breadcrumbs from '~/components/Breadcrumbs.vue';
import he from 'he';

const route = useRoute();
const router = useRouter();
const partsService = usePartsService();

// Fetch manufacturer data
const { data: manufacturer, pending, error } = await useAsyncData(
  `manufacturer-${route.params.slug}`,
  async () => {
    try {
      // Get manufacturer data
      const manufacturerData = await partsService.getManufacturerBySlug(route.params.slug);
      
      if (!manufacturerData) {
        throw new Error('Manufacturer not found');
      }
      
      // Get parts by this manufacturer
      const partsData = await partsService.getPartsByManufacturer(manufacturerData.id);
      
      return {
        ...manufacturerData,
        parts: partsData || []
      };
    } catch (err) {
      console.error('Error fetching manufacturer:', err);
      throw err;
    }
  },
  {
    default: () => null,
    key: `manufacturer-${route.params.slug}`
  }
);

// Process parts data
const parts = computed(() => {
  if (!manufacturer.value || !manufacturer.value.parts) return [];
  
  return manufacturer.value.parts.map(part => {
    // Debug logging for part number fields    
    return part;
  });
});

// Function to get the display part number if it exists, otherwise use the regular part number
const getPartNumber = (part) => {
  return part.display_part_number || part.part_number;
};

// Get image URL for product images
const getImageUrl = (image) => {
  if (!image) return 'https://order.multi-inc.com/assets/56e3344c-a815-4804-9745-d9d05987ce6a?fit=inside&width=100&height=100';
  return `https://order.multi-inc.com/assets/${image.id.id}?fit=inside&width=100&height=100`;
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
</style> 