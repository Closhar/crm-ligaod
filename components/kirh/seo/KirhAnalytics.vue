<template>
  <div>

  </div>
</template>

<script>
export default {
  name: 'KirhAnalytics',
  props: {
    // Пропсы для Яндекс.Метрики
    yandexMetrika: {
      type: Object,
      default: () => ({
        counterId: null, // ID счетчика Яндекс.Метрики
        options: {} // Дополнительные настройки Яндекс.Метрики
      })
    },
    // Пропсы для Google Analytics
    googleAnalytics: null
  },
  mounted() {
    if (this.yandexMetrika.counterId) {
      this.initYandexMetrika();
    }
    if (this.googleAnalytics) {
      this.initGoogleAnalytics();
    }
  },
  methods: {
    // Инициализация Яндекс.Метрики
    initYandexMetrika() {
      if (typeof window !== 'undefined') {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.innerHTML = `
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${this.yandexMetrika.counterId}, "init", ${JSON.stringify(this.yandexMetrika.options)});
        `;
        document.head.appendChild(script);

        // Добавляем noscript для случаев, когда JavaScript отключен
        const noscript = document.createElement('noscript');
        const iframe = document.createElement('iframe');
        iframe.src = `https://mc.yandex.ru/watch/${this.yandexMetrika.counterId}`;
        iframe.style = 'position:absolute; left:-9999px;';
        noscript.appendChild(iframe);
        document.body.appendChild(noscript);
      }
    },
    // Инициализация Google Analytics
    initGoogleAnalytics() {
      if (typeof window !== 'undefined') {
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.googleAnalytics}`;
        script.async = true;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];

        function gtag() {
          window.dataLayer.push(arguments);
        }

        gtag('js', new Date());
        gtag('config', this.googleAnalytics);
      }
    }
  }
};
</script>