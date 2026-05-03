const normalizeApiOrigin = (value?: string) => {
    let origin = String(value || '').trim()

    if (!origin) {
        return ''
    }

    origin = origin
        .replace(/^https?:\/(?!\/)/i, (match) => `${match}/`)
        .replace(/\/+$/, '')
        .replace(/\/api$/, '')

    if (!/^https?:\/\//i.test(origin) && !origin.startsWith('/')) {
        origin = `http://${origin}`
    }

    return origin
};

const apiUrl = normalizeApiOrigin(process.env.NUXT_PUBLIC_API_URL || process.env.API_URL)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: {enabled: false},
    modules: ['@nuxt/icon', '@nuxt/image', '@nuxtjs/tailwindcss'],
    pages: true,
    router: {
        options: {
            linkActiveClass: 'active-link',
            linkExactActiveClass: 'exact-active-link'
        }
    },
    runtimeConfig: {
        public: {
            API_URL: apiUrl,
            apiBase: apiUrl,
            PUBLIC_FILESYSTEM_URL: process.env.NUXT_PUBLIC_PUBLIC_FILESYSTEM_URL || process.env.PUBLIC_FILESYSTEM_URL || process.env.AWS_URL || '',
            SITE_URL: process.env.NUXT_SITE_URL,
            VK_TOKEN: process.env.NUXT_PUBLIC_VK_TOKEN,
        }
    },
    // @ts-ignore
    auth: {
        strategies: {
            sanctum: {
                provider: 'laravel/sanctum',
                url: apiUrl,
                endpoints: {
                    login: {url: '/adminlogin', method: 'post'},
                    logout: {url: '/adminlogout', method: 'post'},
                    user: {url: '/api/user', method: 'get'}
                }
            }
        },
    },
    css: ['@/assets/css/global.css'],
    app: {
        head: {
            link: [
                {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
                {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: ''},
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Handjet:wght@300..900&family=Roboto:wght@300;400;500;700;900&display=swap'
                },
                {rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96'},
                {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'},
                {rel: 'shortcut icon', href: '/favicon.ico'},
                {rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png'},
                {rel: 'manifest', href: '/site.webmanifest'}
            ]
        }
    },
    icon: {
        provider: 'server',
        serverBundle: {
            externalizeIconsJson: false
        }
    },
})
