<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})
</script>
<style lang="less">
#site-main {
  max-width: 1400px;
  margin: 50px auto;
  text-align: center;
}
.button {
    border-radius: 50px;
    padding: 10px 15px;
    color: #fff;
    white-space: nowrap;
    transition: all .3s ease;
    background-color: #dc602e;
    &:hover {
      background-color: #2275b5;
    }
}
pre {
    text-align: left;
    display: none;
}
</style>

<template>
    <SiteHeader></SiteHeader>
    <div id="site-main">
        <h1>Error: {{ error?.statusCode }}</h1>
        <pre>{{ error }}</pre>
        <p>There has been an error, please try again or go back to the Homepage.</p>
        <NuxtLink class="button" to="/">Go Home</NuxtLink>
    </div>
    <SiteFooter></SiteFooter>
  <div>
    
  </div>
</template>
