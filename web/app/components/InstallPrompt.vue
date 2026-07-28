<template>
  <div
    v-if="showPrompt"
    class="ticket ticket-ruled fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-4 p-4 pt-5"
  >
    <div class="flex-1">
      <p class="eyebrow mb-0.5">Keep it handy</p>
      <h3 class="font-display font-bold text-cloud">Install GrocerMe</h3>
      <p class="font-mono text-xs text-mist">Works offline, opens like an app.</p>
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <button
        @click="dismiss"
        class="font-mono text-xs font-bold uppercase tracking-[0.12em] text-mist transition-colors hover:text-brass"
      >
        Later
      </button>
      <button @click="install" class="btn-gold !px-4 !py-2">Install</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const showPrompt = ref(false)
let deferredPrompt: any = null

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showPrompt.value = true
  })
  
  window.addEventListener('appinstalled', () => {
    showPrompt.value = false
    deferredPrompt = null
  })
})

const install = async () => {
  if (!deferredPrompt) return
  
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  
  if (outcome === 'accepted') {
    showPrompt.value = false
  }
  
  deferredPrompt = null
}

const dismiss = () => {
  showPrompt.value = false
  deferredPrompt = null
}
</script>

