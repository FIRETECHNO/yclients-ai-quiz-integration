import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  // devServer: {
  //   host: '0.0.0.0',
  //   port: 3000
  // },
  build: {
    transpile: ['vuetify'],
  },
  css: [
    '~/assets/css/main.scss',
    '~/assets/css/tailwind.css'
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    //...
  ],
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }, // Nuxt 3 ожидает здесь пустую строку для атрибутов без значения
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap' // Обновленная ссылка для всех начертаний Montserrat
        }
      ]
    }
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  runtimeConfig: {
    yclUserToken: process.env.YCL_USER_TOKEN,
    yclPartnerToken: process.env.YCL_PARTNER_TOKEN,
    gigachatAuthKey: process.env.GIGACHAT_AUTH_KEY,
    redisUrl: process.env.REDIS_URL,
    googleApiKey: process.env.GOOGLE_API_KEY,
    public: {
      apiBase: '',
    }
  }
})
