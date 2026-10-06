export default defineNuxtConfig({
  ssr: false, // 音声はブラウザ専用なのでSSRはオフ
  css: ['~/assets/css/retro.css'],
  app: {
    head: {
      title: 'ドットDJ',
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DotGothic16&display=swap' },
      ],
    },
  },
})
