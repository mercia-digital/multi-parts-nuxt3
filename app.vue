<template>
  <SiteHeader v-if="!isSitemapPage"></SiteHeader>
  <div id="site-main">
    <NuxtPage />
  </div>
  <SiteFooter v-if="!isSitemapPage"></SiteFooter>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Check if current route is a sitemap page
const isSitemapPage = computed(() => {
  return route.path.startsWith('/sitemap/');
});
</script>
