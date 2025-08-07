// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'myCustomTheme',
      themes: {
        "myCustomTheme": {
          dark: true,
          colors: {
            accent: "#EA4431"
          }
        }
      }
    },
  })
  app.vueApp.use(vuetify)
})