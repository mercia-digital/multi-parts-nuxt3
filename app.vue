<template>
  <SiteHeader></SiteHeader>
  <div id="site-main">
    <NuxtPage />
  </div>
  <SiteFooter></SiteFooter>
</template>
<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
#site-main {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
