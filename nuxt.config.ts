// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: {enabled: true},
    modules: ['@nuxt/fonts', '@nuxt/icon', '@nuxt/image', '@nuxtjs/tailwindcss', '@pinia/nuxt'],
    runtimeConfig: {
        public: {
            API_URL: process.env.NUXT_PUBLIC_API_URL,
            apiBase: process.env.NUXT_PUBLIC_API_URL,
        }
    },
    auth: {
        strategies: {
            sanctum: {
                provider: 'laravel/sanctum',
                url: process.env.NUXT_PUBLIC_API_URL,
                endpoints: {
                    login: {url: '/adminlogin', method: 'post'},
                    logout: {url: '/adminlogout', method: 'post'},
                    user: {url: '/api/user', method: 'get'}
                }
            }
        },
    },
    css: ['~/assets/css/global.css'],
    fonts: {
        families: [
            {name: 'Roboto', provider: 'google'},
            {name: 'Handjet', provider: 'google'},
        ],
    },
    app: {
        head: {
            link: [
                {rel: 'icon', type: 'image/x-icon', href: '/favicon.svg'}
            ]
        }
    },
})