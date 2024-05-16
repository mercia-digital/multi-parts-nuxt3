<template>
  <Head>
      <Title>{{ metaTitle }}</Title>
      <Meta name="description" :content="metaDescription" />
      <Meta property="og:title" :content="metaTitle" />
      <Meta property="og:description" :content="metaDescription" />
    </Head>
  <div class="container mx-auto p-4" v-if="!pending && partDetails">
    <div class="text-right mb-4">
      <button @click="goBack" class="button go-back">
        Back to List
      </button>
    </div>
    <div class="flex flex-wrap">
      <div class="w-full lg:w-1/2 p-2 text-left">
        <h1 class="text-2xl font-bold">{{ partTitle }}</h1>
        <h2>{{ partDetails.manufacturer?.name }} — Part # {{ getPartNumber(partDetails) }}</h2>
        <a :href="`https://www.multi-inc.com/request-a-quote-parts?part_numbers=${getPartNumber(partDetails)}`"
          target="_blank"
          class="button request-quote">
          Request a Quote
        </a>
        <hr>
        <h4 v-if="partDetails.manufacturer?.name">Manufacturer: {{ partDetails.manufacturer?.name }}</h4>
        <h4>Part Number: {{ getPartNumber(partDetails) }}</h4>
        <h4 v-if="partDetails.modalities.length">Modality: <span v-for="mod in partDetails.modalities" class="modality">{{ mod.modalities_id.name }}</span></h4>
        <!-- <h4 v-if="partDetails.condition">Condition: {{ partDetails.condition }}</h4>
        <h4 v-if="partDetails.warranty">Warranty: {{ partDetails.warranty }}</h4>
        <h4 v-if="returnableText !== null">Returnable: {{ returnableText }}</h4> -->
        <hr>
        <div v-html="partContent" class="product-content"></div>
        <div class="other-attributes" v-if="partDetails.attributes">
          <h4>Other Attributes</h4>
          <ul>
            <li v-for="(item, index) in partDetails.attributes" :key="index">
              {{ item.name }}: <em>{{ item.value }}</em>
            </li>
          </ul>
        </div>
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

const partContent = computed(() => he.decode(partDetails.value.content));
const partTitle = computed(() => he.decode(partDetails.value.title));
const partManufacturer = computed(() => (typeof partDetails.value.manufacturer?.name === 'undefined' ? '' : partDetails.value.manufacturer?.name));

const metaTitle = computed(() => `${getPartNumber(partDetails.value)}${partManufacturer.value ? ' - '+ partManufacturer.value : ''} - ${partTitle.value}` );
const metaDescription = computed(() => `Part #: ${getPartNumber(partDetails.value)}${partManufacturer.value ? ' by '+ partManufacturer.value : ''} -- ${partTitle.value} -- High-quality parts for Healthcare Technology Management.` );

const returnableText = computed(() => (partDetails.value?.returnable === null ? null : (partDetails.value.returnable ? 'Yes' : 'No')))
</script>

<style lang="less" scoped>
h1 {
  color: #2275b5;
  font-size: 32px;
  line-height: 38px;
  font-weight: 500;
  margin-bottom: 10px;
}
h2 {
  color: #304d6d;
  font-size: 38px;
  line-height: 46px;
  font-weight: 600;
  margin-bottom: 50px;
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

