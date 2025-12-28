<template>
  <div>
    <h1 class="text-2xl font-bold text-center">GrocerMe</h1>
    <div class="flex gap-2 items-center justify-center">
      <!-- Show different content based on authentication status -->
      <template v-if="isAuthenticated">
        <p class="text-green-600">Welcome! You are logged in.</p>
        <div v-if="user" class="mt-2">
          <p class="text-sm text-gray-600">Email: {{ user.email }}</p>
        </div>
      </template>
      <template v-else>
        <NuxtLink class="hover:underline" to="/signin">Sign In</NuxtLink>
        <NuxtLink class="hover:underline" to="/signup">Sign Up</NuxtLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated, user, checkAuth } = useAuth()

// Check authentication on page load
onMounted(async () => {
  await checkAuth()
})
</script>