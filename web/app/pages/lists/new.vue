<template>
  <PageContainer>
    <div class="mx-auto flex max-w-md items-start justify-center">
      <div class="ticket ticket-ruled w-full p-7 pt-8 sm:p-9">
        <p class="eyebrow mb-3">Start a ticket</p>
        <h1 class="font-display text-3xl font-extrabold tracking-tight text-cloud">
          Create New List
        </h1>
        <p class="mt-2 mb-8 text-sm text-mist">
          Give it a name — you'll fill in the items next.
        </p>
        <form @submit.prevent="handleSubmit">
          <div class="mb-5">
            <label for="name" class="field-label">List Name *</label>
            <input
              type="text"
              id="name"
              v-model="name"
              required
              placeholder="e.g., Weekly Groceries"
              class="field"
            />
          </div>
          <div class="mb-6">
            <label for="description" class="field-label">Description</label>
            <textarea
              id="description"
              v-model="description"
              rows="3"
              placeholder="Optional description for your list"
              class="field resize-none"
            ></textarea>
          </div>
          <button type="submit" :disabled="isSubmitting" class="btn-gold w-full">
            {{ isSubmitting ? "Creating…" : "Create List" }}
          </button>
        </form>
        <div
          v-if="message"
          class="band mt-5"
          :class="messageType === 'success' ? 'band-success' : 'band-error'"
        >
          {{ message }}
        </div>
        <div class="mt-6 text-center">
          <NuxtLink
            to="/dashboard"
            class="font-mono text-xs font-bold uppercase tracking-[0.14em] text-mist no-underline transition-colors hover:text-brass"
            >← Back to Dashboard</NuxtLink
          >
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
const { createList } = useLists();

// Set page title and meta tags
useHead({
  title: 'GrocerMe | Create New List',
  meta: [
    {
      name: 'description',
      content: 'Create a new grocery list to organize your shopping items and never forget what you need.'
    },
    {
      property: 'og:title',
      content: 'GrocerMe | Create New List'
    },
    {
      property: 'og:description',
      content: 'Create a new grocery list to organize your shopping items and never forget what you need.'
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

const name = ref("");
const description = ref("");
const message = ref("");
const messageType = ref<"success" | "error">("success");
const isSubmitting = ref(false);

const handleSubmit = async () => {
  message.value = "";
  isSubmitting.value = true;

  try {
    const list = await createList(name.value, description.value || undefined);

    messageType.value = "success";
    message.value = "List created successfully!";

    // Redirect to the new list page
    await navigateTo(`/lists/${list.id}`);
  } catch (error: any) {
    messageType.value = "error";
    message.value =
      "Error: " +
      (error.data?.error || error.message || "Failed to create list");
    isSubmitting.value = false;
  }
};
</script>
