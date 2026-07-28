<template>
  <div class="min-h-screen flex flex-col">
    <header
      class="sticky top-0 z-40 border-b border-white/10 bg-ink/85 backdrop-blur-md"
    >
      <nav class="mx-auto max-w-5xl px-4 py-3.5">
        <div class="flex items-center justify-between">
          <NuxtLink
            to="/"
            class="group flex items-baseline gap-2 no-underline"
          >
            <span
              class="font-display text-2xl font-extrabold tracking-tight text-cloud transition-colors group-hover:text-brass"
            >
              Grocer<span class="text-brass">Me</span>
            </span>
            <span class="eyebrow-mist hidden sm:inline">the list, kept</span>
          </NuxtLink>
          <div class="flex items-center gap-2 sm:gap-3">
            <template v-if="isAuthenticated">
              <NuxtLink
                to="/dashboard"
                class="rounded-ticket px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-mist no-underline transition-colors hover:text-brass"
              >
                Dashboard
              </NuxtLink>
              <button
                @click="handleSignOut"
                class="flex items-center justify-center rounded-ticket border border-white/15 p-2 text-mist transition-colors hover:border-brass/50 hover:text-brass"
                title="Sign out"
                aria-label="Sign out"
              >
                <Icon name="heroicons:power" class="h-5 w-5" />
              </button>
            </template>
            <template v-else>
              <NuxtLink
                to="/signin"
                class="rounded-ticket border border-white/15 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-mist no-underline transition-colors hover:border-brass/50 hover:text-brass"
              >
                Sign In
              </NuxtLink>
            </template>
          </div>
        </div>
      </nav>
    </header>
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated, logout } = useAuth()

const handleSignOut = async () => {
  // Call logout API endpoint to clear server-side cookie
  await logout()
  
  // Navigate to home page
  await navigateTo('/')
}
</script>

