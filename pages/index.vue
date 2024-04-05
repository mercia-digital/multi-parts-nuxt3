<template>
    <div class="p-4">
        <div id="search-filters" class="p-6 mb-6 rounded-lg flex flex-wrap gap-4 justify-end">
            <div class="w-9/12 flex-grow">
                <input type="text" v-model="searchTerm" @keyup.enter="fetchAndSetParts" placeholder="Search by Keyword"
                    class="px-4 py-2 w-full border rounded-full" />
            </div>
            <div class="clear-search-wrapper w-2/12">
                <div class="clear-search">
                    <a href="/" class="block button text-center transition-all duration-300">Clear
                        Filters</a>
                </div>
            </div>
            <div class="w-full lg:w-5/12 flex-grow">
                <DropDown @option-selected="selectManufacturer" ref="manufacturerDD" :selected-value="manufacturer"
                    collection="manufacturers" placeholder="Filter by Manufacturer"></DropDown>
            </div>
            <div class="w-full lg:w-5/12 flex-grow">
                <DropDown @option-selected="selectModality" ref="modalityDD" :selected-value="modality"
                    collection="modalities" placeholder="Filter by Modality"></DropDown>
            </div>
        </div>
        <div v-if="parts">
            <div v-if="totalItems > 0">
                <div id="parts-list">
                    <div class="w-full lg:table table-auto">
                        <div class="text-white table-header-group">
                            <div class="table-row table-header">
                                <div class="table-cell px-4 py-2">Image</div>
                                <div class="table-cell px-4 py-2">Brand</div>
                                <div class="table-cell px-4 py-2">Part Number</div>
                                <div class="table-cell px-4 py-2">Part Description</div>
                                <div class="table-cell px-4 py-2"></div> <!-- Actions Column -->
                            </div>
                        </div>
                        <div v-for="part in parts" :key="part.part_number" class="part">
                            <div class="image text-center p-2">
                                <img :src="getImageUrl(part.primary_image)" class="w-100px w-100px mx-auto"
                                    alt="Part image">
                            </div>
                            <div class="manufacturer p-2"><label>Brand</label>{{ part.manufacturer?.name }}</div>
                            <div class="pn p-2"><label>Part Number</label>{{ getPartNumber(part) }}</div>
                            <div class="title p-2 uppercase"><label>Part Description</label>{{ part.title }}</div>
                            <div class="actions p-2 flex justify-around">
                                <a :href="`/part/${part.part_number}`" class="button m-1">View Part</a>
                                <a :href="`https://www.multi-inc.com/request-a-quote-parts?part_numbers=${part.part_number}`"
                                    class="button m-1" target="_blank">Request a Quote</a>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Pagination Controls and Limit Selection -->
                <div id="pagination" class="flex justify-center items-center gap-2 mt-4">
                    <button @click="goToPage(page - 1)" :disabled="page === 1"><i
                            class="fa-solid fa-arrow-left"></i></button>
                    <button v-for="p in paginationRange" :key="p" @click="goToPage(p)" class="number"
                        :class="[{ 'current': p === page }]">
                        {{ p }}
                    </button>
                    <button @click="goToPage(page + 1)" :disabled="page === totalPages"><i
                            class="fa-solid fa-arrow-right"></i></button>
                </div>
                <div id="pagination" class="flex justify-center items-center gap-2 mt-4">
                    <button @click="goToPage(1)" :disabled="page === 1"><i class="fa-solid fa-arrow-left-to-line"></i>
                        First</button>
                    <button @click="goToPage(totalPages)" :disabled="page === totalPages">Last <i
                            class="fa-solid fa-arrow-right-to-line"></i></button>
                </div>
                <div class="showing text-center">
                    Showing {{ page != 1 ? (page - 1) * limit : 1 }} to {{ limit * page > totalItems ? totalItems : limit *
                        page }}
                    of
                    {{ totalItems }} records
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
                <h3 style="text-align: center; padding: 50px">No parts match the specified criteria. Please try a different
                    search.</h3>
            </div>
        </div>
        <div v-else class="loader-wrapper">
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
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePartsService } from '~/services/partsService';

const route = useRoute();
const router = useRouter();
const parts = ref([]);
const page = ref(parseInt(route.query.page) || 1);
const limit = ref(parseInt(route.query.limit) || 25);
const searchTerm = ref(route.query.term || '');
const totalItems = ref(0);
const manufacturer = ref(route.query.manufacturer ? decodeURI(route.query.manufacturer) : '');
const modality = ref(route.query.modality ? decodeURI(route.query.modality) : '');

const manufacturerDD = ref(null);
const modalityDD = ref(null);

// useSeoMeta({
//     title: 'MULTI, INC. Parts Catalog',
//     ogTitle: 'MULTI, INC. Parts Catalog',
//     description: 'MULTI, INC. exists to provide access to authentic parts, services, and technology through our OEM allegiant relationships. Explore our vast parts catalog.',
//     ogDescription: 'MULTI, INC. exists to provide access to authentic parts, services, and technology through our OEM allegiant relationships. Explore our vast parts catalog.',
// });

useHead({
    titleTemplate: '%siteName'
})

const fetchAndSetParts = async () => {
    const { data, error } = await usePartsService().fetchParts({
        page: page.value,
        limit: limit.value,
        term: searchTerm.value,
        manufacturer: manufacturer.value,
        modality: modality.value
    });

    if (error.value) {
        console.error("Failed to fetch parts:", error.value);
        return;
    }

    parts.value = data.value?.data || [];
    totalItems.value = data.value?.meta?.filter_count || 0;
    updateUrl(); // Update URL after fetching
};

watch([page, limit, modality, manufacturer], fetchAndSetParts, { immediate: true });

// Function to update the URL parameters based on the current state
const updateUrl = () => {
    const queryParams = {};

    if (page.value !== 1) queryParams.page = page.value;
    if (limit.value !== 25) queryParams.limit = limit.value;
    if (searchTerm.value) queryParams.term = searchTerm.value;
    if (manufacturer.value) queryParams.manufacturer = manufacturer.value;
    if (modality.value) queryParams.modality = modality.value;

    router.push({ path: '/', query: queryParams });
};

const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages.value || newPage === page.value) return;
    page.value = newPage; // Trigger the watcher to update the URL and fetch parts
};

const changeLimit = (event) => {
    limit.value = parseInt(event.target.value);
};

const getImageUrl = (image) => {
    if (!image) return 'https://order.multi-inc.com/assets/56e3344c-a815-4804-9745-d9d05987ce6a?fit=inside&width=100&height=100';
    return `https://order.multi-inc.com/assets/${image.id}?fit=inside&width=100&height=100`;
}

const getPartNumber = (part) => {
    return part.display_part_number || part.part_number;
}

const selectManufacturer = (option) => {
    manufacturer.value = option.name;
}

const selectModality = (option) => {
    modality.value = option.name;
}

const clearFilters = () => {
    page.value = 1;
    searchTerm.value = '';
    modalityDD.value.clearFilters();
    manufacturerDD.value.clearFilters();
    updateUrl();
}

const totalPages = computed(() => Math.ceil(totalItems.value / limit.value));

const paginationRange = computed(() => {
    const totalDisplayed = 5; // Adjust this to show more or fewer page numbers
    let start = page.value - Math.floor(totalDisplayed / 2);
    start = Math.max(start, 1);
    let end = start + totalDisplayed - 1;
    end = Math.min(end, totalPages.value);
    if (end - start + 1 < totalDisplayed && start > 1) {
        start = Math.max(end - totalDisplayed + 1, 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});
</script>

  
<style lang="less" scoped>
#search-filters {
    background-color: #e0e4e9;

    .clear-search-wrapper {
        @media screen and (max-width: 1023px) {
            min-width: 200px;
            order: 10;
        }

        .clear-search {
            a {
                background-color: #304d6d;

                &:hover {
                    background-color: firebrick;
                }
            }
        }
    }
}

#pagination {
    margin-bottom: 25px;

    button {
        appearance: none;
        border: none;
        background: transparent;

        border-radius: 50px;
        padding: 10px 15px;
        color: #fff;
        white-space: nowrap;
        transition: all .3s ease;
        background-color: #dc602e;
        font-size: 18px;
        line-height: 18px;
        cursor: pointer;

        &.hide-on-mobile {
            @media screen and (max-width: 1023px) {
                display: none;
            }
        }

        &.current {
            cursor: default;
            background-color: #fff;
            color: #dc602e;
            border: solid 2px #dc602e;

            &:hover {
                background-color: #fff;
                color: #dc602e;
                border: solid 2px #dc602e;
            }
        }

        &:last-of-type {
            color: #fff;
            background-color: #dc602e;
            border: none;
            cursor: pointer !important;
        }

        &:hover {
            background-color: #2275b5;
        }
    }
}

.ppp {
    background-color: #e0e4e9;
    font-size: 18px;

    label {
        margin-right: 10px;
    }

    select {
        border: none;
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

            .manufacturer {
                order: 2;
                background-color: #eff7ff;
            }

            .title {
                order: 3;
                word-break: break-word;
            }

            .actions {
                width: 100%;
                order: 4;
                background-color: #eff7ff;
            }
        }
    }
}

.loader-wrapper {
    display: flex;
    justify-content: center;
    padding: 50px;
    .loader {
        scale: 2;
        path:first-of-type {
            fill: #2275b5;
        }

        path:last-of-type {
            fill: #dc602e;
        }
    }

    .spinner_ajPY {
        transform-origin: center;
        animation: spinner_AtaB .75s infinite linear
    }
}

@keyframes spinner_AtaB {
    100% {
        transform: rotate(360deg)
    }
}
</style>
  