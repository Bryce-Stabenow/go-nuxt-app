<template>
  <PageContainer>
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-xl shadow-2xl py-2 mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2 text-center">
          Dashboard
        </h1>
        
        <div v-if="isLoading" class="text-center text-gray-600 text-base py-5">
          Loading...
        </div>
        <div v-else-if="isAuthenticated && user">
          <p class="text-gray-900 text-lg leading-relaxed text-center">
            Welcome,
            <strong class="text-purple-600 font-semibold">{{
              user.profile.first_name
            }}</strong>
          </p>
        </div>
        <div v-else class="text-center text-red-800 py-5">
          <p class="mb-5 text-base">
            You are not authenticated. Please sign in.
          </p>
          <NuxtLink
            to="/signin"
            class="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg font-semibold no-underline transition-transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            Sign In
          </NuxtLink>
        </div>
      </div>

      <!-- Lists Section -->
      <div
        v-if="isAuthenticated && !isLoading"
        class="bg-white rounded-xl shadow-2xl py-10 px-4"
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">My Lists</h2>
          <NuxtLink
            to="/lists/new"
            class="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg font-semibold no-underline transition-transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            +
          </NuxtLink>
        </div>

        <div
          v-if="listsLoading || !isOrderReady"
          key="lists-loading"
          class="py-10"
        >
          <div class="flex justify-center">
            <Icon
              name="svg-spinners:ring-resize"
              class="h-12 w-12 text-purple-600"
            />
          </div>
        </div>

        <div v-else-if="listsError" key="lists-error" class="text-center text-red-800 py-5">
          <p class="mb-5 text-base">Error: {{ listsError }}</p>
        </div>

        <div
          v-else-if="lists.length === 0"
          key="lists-empty"
          class="text-center text-gray-600 py-10"
        >
          <p class="mb-5 text-base">You don't have any lists yet.</p>
          <NuxtLink
            to="/lists/new"
            class="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg font-semibold no-underline transition-transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            Create Your First List
          </NuxtLink>
        </div>

        <!-- tag="section" (not a div) so Vue can't reuse the spinner's div as
             this root and leak its classes onto the list -->
        <draggable
          v-else
          key="lists"
          v-model="orderedLists"
          item-key="id"
          handle=".drag-handle"
          :animation="150"
          :force-fallback="true"
          ghost-class="opacity-50"
          tag="section"
          class="space-y-4"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <DashboardList
              :list="element"
              :is-shared="isSharedList(element)"
              draggable
            />
          </template>
        </draggable>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import draggable from "vuedraggable";

const { isAuthenticated, user, isLoading, checkAuth } = useAuth();
const { getLists } = useLists();
const { loadOrder, saveOrder, applyOrder } = useListOrder();

// Set page title and meta tags
useHead({
  title: 'GrocerMe | Dashboard',
  meta: [
    {
      name: 'description',
      content: 'Manage your grocery lists, view your items, and organize your shopping with GrocerMe.'
    },
    {
      property: 'og:title',
      content: 'GrocerMe | Dashboard'
    },
    {
      property: 'og:description',
      content: 'Manage your grocery lists, view your items, and organize your shopping with GrocerMe.'
    },
    {
      property: 'og:type',
      content: 'website'
    },
  ]
});

const lists = ref<any[]>([]);
const listsLoading = ref(false);
const listsError = ref<string | null>(null);

// The user's manual list order (array of list IDs), loaded from localStorage.
const savedOrder = ref<string[]>([]);
// Whether the saved order has been read on the client. Until this is true we
// hold a spinner so the list is never shown in server order and then visibly
// re-sorted (no layout shift on load). localStorage is client-only, so this
// stays false during SSR.
const isOrderReady = ref(false);

// Read the saved order and reveal the list. Runs only after mount (see below).
const revealOrderedLists = (userId: string) => {
  savedOrder.value = loadOrder(userId);
  isOrderReady.value = true;
};

// Load the saved order once the authenticated user is known — but only AFTER
// mount. Flipping isOrderReady during setup would make the client's first
// (hydration) render show the list while the server rendered the spinner
// (localStorage is client-only), a hydration mismatch that leaks the spinner's
// flex layout onto the list. onMounted runs post-hydration, so the client's
// first render still matches the server's spinner, then transitions cleanly.
onMounted(() => {
  if (user.value?.id) {
    revealOrderedLists(user.value.id);
    return;
  }
  // User not resolved yet at mount — wait for it, then stop watching.
  const stop = watch(
    () => user.value?.id,
    (userId) => {
      if (!userId) return;
      revealOrderedLists(userId);
      stop();
    }
  );
});

// Lists in the user's manual order. Unseen lists (new/newly-shared) float to
// the top until dragged into place. The writable setter persists a new order
// when vuedraggable emits a reorder.
const orderedLists = computed<any[]>({
  get() {
    return applyOrder(lists.value, savedOrder.value);
  },
  set(newList) {
    const newOrder = newList.map((list) => list.id);
    savedOrder.value = newOrder;
    if (user.value?.id) saveOrder(user.value.id, newOrder);
  },
});

// After a drag, the browser fires a click on the card the pointer was
// released over. Since each card is a link, that click would navigate away.
// Swallow just that one trailing click (capture phase, before it reaches the
// link), then clean up shortly after in case no click follows.
const onDragEnd = (): void => {
  const suppressClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener("click", suppressClick, true);
  };
  document.addEventListener("click", suppressClick, true);
  setTimeout(() => document.removeEventListener("click", suppressClick, true), 300);
};

// Check if a list is shared (not owned by current user)
const isSharedList = (list: any): boolean => {
  if (!user.value || !list) return false;
  return list.user_id !== user.value.id;
};

const loadLists = async () => {
  listsLoading.value = true;
  listsError.value = null;

  try {
    lists.value = await getLists();
  } catch (error: any) {
    listsError.value =
      error.data?.error || error.message || "Failed to load lists";
  } finally {
    listsLoading.value = false;
  }
};

// Check authentication on page load
await checkAuth();

if (isAuthenticated.value) {
  await loadLists();
}
</script>
