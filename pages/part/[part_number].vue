<template>
  <Head>
      <Title>{{ `${getPartNumber(partDetails)} - ${partDetails.manufacturer.name} - ${partDetails.title}` }}</Title>
      <Meta name="description" :content="`Part #: ${getPartNumber(partDetails)} by ${partDetails.manufacturer.name} -- ${partDetails.title} -- High-quality parts for Healthcare Technology Management.`" />
      <Meta property="og:title" :content="`${getPartNumber(partDetails)} - ${partDetails.manufacturer.name} | ${partDetails.title}`" />
      <Meta property="og:description" :content="`Part #: ${getPartNumber(partDetails)} by ${partDetails.manufacturer.name} -- ${partDetails.title} -- High-quality parts for Healthcare Technology Management.`" />
    </Head>
  <div class="container mx-auto p-4" v-if="!pending && partDetails">
    <div class="text-right mb-4">
      <button @click="goBack" class="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Back to List
      </button>
    </div>
    <div class="flex flex-wrap">
      <div class="w-full lg:w-1/2 p-2">
        <h2 class="text-2xl font-bold">{{ partDetails.title }}</h2>
        <h3>{{ partDetails.manufacturer?.name }} — Part # {{ partDetails.part_number }}</h3>
        <a :href="`https://www.multi-inc.com/request-a-quote-parts?part_numbers=${partDetails.part_number}`"
          target="_blank"
          class="inline-block bg-orange-500 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded my-2">
          Request a Quote
        </a>
        <div v-html="unescapedContent" class="product-content mt-4"></div>
      </div>
      <div class="w-full lg:w-1/2 p-2">
        <div v-if="partDetails.primary_image">
          <Carousel id="gallery" :itemsToShow="1" :wrapAround="false">
            <Slide v-for="image in partDetails.gallery" :key="image.id">
              <img :src="image.src" :alt="`Image of ${partDetails.title}`" />
            </Slide>
            <template #addons>
              <Navigation />
            </template>
          </Carousel>

          <!-- <Carousel id="gallery" :modelValue="currentSlide" @update:modelValue="updateCurrentSlide" :itemsToShow="1" :wrapAround="false">
            <Slide v-for="image in partDetails.gallery" :key="image.id">
              <img :src="image.src" :alt="`Image of ${partDetails.title}`" />
            </Slide>
            <template #addons>
              <Navigation />
            </template>
          </Carousel> -->

          <!-- <Carousel id="thumbnails" :modelValue="currentSlide" @update:modelValue="updateCurrentSlide" :itemsToShow="4" :wrapAround="false">
            <Slide v-for="image in partDetails.gallery" :key="image.id">
              <img :src="image.src" :alt="`Image of ${partDetails.title}`" @click="updateCurrentSlide(image.id)" />
            </Slide>
          </Carousel> -->
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    Loading...
  </div>
</template>
  
<script setup>
import { useRoute, useRouter  } from 'vue-router'
import { useAsyncData } from '#imports'
import { usePartsService } from '~/services/partsService'
import he from 'he';

const route = useRoute()
const { fetchPartDetails } = usePartsService()

const router = useRouter();

function goBack() {
  router.back();
}

const getPartNumber = (part) => {
    return part.display_part_number || part.part_number;
}

// const currentSlide = ref(0);
// const updateCurrentSlide = (val) => {
//   currentSlide.value = val;
// };

// useAsyncData for SSR-compatible fetching
const { data: partDetails, pending, error } = useAsyncData(() => fetchPartDetails(route.params.part_number))

const unescapedContent = computed(() => he.decode(partDetails.value.content));
</script>

<style lang="less" scoped>
h1 {
  color: #2275b5;
  font-size: 20px;
  line-height: 28px;
  font-weight: 500;
  margin-bottom: 25px;
}
h2 {
  color: #304d6d;
  font-size: 38px;
  line-height: 46px;
  font-weight: 600;
  margin-bottom: 25px;
}
hr,
.product-content:deep(hr) {
  border: none;
  border-bottom: 1px dashed #c4cfc7;
  margin: 25px 0;
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
</style>

