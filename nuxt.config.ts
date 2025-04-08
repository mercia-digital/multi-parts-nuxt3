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
    '@nuxtjs/seo',
    '@nuxtjs/sitemap'
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

  sitemap: {
    sitemaps: true,
    xsl: false,
    cacheMaxAgeSeconds: 43200, //12 hrs
    // modify the chunk size if you need
    defaultSitemapsChunkSize: 10000, // default 1000
    urls: async () => {
      const axios = require('axios');
      const queryParams = new URLSearchParams({
        sort: '-sort,part_number',
        'fields[]': ['part_number', 'primary_image.filename_disk','primary_image.title','primary_image.description','manufacturer.name'],
        limit: -1
      });
      const queryString = queryParams.toString();

      const response = await axios.get(`https://order.multi-inc.com/items/parts?${queryString}`);

      const _lastmod = new Date().toISOString();

      const urls = [];
      for (const part of response.data.data) {
        if (part.part_number) {
          const urlObj: any = {
            url: `/part/${part.part_number}`,
            lastmod: _lastmod,
            changefreq: 'daily',
            priority: part.primary_image ? 1.0 : 0.8,
          };
  
          if (part.primary_image && part.primary_image.filename_disk) {
            urlObj.image = {
              loc: `https://order.multi-inc.com/assets/${part.primary_image.filename_disk}`,
              title: part.primary_image.title || `Part ${part.part_number} - ${part.manufacturer?.name || ''}`,
              caption: part.primary_image.description || `Part ${part.part_number} - ${part.manufacturer?.name || ''}`,
            };
          }
  
          urls.push(urlObj);
        }      
      }
      return urls;
    },
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
        { rel: 'canonical', href: 'https://parts.multi-inc.com' }
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
  },

  compatibilityDate: '2025-04-07'
})