<template>
  <div class="container mx-auto p-4" v-if="!pending && partDetails">
    <!-- Breadcrumbs -->
    <Breadcrumbs :items="breadcrumbItems" class="mb-4" />
    
    <div class="text-right mb-10">
      <button @click="goBack" class="button go-back">
        Back to List
      </button>
    </div>
    <div class="flex flex-wrap">
      <div class="w-full p-2 text-left">
        <h1 class="text-2xl font-bold">{{ partTitle }}</h1>
        <hr class="alt">
      </div>
      <div class="w-full lg:w-1/2 p-2 text-left">        
        <h2 v-if="partDetails.manufacturer?.name">
          Manufacturer: <span class="meta-value">{{ partDetails.manufacturer?.name }}</span>
        </h2>
        <h2>Part Number: <span class="meta-value">{{ getPartNumber(partDetails) }}</span></h2>
        <h3 v-if="partDetails.modalities && partDetails.modalities.length">Modality: <span class="meta-value"><span v-for="mod in partDetails.modalities" class="modality">{{ mod.modalities_id.name }}</span></span></h3>
        <hr>
        <div>
          <ul>
            <li v-if="partDetails.condition"><h3>Condition: <span class="meta-value" style="text-transform: capitalize;">{{ partDetails.condition }}</span></h3></li>
            <li v-else><h3>Condition: <span class="meta-value">New</span></h3></li>
            <li v-if="partDetails.warranty"><h3>Warranty: <span class="meta-value">{{ partDetails.warranty }}</span></h3></li>
            <li v-if="returnableText !== null"><h3>Returnable: <span class="meta-value">{{ returnableText }}</span></h3></li>
            <li><h3>OEM Quality Assurance: <span class="meta-value">Passed</span></h3></li>
            <li><h3>Lead Times: <span class="meta-value">Most parts shipped from inventory on the same day.</span></h3></li>            
            <li><h3 style="display: inline-block">Accurate Pricing:</h3> <a :href="`https://www.multi-inc.com/request-a-quote-parts?part_numbers=${getPartNumber(partDetails)}`"
            target="_blank"
            class="button request-quote">
            Request a Quote
          </a></li>
          </ul>
        </div>
        <hr>        
        <div v-html="partContent" class="product-content"></div>
        <div class="other-attributes" v-if="partDetails.attributes && partDetails.attributes.length">
          <h3>Other Attributes</h3>
          <div class="attributes-grid">
            <div class="attribute" v-for="(item, index) in partDetails.attributes" :key="index">
              <label>{{ item.name }}</label>
              <h4>{{ item.value }}</h4>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full lg:w-1/2 p-2">
        <div class="gallery-wrapper">
          <div class="gallery-main">
            <img v-if="currentImage && currentImage.src" :src="currentImage.src" :alt="`Image of ${partTitle}`" />
            <div v-else class="no-image-placeholder">
              <p>No image available</p>
            </div>
          </div>
          <div class="gallery-thumbs grid grid-cols-4 gap-2" v-if="partDetails.gallery && partDetails.gallery.length > 1">
            <img v-for="image in partDetails.gallery" 
                 :key="image.id" 
                 :src="image.src" 
                 :alt="`Image of ${partTitle}`" 
                 @click="updateCurrentSlide(image.id)"
                 class="w-full cursor-pointer border-2 border-[#2f4c6c] border-solid"/>
        </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="error" class="container mx-auto p-4 text-center">
    <h2 class="text-2xl font-bold text-red-600">Error Loading Part</h2>
    <p class="mt-4">{{ error.message || 'Unable to load part details. Please try again later.' }}</p>
    <button @click="goBack" class="button go-back mt-6">
      Back to List
    </button>
  </div>
  <div v-else class="container mx-auto p-4 text-center">
    <div class="loader-wrapper">
      <svg class="loader" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" />
        <path
          d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
          class="spinner_ajPY" />
      </svg>
    </div>
  </div>
</template>
  
<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePartsService, getManufacturerLogoUrl } from '~/services/partsService';
import he from 'he';
import Breadcrumbs from '~/components/Breadcrumbs.vue';

const router = useRouter();
const route = useRoute();
const partDetails = ref(null);
const currentImage = ref(null);
const pending = ref(true);
const error = ref(null);

// Default SEO values for when data is loading
useSeoMeta({
  title: 'Part Details | MULTI, INC. Parts Catalog',
  ogTitle: 'Part Details | MULTI, INC. Parts Catalog',
  description: 'View detailed information about this part in the MULTI, INC. Parts Catalog.',
  ogDescription: 'View detailed information about this part in the MULTI, INC. Parts Catalog.',
  ogImage: 'https://order.multi-inc.com/assets/default-image',
  twitterCard: 'summary_large_image',
  robots: 'index, follow'
});

useHead({
  link: [
    { rel: 'canonical', href: `https://parts.multi-inc.com/part/${route.params.part_number}` }
  ]
});

const getPartNumber = (part) => {
  if (!part) return '';
    return part.display_part_number || part.part_number;
};

const goBack = () => {
  navigateTo('/parts');
};

const updateCurrentSlide = (imageId) => {
  if (!partDetails.value || !partDetails.value.gallery) return;
  
  // Find the image with the matching ID
  const image = partDetails.value.gallery.find(img => img && img.id === imageId);
  
  // Only update if we found a valid image
  if (image && image.src) {
    currentImage.value = image;
  }
};

// Get image URL for product images
const getImageUrl = (image) => {
  if (!image) return '';
  return `https://order.multi-inc.com/assets/${image.id}?fit=inside&width=100&height=100`;
};

// Fetch part details
const { data: partData, pending: partPending, error: partError } = await useAsyncData(
  `part-${route.params.part_number}`,
  () => usePartsService().fetchPartDetails(route.params.part_number),
  {
    default: () => null,
    key: `part-${route.params.part_number}`,
    transform: (data) => {
      // Ensure all required properties exist to prevent hydration errors
      if (!data) return null;
      
      try {
        // Process primary image - handle as a single file field
        if (data.primary_image) {
          // Check if primary_image is a string (file ID) or an object
          if (typeof data.primary_image === 'string') {
            data.primary_image = {
              id: data.primary_image,
              src: `https://order.multi-inc.com/assets/${data.primary_image}?fit=inside&width=600&height=600`,
              alt: data.title || 'Part Image'
            };
          } else if (data.primary_image.id) {
            // If it's already an object with an id
            data.primary_image = {
              id: data.primary_image.id,
              src: `https://order.multi-inc.com/assets/${data.primary_image.id}?fit=inside&width=600&height=600`,
              alt: data.primary_image.title || data.title || 'Part Image'
            };
          }
        }
        
        // Process gallery images - check the actual structure
        if (data.gallery && Array.isArray(data.gallery) && data.gallery.length > 0) {
          // Safely process gallery images based on the actual structure
          data.gallery = data.gallery.map(img => {
            // Check if the image has the expected structure
            if (img && img.directus_files_id) {
              return {
                id: img.directus_files_id.id || img.directus_files_id,
                src: `https://order.multi-inc.com/assets/${img.directus_files_id.id || img.directus_files_id}?fit=inside&width=600&height=600`,
                alt: (img.directus_files_id.title || data.title || 'Part Image')
              };
            } else if (img && img.id) {
              // Alternative structure
              return {
                id: img.id,
                src: `https://order.multi-inc.com/assets/${img.id}?fit=inside&width=600&height=600`,
                alt: (img.title || data.title || 'Part Image')
              };
            } else {
              // Fallback for unexpected structure
              console.warn('Unexpected gallery image structure:', img);
              return null;
            }
          }).filter(Boolean); // Remove any null entries
          
          // Add primary image to gallery if it exists and isn't already in the gallery
          if (data.primary_image && data.primary_image.id) {
            const primaryImageExists = data.gallery.some(img => img.id === data.primary_image.id);
            if (!primaryImageExists) {
              data.gallery.unshift(data.primary_image);
            }
          }
        } else {
          // If no gallery, create one with just the primary image
          data.gallery = data.primary_image ? [data.primary_image] : [];
        }
        
        // Ensure other properties exist
        data.modalities = data.modalities || [];
        data.attributes = data.attributes || [];
        
        // Ensure manufacturer is properly structured
        if (data.manufacturer && typeof data.manufacturer === 'string') {
          data.manufacturer = { name: data.manufacturer };
        }
        
        return data;
      } catch (error) {
        console.error('Error transforming part data:', error);
        return data; // Return original data if transformation fails
      }
    }
  }
);

// Computed properties that depend on partDetails
const partContent = computed(() => {
  if (!partDetails.value || !partDetails.value.content) return '';
  return he.decode(partDetails.value.content);
});

const partTitle = computed(() => {
  if (!partDetails.value || !partDetails.value.title) return '';
  return he.decode(partDetails.value.title);
});

const returnableText = computed(() => {
  if (!partDetails.value) return null;
  return partDetails.value.returnable === null ? null : (partDetails.value.returnable ? 'Yes' : 'No');
});

// Breadcrumb items
const breadcrumbItems = computed(() => {
  if (!partDetails.value) return [];
  
  // Safely extract manufacturer name and create slug
  let manufacturerName = 'Unknown Manufacturer';
  let manufacturerSlug = 'unknown';
  
  if (partDetails.value.manufacturer) {
    if (typeof partDetails.value.manufacturer === 'object' && partDetails.value.manufacturer.name) {
      manufacturerName = partDetails.value.manufacturer.name;
    } else if (typeof partDetails.value.manufacturer === 'string') {
      manufacturerName = partDetails.value.manufacturer;
    }
    
    // Create a safe slug
    manufacturerSlug = manufacturerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  
  return [
    { name: 'Home', path: '/' },
    { name: 'Parts', path: '/parts' },
    { name: manufacturerName, path: `/manufacturer/${manufacturerSlug}` },
    { name: partDetails.value.title || 'Part Details', path: `/part/${route.params.part_number}` }
  ];
});

// Handle errors and data assignment first
if (partError.value) {
  error.value = partError.value;
  pending.value = false;
} else if (partData.value) {
  partDetails.value = partData.value;
  
  // Set the current image to the first image in the gallery (which should be the primary image)
  if (partDetails.value.gallery && partDetails.value.gallery.length > 0) {
    currentImage.value = partDetails.value.gallery[0];
  } else if (partDetails.value.primary_image) {
    currentImage.value = partDetails.value.primary_image;
  }
  
  pending.value = false;
  
  // Update SEO with actual part data after we have the data
  const partTitle = he.decode(partDetails.value.title || '');
  const partManufacturer = partDetails.value.manufacturer?.name || '';
  const partNumber = getPartNumber(partDetails.value);
  
  const metaTitle = `${partNumber}${partManufacturer ? ' - '+ partManufacturer : ''} - ${partTitle}`;
  const metaDescription = `Part #: ${partNumber}${partManufacturer ? ' by '+ partManufacturer : ''} -- ${partTitle} -- High-quality parts for Healthcare Technology Management.`;
  
  useSeoMeta({
    title: metaTitle,
    ogTitle: metaTitle,
    description: metaDescription,
    ogDescription: metaDescription,
    ogImage: partDetails.value.primary_image?.src || 'https://order.multi-inc.com/assets/default-image',
    twitterCard: 'summary_large_image',
    robots: 'index, follow'
  });
  
  useHead({
    title: `${partDetails.value?.title || 'Part'} | Multi Parts`,
    meta: [
      { name: 'description', content: partDetails.value?.description || 'View detailed information about this Multi part.' },
      { property: 'og:title', content: `${partDetails.value?.title || 'Part'} | Multi Parts` },
      { property: 'og:description', content: partDetails.value?.description || 'View detailed information about this Multi part.' },
      { property: 'og:image', content: partDetails.value?.primary_image?.src || '' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `${partDetails.value?.title || 'Part'} | Multi Parts` },
      { name: 'twitter:description', content: partDetails.value?.description || 'View detailed information about this Multi part.' },
      { name: 'twitter:image', content: partDetails.value?.primary_image?.src || '' }
    ],
    link: [
      { rel: 'canonical', href: `https://parts.nuxt3.multi/part/${route.params.part_number}` }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          'name': partDetails.value?.title || 'Part',
          'image': partDetails.value?.primary_image?.src || '',
          'description': partDetails.value?.description || 'View detailed information about this Multi part.',
          'sku': partDetails.value?.part_number || '',
          'brand': {
            '@type': 'Brand',
            'name': 'Multi'
          },
          'offers': {
            '@type': 'Offer',
            'priceSpecification': {
              '@type': 'PriceSpecification',
              'price': '0',
              'priceCurrency': 'USD',
              'valueAddedTaxIncluded': 'false'
            },
            'availability': 'https://schema.org/InStock',
            'seller': {
              '@type': 'Organization',
              'name': 'Multi',
              'url': 'https://multi-inc.com'
            }
          }
        })
      },
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': breadcrumbItems.value ? breadcrumbItems.value.map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.name || '',
            'item': `https://parts.nuxt3.multi${item.path || ''}`
          })) : []
        })
      }
    ]
  });
}
</script>

<style lang="less" scoped>
ul {
  padding: 0;
  li {
    margin-left: 0;
  }
}
h1 {
  color: #304d6d;
  font-size: 38px;
  line-height: 40px;
  font-weight: 500;
  margin-bottom: 10px;
}
h2 {
  color: #304d6d;
  font-size: 32px;
  line-height: 36px;
  font-weight: 500;
  margin-bottom: 20px;
}
h3 {
  color: #304d6d;
  font-size: 28px;
  line-height: 32px;
  margin-bottom: 20px;
}
.meta-value {
  color: #2275b5;
}
.modality {
  &:after {
    content: ', ';
  }
  &:last-of-type {
    &::after {
      content: '';
    }
  }
}
hr,
.product-content:deep(hr) {
  border: none;
  border-bottom: solid 2px #dedede;
  margin: 25px 0;
  &.alt {
    border-bottom: solid 4px #dedede;
    margin-bottom: 15px;
  }
}

a.request-quote {
  margin: 0!important;
}

.other-attributes {
  .attributes-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    @media screen and (max-width: 600px) {
      grid-template-columns: auto;
    }
    .attribute {
      background-color: #f2f2f2;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      h4 {
        margin: 0;
        padding-top: 20px;
        font-weight: bold;
      }
    }
  }
}

.product-content:deep(h3) {
  font-weight: 400;
  font-size: 33px;
  color: #304d6d;
  line-height: 36px;
}

.product-content:deep(*) {
  line-height: 32px;
  font-size: 18px;
}

.product-content:deep(ul) {
  padding-left: 25px;
  list-style: disc;
}

.title {
  text-transform: uppercase;
}

.button {
    border-radius: 50px;
    padding: 10px 15px;
    color: #fff;
    white-space: nowrap;
    transition: all .3s ease;
    &.go-back {
      background-color: #2275b5;
      border: solid 2px #2275b5;
      &:hover {
        color: #2275b5;
        background-color: #fff;
      }
    }
    &.request-quote {
      background-color: #dc602e;
      margin-bottom: 10px;
      display: inline-block;
      &:hover {
        background-color: #2275b5;
      }
    }
}
</style>