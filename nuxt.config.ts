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
  site: {
    //url: 'https://parts.multi-inc.com',
    name: 'MULTI, INC. Parts Catalog',
    description: 'MULTI, INC. exists to provide access to authentic parts, services, and technology through our OEM allegiant relationships. Explore our vast parts catalog.',
    defaultLocale: 'en', // not needed if you have @nuxtjs/i18n installed
  },
  sitemap: {
    sitemaps: true,
    xsl: false,
    cacheMaxAgeSeconds: 60,
    // modify the chunk size if you need
    defaultSitemapsChunkSize: 10000, // default 1000
    // sources: [
    //   '/api/__sitemap__/urls',
    // ]
    // urls: async () => {
    //   const axios = require('axios');
    //   const queryParams = new URLSearchParams({
    //     sort: '-sort,part_number',
    //     'fields[]': ['part_number', 'date_updated'],
    //     limit: -1
    //   });
    //   const queryString = queryParams.toString();

    //   const response = await axios.get(`https://order.multi-inc.com/items/parts?${queryString}`);

    //   const _lastmod = new Date().toISOString();

    //   const urls = [];
    //   for (const part of response.data.data) {
    //     if (part.part_number) {
    //       urls.push({
    //         url: `/part/${part.part_number}`,
    //         lastmod: _lastmod,
    //         //changefreq: 'weekly',
    //         //priority: 0.8,
    //       });
    //     }
    //   }
    //   return urls;
    // },
  },
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
