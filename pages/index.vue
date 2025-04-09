<template>
    <div class="container mx-auto p-4">
        <!-- Hero Section -->
        <div class="hero-section mb-12 text-center">
            <h1 class="text-4xl font-bold mb-4">MULTI, INC. Parts Catalog</h1>
            <p class="text-xl mb-8">Browse our extensive catalog of authentic parts from leading manufacturers</p>
            
            <!-- Search Bar -->
            <div class="search-container max-w-3xl mx-auto mb-8">
                <PartsSearchFilters 
                    ref="searchFilters"
                    :initial-search-term="route.query.term || ''"
                    :initial-manufacturer="route.query.manufacturer ? decodeURI(route.query.manufacturer) : ''"
                    :initial-modality="route.query.modality ? decodeURI(route.query.modality) : ''"
                    @search="goToParts"
                    @clear="goToParts"
                />
            </div>
        </div>
        
        <!-- Manufacturers Section -->
        <div class="manufacturers-section mb-12">
            <h2 class="text-2xl font-bold mb-6 text-center">Browse by Manufacturer</h2>
            
            <div v-if="error" class="text-center py-12 text-red-600">
                <p>Error loading manufacturers. Please try again later.</p>
            </div>
            
            <div v-else class="manufacturers-grid">
                <a 
                    v-for="manufacturer in manufacturers" 
                    :key="manufacturer.id" 
                    :href="`/manufacturer/${manufacturer.slug}`"
                    class="manufacturer-card"
                >
                    <div class="manufacturer-logo" v-if="manufacturer.logo">
                        <img 
                            :src="getImageUrl(manufacturer.logo)" 
                            :alt="manufacturer.name" 
                            class="w-full"
                        />
                    </div>
                    <div v-else class="manufacturer-logo-placeholder">
                        {{ manufacturer.name.charAt(0) }}
                    </div>
                    <h2 class="text-xl font-bold mt-4">{{ manufacturer.name }}</h2>
                </a>
            </div>
        </div>
        
        <!-- Call to Action -->
        <div class="cta-section bg-gray-100 rounded-lg p-8 text-center">
            <h2 class="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p class="mb-6">Browse our complete parts catalog or contact us for assistance.</p>
            <div class="flex flex-wrap justify-center gap-4">
                <a href="/parts" class="px-6 py-3 bg-[#dc602e] text-white rounded-full hover:bg-[#2275b5] transition-colors">
                    Browse All Parts
                </a>
                <a href="https://www.multi-inc.com/contact" target="_blank" class="px-6 py-3 bg-[#304d6d] text-white rounded-full hover:bg-[#1e3a5f] transition-colors">
                    Contact Us
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCollectionService } from '~/services/collectionService';
import { getManufacturerLogoUrl } from '~/services/partsService';

const router = useRouter();
const route = useRoute();
const manufacturers = ref([]);
const error = ref(null);
const searchFilters = ref(null);

// SEO
useSeoMeta({
    title: 'MULTI, INC. Parts Catalog',
    ogTitle: 'MULTI, INC. Parts Catalog',
    description: 'MULTI, INC. exists to provide access to authentic parts, services, and technology through our OEM allegiant relationships. Explore our vast parts catalog.',
    ogDescription: 'MULTI, INC. exists to provide access to authentic parts, services, and technology through our OEM allegiant relationships. Explore our vast parts catalog.',
    ogImage: 'https://order.multi-inc.com/assets/default-image',
    twitterCard: 'summary_large_image',
    robots: 'index, follow'
});

useHead({
    titleTemplate: '%siteName',
    link: [
        { rel: 'canonical', href: 'https://parts.multi-inc.com' }
    ],
    script: [
        {
            type: 'application/ld+json',
            children: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'MULTI, INC. Parts Catalog',
                url: 'https://parts.multi-inc.com',
                description: 'MULTI, INC. exists to provide access to authentic parts, services, and technology through our OEM allegiant relationships.',
                potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                        '@type': 'EntryPoint',
                        urlTemplate: 'https://parts.multi-inc.com/parts?term={search_term_string}'
                    },
                    'query-input': 'required name=search_term_string'
                }
            })
        },
        {
            type: 'application/ld+json',
            children: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'MULTI, INC.',
                url: 'https://multi-inc.com',
                logo: 'https://multi-inc.com/assets/multi-logo',
                sameAs: [
                    'https://www.linkedin.com/company/multi-inc',
                    'https://www.facebook.com/multiinc'
                ]
            })
        }
    ]
});

// Get image URL
const getImageUrl = (image) => {
    if (!image) return '';
    return `https://order.multi-inc.com/assets/${image}`;
};

// Navigate to parts page with search term
const goToParts = () => {
    const filters = searchFilters.value ? searchFilters.value.getFilters() : {};
    
    if (filters.term || filters.manufacturer || filters.modality) {
        router.push({ 
            path: '/parts', 
            query: {
                term: filters.term,
                manufacturer: filters.manufacturer,
                modality: filters.modality
            }
        });
    } else {
        router.push('/parts');
    }
};

// Use Nuxt's data fetching to ensure manufacturers are loaded during SSR
const { data, error: fetchError } = await useCollectionService().fetchCollection({ collection: 'manufacturers' });

if (fetchError.value) {
    error.value = new Error('Failed to fetch manufacturers');
    console.error('Error fetching manufacturers:', fetchError.value);
} else {
    manufacturers.value = data.value?.data || [];
}
</script>

<style scoped>
.manufacturers-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 1.5rem;
    margin-top: 1rem;
}

@media (min-width: 768px) {
    .manufacturers-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .manufacturers-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (min-width: 1280px) {
    .manufacturers-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

.manufacturer-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    text-decoration: none;
    color: inherit;
    height: 100%;
    cursor: pointer;
}

.manufacturer-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.manufacturer-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    height: 100px;
}

.manufacturer-logo-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    background-color: #f3f4f6;
    border-radius: 0.5rem;
    font-size: 2.5rem;
    font-weight: bold;
    color: #6b7280;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
  