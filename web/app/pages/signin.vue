<template>
  <PageContainer>
    <div class="mx-auto flex max-w-md justify-center">
      <div class="ticket ticket-ruled w-full p-7 pt-8 sm:p-9">
        <p class="eyebrow mb-3">Back to the counter</p>
        <h1 class="font-display text-3xl font-extrabold tracking-tight text-cloud">
          Sign In
        </h1>
        <p class="mt-2 mb-8 text-sm text-mist">
          Welcome back — your lists are right where you left them.
        </p>
        <form id="signinForm" @submit.prevent="handleSubmit">
          <FormInput
            id="email"
            label="Email"
            type="email"
            v-model="email"
            required
          />
          <FormInput
            id="password"
            label="Password"
            type="password"
            v-model="password"
            required
          />
          <button type="submit" class="btn-gold w-full">Sign In</button>
        </form>

        <div v-if="message" class="band band-error mt-5">
          {{ message }}
        </div>

        <div class="mt-6 text-center font-mono text-xs text-mist">
          No account yet?
          <NuxtLink
            to="/signup"
            class="font-bold text-brass no-underline hover:underline"
            >Sign Up</NuxtLink
          >
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;
const { refreshAuth } = useAuth();

// Set page title and meta tags
useHead({
  title: 'GrocerMe | Sign In',
  meta: [
    {
      name: 'description',
      content: 'Sign in to your GrocerMe account to access your grocery lists and manage your shopping.'
    },
    {
      property: 'og:title',
      content: 'GrocerMe | Sign In'
    },
    {
      property: 'og:description',
      content: 'Sign in to your GrocerMe account to access your grocery lists and manage your shopping.'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
});

const email = ref("");
const password = ref("");
const message = ref("");

const handleSubmit = async () => {
  message.value = "";

  try {
    await $fetch<{ token?: string }>(`${apiUrl}/signin`, {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
      },
      credentials: "include",
    });

    // Refresh auth state to update the flag
    await refreshAuth();

    // Check for redirect parameter
    const route = useRoute();
    const redirectPath = route.query.redirect as string | undefined;

    // Redirect to specified path or dashboard
    await navigateTo(redirectPath || "/dashboard");
  } catch (error: any) {
    message.value =
      "Error: " +
      (error.data?.error || error.message || "Invalid email or password");
  }
};
</script>
