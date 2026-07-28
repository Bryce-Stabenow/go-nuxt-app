<template>
  <PageContainer>
    <div class="mx-auto flex max-w-md items-center justify-center">
      <div class="ticket ticket-ruled w-full p-8 pt-9 text-center">
        <div v-if="isLoading">
          <Icon
            name="svg-spinners:ring-resize"
            class="mx-auto mb-5 h-11 w-11 text-brass"
          />
          <p class="eyebrow-mist mb-1">Joining</p>
          <p class="font-display text-xl font-bold text-cloud">{{ loadingMessage }}</p>
        </div>
        <div v-else-if="error">
          <Icon
            name="heroicons:exclamation-circle"
            class="mx-auto mb-4 h-11 w-11 text-coral"
          />
          <p class="band band-error mb-6">{{ error }}</p>
          <NuxtLink to="/dashboard" class="btn-gold no-underline">
            Go to Dashboard
          </NuxtLink>
        </div>
        <div v-else-if="success">
          <Icon
            name="heroicons:check-circle"
            class="mx-auto mb-4 h-11 w-11 text-citron"
          />
          <p class="font-display text-2xl font-bold text-cloud">
            You're on the list.
          </p>
          <p class="mt-2 font-mono text-xs text-mist">Taking you there…</p>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { checkAuth } = useAuth();
const { shareList } = useLists();

// Set page title and meta tags
useHead({
  title: "GrocerMe | Join List",
  meta: [
    {
      name: "description",
      content:
        "Join a shared grocery list on GrocerMe and collaborate on your shopping.",
    },
    {
      property: "og:title",
      content: "GrocerMe | Join List",
    },
    {
      property: "og:description",
      content:
        "Join a shared grocery list on GrocerMe and collaborate on your shopping.",
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

const isLoading = ref(true);
const error = ref<string | null>(null);
const success = ref(false);
const loadingMessage = ref("Processing...");

// Handle sharing on page load
const listId = route.params.id as string;

// Check if user is authenticated
const authenticated = await checkAuth();

if (!authenticated) {
  // Redirect to signup with redirect parameter
  await router.push(`/signup?redirect=/lists/share/${listId}`);
} else {
  // User is authenticated, proceed with sharing
  try {
    loadingMessage.value = "Adding you to the list...";
    await shareList(listId);
    success.value = true;
    loadingMessage.value = "Redirecting...";

    // Redirect to the list page after a short delay
    setTimeout(() => {
      router.push(`/lists/${listId}`);
    }, 1500);
  } catch (err: any) {
    if (err.statusCode === 401) {
      // Token expired or invalid, redirect to signin
      await router.push(`/signin?redirect=/lists/share/${listId}`);
    } else if (err.statusCode === 404) {
      error.value = "List not found";
    } else if (err.statusCode === 400 && err.data?.error?.includes("owner")) {
      error.value = "You are already the owner of this list";
    } else {
      error.value = err.data?.error || err.message || "Failed to join list";
    }
    isLoading.value = false;
  }
}
</script>
