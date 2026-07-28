<template>
  <PageContainer>
    <div class="mx-auto flex max-w-md items-start justify-center">
      <div class="ticket ticket-ruled w-full p-7 pt-8 sm:p-9">
        <p class="eyebrow mb-3">Open a ledger</p>
        <h1 class="font-display text-3xl font-extrabold tracking-tight text-cloud">
          Sign Up
        </h1>
        <p class="mt-2 mb-8 text-sm text-mist">
          One account keeps every list — and the people you share them with.
        </p>
        <form id="signupForm" @submit.prevent="handleSubmit">
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
            :minlength="6"
          />
          <FormInput
            id="firstName"
            label="First Name"
            type="text"
            v-model="firstName"
            required
          />
          <FormInput
            id="lastName"
            label="Last Name"
            type="text"
            v-model="lastName"
            required
          />
          <FormInput
            id="avatarUrl"
            label="Avatar URL"
            type="url"
            v-model="avatarUrl"
          >
            <template #label-suffix>
              <span class="text-mist/70">(optional)</span>
            </template>
          </FormInput>
          <button type="submit" class="btn-gold w-full">Sign Up</button>
        </form>

        <div v-if="message" class="band band-error mt-5">
          {{ message }}
        </div>

        <div class="mt-6 text-center font-mono text-xs text-mist">
          Already have an account?
          <NuxtLink
            to="/signin"
            class="font-bold text-brass no-underline hover:underline"
            >Sign In</NuxtLink
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
  title: "GrocerMe | Sign Up",
  meta: [
    {
      name: "description",
      content:
        "Create a new GrocerMe account to start organizing your grocery lists and simplify your shopping experience.",
    },
    {
      property: "og:title",
      content: "GrocerMe | Sign Up",
    },
    {
      property: "og:description",
      content:
        "Create a new GrocerMe account to start organizing your grocery lists and simplify your shopping experience.",
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ],
});

const email = ref("");
const password = ref("");
const firstName = ref("");
const lastName = ref("");
const avatarUrl = ref("");
const message = ref("");

const handleSubmit = async () => {
  message.value = "";

  try {
    const body: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      avatar_url?: string;
    } = {
      email: email.value,
      password: password.value,
      first_name: firstName.value,
      last_name: lastName.value,
    };

    if (avatarUrl.value.trim()) {
      body.avatar_url = avatarUrl.value.trim();
    }

    await $fetch<{ token?: string }>(`${apiUrl}/signup`, {
      method: "POST",
      body,
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
      (error.data?.error || error.message || "Something went wrong");
  }
};
</script>
