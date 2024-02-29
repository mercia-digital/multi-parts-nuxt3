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
        {
          hid: 'google-site-verification',
          name: 'google-site-verification',
          content: 'RTo4vA1tJKoUSDzXeiu-tVWH2_K2PwVScCdZoqQyl7A',
        },
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
        {
          src: 'https://js.hs-scripts.com/4679263.js',
          id: 'hs-script-loader',
          async: true,
          defer: true,
          type: "text/javascript"
        },
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-LPH95E885X',
          async: true,
        },
        {
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LPH95E885X');
          `,
          type: 'text/javascript',
          charset: 'utf-8',
        },
      ],
      __dangerouslyDisableSanitizers: ['script'],
      // Add other head properties as needed
    },
  }  
})
