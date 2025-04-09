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
    '@nuxtjs/seo'
  ],

  css: [
    // Load hs assets first
    '~/assets/hs-css/main.min.css',
    '~/assets/hs-css/theme-overrides.min.css',
    // Then load our global styles to override when needed
    '~/assets/css/global.less'
  ],

  site: {
    url: 'https://parts.multi-inc.com',
    name: 'MULTI, INC. Parts Catalog',
    description: 'MULTI, INC. exists to provide access to authentic parts, services, and technology through our OEM allegiant relationships. Explore our vast parts catalog.',
    defaultLocale: 'en', // not needed if you have @nuxtjs/i18n installed
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      titleTemplate: '%s | MULTI, INC. Parts Catalog',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'robots', content: 'index, follow' },
        { name: 'google-site-verification', content: 'RTo4vA1tJKoUSDzXeiu-tVWH2_K2PwVScCdZoqQyl7A' },
        { property: 'og:site_name', content: 'MULTI, INC. Parts Catalog' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/webp', href: '/multi_favicon.webp' },
        { rel: 'canonical', href: 'https://parts.multi-inc.com' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap' }
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
        {
          innerHTML: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "lgmti6r585");
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