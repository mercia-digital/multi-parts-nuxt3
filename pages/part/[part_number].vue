<template>
  <Head>
      <Title>{{ metaTitle }}</Title>
      <Meta name="description" :content="metaDescription" />
      <Meta property="og:title" :content="metaTitle" />
      <Meta property="og:description" :content="metaDescription" />
    </Head>
  <div class="container mx-auto p-4" v-if="!pending && partDetails">
    <div class="text-right mb-10">
      <button @click="goBack" class="button go-back">
        Back to List
      </button>
    </div>
    <div class="flex flex-wrap">
      <div class="w-full p-2 text-left">
        <h1 class="text-2xl font-bold">{{ partTitle }}</h1>
        <!-- <h2>{{ partDetails.manufacturer?.name }} — Part # {{ getPartNumber(partDetails) }}</h2> -->
        <hr class="alt">
      </div>
      <div class="w-full lg:w-1/2 p-2 text-left">        
        <h2 v-if="partDetails.manufacturer?.name">Manufacturer: <span class="meta-value">{{ partDetails.manufacturer?.name }}</span></h2>
        <h2>Part Number: <span class="meta-value">{{ getPartNumber(partDetails) }}</span></h2>
        <h3 v-if="partDetails.modalities.length">Modality: <span class="meta-value"><span v-for="mod in partDetails.modalities" class="modality">{{ mod.modalities_id.name }}</span></span></h3>
        <!-- <h4 v-if="partDetails.condition">Condition: {{ partDetails.condition }}</h4>
        <h4 v-if="partDetails.warranty">Warranty: {{ partDetails.warranty }}</h4>
        <h4 v-if="returnableText !== null">Returnable: {{ returnableText }}</h4> -->
        <hr>
        <div class="flex justify-center">
          <a :href="`https://www.multi-inc.com/request-a-quote-parts?part_numbers=${getPartNumber(partDetails)}`"
            target="_blank"
            class="button request-quote">
            Request a Quote
          </a>
        </div>
        <hr>        
        <div v-html="partContent" class="product-content"></div>
        <div class="other-attributes" v-if="partDetails.attributes">
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
        <div v-if="partDetails.gallery.length > 1">
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
        <div v-else>
          <img class="block my-0 mx-auto" :src="partDetails.primary_image.src" :alt="partDetails.primary_image.alt" />
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

