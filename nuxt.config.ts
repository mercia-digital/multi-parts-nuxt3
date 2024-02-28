// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    'vue3-carousel-nuxt',
  ],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'My Nuxt Project',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // Add other meta tags as needed
      ],
      link: [
        { 
          rel: 'icon',
          href: '/multi_favicon.webp'
        }
      ],
      script: [
        {
          src: 'https://kit.fontawesome.com/0c4ce5631f.js',
          crossorigin: 'anonymous',
          async: true,
        },
      ],
      // Add other head properties as needed
    },
  }  
})
