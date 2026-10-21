<template>
  <NuxtLayout>
    <NuxtPage />
    <InstallPrompt />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  link: [
    { rel: 'icon', type: 'image/x-icon', sizes: '32x32', href: '/favicon.ico?v=grocerme-1' },
    { rel: 'icon', type: 'image/svg+xml', sizes: 'any', href: '/icon.svg?v=grocerme-1' },
    { rel: 'manifest', href: '/manifest.webmanifest' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
  ],
  meta: [
    { name: 'theme-color', content: '#08182E' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
  ]
})
</script>
