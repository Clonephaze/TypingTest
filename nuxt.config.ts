// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
  },

  devtools: { enabled: true },

  modules: ['@nuxtjs/color-mode', '@nuxt/icon', '@pinia/nuxt'],

  colorMode: {
    classPrefix: '',
    classSuffix: '-mode',
    preference: 'dark',
    fallback: 'dark',
    storageKey: 'color-mode',
  },

  css: ['~/assets/Styles/main.scss'],
})