<template>
  <PageContainer>
    <div class="max-w-2xl mx-auto">
      <div class="ticket ticket-ruled px-5 py-8 sm:px-8">
        <div v-if="isLoading" class="py-10 text-center font-mono text-sm text-mist">
          Pulling the your list...
        </div>
        <div v-else-if="error" class="py-10 text-center">
          <p class="band band-error mb-6">{{ error }}</p>
          <NuxtLink to="/dashboard" class="btn-gold no-underline">
            Back to Dashboard
          </NuxtLink>
        </div>
        <div v-else-if="list" class="relative">
          <!-- Header -->
          <div class="sticky top-16 z-10 -mx-5 bg-navy-800/85 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
            <p class="eyebrow mb-1.5">{{ list.items.length }} items</p>
            <div class="flex items-center justify-between gap-3">
              <h1
                v-if="!isEditingName"
                class="font-display text-3xl font-extrabold tracking-tight text-cloud"
              >
                {{ list.name }}
              </h1>
              <input
                v-else
                v-model="editingName"
                @blur="saveName"
                @keydown.enter="saveName"
                @keydown.esc="cancelEditName"
                class="field-inline w-full text-3xl"
                ref="nameInput"
              />
              <div class="flex items-center gap-2">
                <button
                  v-if="!isEditingName"
                  @click="handleShareList"
                  class="btn-icon"
                  title="Share list"
                >
                  <Icon name="heroicons:share" class="h-5 w-5" />
                </button>
                <button
                  v-if="!isEditingName"
                  @click="startEditName"
                  class="btn-icon"
                  title="Edit list name"
                >
                  <Icon name="heroicons:pencil" class="h-5 w-5" />
                </button>
                <button
                  v-if="!isEditingName && isListOwner"
                  @click="handleDeleteList"
                  :disabled="isDeletingList"
                  class="btn-icon btn-icon-danger disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete list"
                >
                  <Icon
                    v-if="isDeletingList"
                    name="svg-spinners:ring-resize"
                    class="h-5 w-5"
                  />
                  <Icon v-else name="heroicons:trash" class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Share Notification -->
          <div v-if="shareNotification" class="band band-success mt-4">
            {{ shareNotification }}
          </div>

          <div class="mb-6 mt-4">
            <p v-if="list.description" class="mb-4 text-mist">
              {{ list.description }}
            </p>
            <div class="flex gap-5 font-mono text-xs text-mist">
              <span
                >Opened
                {{ new Date(list.created_at).toLocaleDateString() }}</span
              >
              <span
                >Updated
                {{ new Date(list.updated_at).toLocaleDateString() }}</span
              >
            </div>
          </div>

          <!-- Items Section -->
          <div class="perforation mb-6"></div>
          <div>
            <div class="flex justify-between items-center mb-4">
              <h2
                v-if="!isSearchOpen"
                class="eyebrow-mist"
              >
                The list
              </h2>
              <input
                v-else
                v-model="searchQuery"
                @keydown.esc="closeSearch"
                class="field-inline mr-2 flex-1 text-lg"
                placeholder="Search items..."
                ref="searchInput"
              />
              <div class="flex items-center gap-2">
                <button
                  v-if="isSearchOpen"
                  @click="closeSearch"
                  class="btn-icon"
                  title="Close search"
                >
                  <Icon name="heroicons:x-mark" class="h-5 w-5" />
                </button>
                <button
                  v-if="!isSearchOpen"
                  @click="openSearch"
                  class="btn-icon"
                  title="Search items"
                >
                  <Icon name="heroicons:magnifying-glass" class="h-5 w-5" />
                </button>
              </div>
            </div>
            <div
              v-if="list.items.length === 0 && !showAddForm"
              class="rounded-ticket py-12 text-center"
              style="border: 2px dashed rgba(147, 169, 199, 0.28)"
            >
              <p class="font-display text-lg font-bold text-cloud">
                Nothing on the ticket yet.
              </p>
              <p class="mt-2 font-mono text-xs text-brass">
                Add your first item below.
              </p>
            </div>
            <div v-else class="space-y-3">
              <!-- Active items: draggable to reorder via the grip handle -->
              <ClientOnly>
                <draggable
                  v-model="uncheckedItems"
                  item-key="originalIndex"
                  handle=".drag-handle"
                  :disabled="isSearchActive"
                  :animation="150"
                  :force-fallback="true"
                  ghost-class="opacity-50"
                  fallback-class="shadow-lg"
                  tag="div"
                  class="space-y-3"
                >
                  <template #item="{ element }">
                    <ListItem
                      :item="element.item"
                      :original-index="element.originalIndex"
                      :draggable="!isSearchActive"
                      @toggle="toggleItemChecked"
                      @change="handleItemCheckedChange"
                      @click="openEditModal"
                    />
                  </template>
                </draggable>
                <!-- SSR/no-JS fallback: render active items without drag -->
                <template #fallback>
                  <div class="space-y-3">
                    <ListItem
                      v-for="uncheckedItem in uncheckedItems"
                      :key="uncheckedItem.originalIndex"
                      :item="uncheckedItem.item"
                      :original-index="uncheckedItem.originalIndex"
                      @toggle="toggleItemChecked"
                      @change="handleItemCheckedChange"
                      @click="openEditModal"
                    />
                  </div>
                </template>
              </ClientOnly>
              <!-- Checked items: sunk to the bottom, not reorderable -->
              <ListItem
                v-for="checkedItem in checkedItems"
                :key="checkedItem.originalIndex"
                :item="checkedItem.item"
                :original-index="checkedItem.originalIndex"
                @toggle="toggleItemChecked"
                @change="handleItemCheckedChange"
                @click="openEditModal"
              />
            </div>
            <!-- Inline Add Item Form -->
            <div
              v-if="showAddForm"
              class="mt-6 rounded-ticket p-5"
              style="border: 1.5px solid rgba(242, 180, 65, 0.35); background: rgba(242, 180, 65, 0.05)"
            >
              <p class="eyebrow mb-4">Add to list</p>
              <form @submit.prevent="handleAddItem" class="space-y-4">
                <div>
                  <label for="add-item-name" class="field-label">Name*</label>
                  <input
                    id="add-item-name"
                    v-model="addForm.name"
                    type="text"
                    required
                    class="field"
                    placeholder="Enter item name"
                    ref="addNameInput"
                  />
                </div>

                <div>
                  <label for="add-item-quantity" class="field-label">Quantity</label>
                  <input
                    id="add-item-quantity"
                    v-model.number="addForm.quantity"
                    type="number"
                    min="1"
                    class="field"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label for="add-item-details" class="field-label">Details</label>
                  <textarea
                    id="add-item-details"
                    v-model="addForm.details"
                    maxlength="512"
                    rows="3"
                    class="field resize-none"
                    placeholder="Add any additional details (optional)"
                  />
                  <div class="mt-1 text-right font-mono text-xs text-mist">
                    {{ (addForm.details || "").length }}/512
                  </div>
                </div>

                <div v-if="addError" class="band band-error">
                  {{ addError }}
                </div>

                <div class="flex gap-3 justify-center">
                  <button type="button" @click="cancelAddForm" class="btn-quiet">
                    Cancel
                  </button>
                  <button type="submit" :disabled="isAdding" class="btn-gold flex-1">
                    <span v-if="isAdding">Adding…</span>
                    <span v-else>Add Item</span>
                  </button>
                </div>
              </form>
            </div>
            <div v-else class="flex justify-center pt-6">
              <button @click="showAddForm = true" class="btn-gold">
                <Icon name="heroicons:plus" class="h-4 w-4" />
                Add item
              </button>
            </div>
          </div>

          <div
            v-if="checkedItemIndexes.length > 0"
            class="flex justify-center pt-6"
          >
            <button
              @click="handleClearCheckedItems"
              :disabled="isClearingCheckedItems"
              class="btn-quiet"
            >
              <span v-if="isClearingCheckedItems">Clearing…</span>
              <span v-else>
                Clear gathered ({{ checkedItemIndexes.length }})
              </span>
            </button>
          </div>

          <!-- Shared With Section -->
          <div
            v-if="list.shared_with.length > 0"
            class="mt-8"
          >
            <div class="perforation mb-6"></div>
            <h2 class="eyebrow-mist mb-4">
              Shared with · {{ list.shared_with.length }}
            </h2>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="sharedUser in list.shared_with"
                :key="sharedUser.id"
                class="chip"
                style="background: rgba(190, 234, 76, 0.12); color: #d3f27f"
              >
                {{ sharedUser.email || sharedUser.id }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-8 flex justify-center">
        <NuxtLink
          to="/dashboard"
          class="font-mono text-xs font-bold uppercase tracking-[0.14em] text-mist no-underline transition-colors hover:text-brass"
        >
          ← Back to Dashboard
        </NuxtLink>
      </div>
    </div>

    <!-- Edit Item Modal -->
    <EditItemModal
      :is-open="isEditModalOpen"
      :item="editingItem"
      :item-index="editingItemIndex"
      @close="closeEditModal"
      @item-updated="handleItemUpdated"
      @item-deleted="handleItemDeleted"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import confetti from "canvas-confetti";
import draggable from "vuedraggable";

const route = useRoute();
const router = useRouter();
const {
  getList,
  updateList,
  updateListItemChecked,
  addListItem,
  deleteListItem,
  reorderListItems,
  deleteList,
} = useLists();
const { user } = useAuth();

useHead({
  title: "GrocerMe | List",
  meta: [
    {
      name: "description",
      content: "View and manage your grocery list on GrocerMe.",
    },
    {
      property: "og:title",
      content: "GrocerMe | List",
    },
    {
      property: "og:description",
      content: "View and manage your grocery list on GrocerMe.",
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

const list = ref<any>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isEditingName = ref(false);
const editingName = ref("");
const nameInput = ref<HTMLInputElement | null>(null);
const isSaving = ref(false);
const showAddForm = ref(false);
const isEditModalOpen = ref(false);
const editingItem = ref<any>(null);
const editingItemIndex = ref<number | null>(null);
const wasAllChecked = ref(false);
const addNameInput = ref<HTMLInputElement | null>(null);
const isAdding = ref(false);
const addError = ref<string | null>(null);
const isSearchOpen = ref(false);
const searchQuery = ref("");
const searchInput = ref<HTMLInputElement | null>(null);
const isDeletingList = ref(false);
const shareNotification = ref<string | null>(null);
const isClearingCheckedItems = ref(false);

const addForm = ref({
  name: "",
  quantity: 1,
  details: "",
});

// True when the search filter is actively narrowing the list. Reordering is
// disabled in this state because the drag would only see a subset of items.
const isSearchActive = computed(
  () => isSearchOpen.value && searchQuery.value.trim().length > 0
);

// Items paired with their index in the underlying list.items array (the app's
// item identity), optionally filtered by the active search query.
const mappedItems = computed(() => {
  if (!list.value || !list.value.items) {
    return [] as { item: any; originalIndex: number }[];
  }

  let items = list.value.items.map((item: any, originalIndex: number) => ({
    item,
    originalIndex,
  }));

  if (isSearchActive.value) {
    const query = searchQuery.value.trim().toLowerCase();
    items = items.filter(({ item }: any) =>
      item.name.toLowerCase().includes(query)
    );
  }

  return items;
});

// Checked items always sink to the bottom, in their existing array order.
const checkedItems = computed(() =>
  mappedItems.value.filter(({ item }: any) => item.checked)
);

// Unchecked (active) items are the draggable group. The writable setter is
// invoked by vuedraggable's v-model when the user drops an item in a new spot.
const uncheckedItems = computed<{ item: any; originalIndex: number }[]>({
  get() {
    return mappedItems.value.filter(({ item }: any) => !item.checked);
  },
  set(newUnchecked) {
    applyReorder(newUnchecked);
  },
});

// Persist a manual reorder of the unchecked group. The new full-array order is
// the reordered unchecked items followed by the checked items (kept at the
// bottom, in their current order). Optimistically update, then resync from the
// server response — mirroring handleItemCheckedChange.
const applyReorder = (
  newUnchecked: { item: any; originalIndex: number }[]
) => {
  if (!list.value || !list.value.items) return;

  const order = [
    ...newUnchecked.map((entry) => entry.originalIndex),
    ...checkedItems.value.map((entry) => entry.originalIndex),
  ];

  // Guard against a partial ordering (e.g. if a search filter were active).
  if (order.length !== list.value.items.length) return;

  const previousItems = list.value.items;
  const reordered = order.map((idx) => previousItems[idx]);
  list.value = { ...list.value, items: reordered };

  const listId = route.params.id as string;
  reorderListItems(listId, order)
    .then((updatedList) => {
      list.value = updatedList;
    })
    .catch((err: any) => {
      // Revert on error
      list.value = { ...list.value, items: previousItems };
      console.error("Failed to reorder items:", err);
    });
};

const checkedItemIndexes = computed(() => {
  if (!list.value || !list.value.items) {
    return [];
  }

  return list.value.items
    .map((item: any, index: number) => (item.checked ? index : -1))
    .filter((index: number) => index !== -1);
});

// Check if current user is the list owner
const isListOwner = computed(() => {
  if (!list.value || !user.value) return false;
  return list.value.user_id === user.value.id;
});

// Confetti functions (defined early so they can be used in loadList)
const checkAllItemsChecked = (): boolean => {
  if (!list.value || !list.value.items || list.value.items.length === 0) {
    return false;
  }
  return list.value.items.every((item: any) => item.checked);
};

const triggerConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
};

const checkAndTriggerConfetti = () => {
  if (!list.value) return;

  const allChecked = checkAllItemsChecked();

  // Only trigger confetti when transitioning from "not all checked" to "all checked"
  if (allChecked && !wasAllChecked.value) {
    triggerConfetti();
  }

  wasAllChecked.value = allChecked;
};

const loadList = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const listId = route.params.id as string;
    list.value = await getList(listId);
    // Initialize the wasAllChecked state
    wasAllChecked.value = checkAllItemsChecked();
  } catch (err: any) {
    if (err.statusCode === 404) {
      error.value = "List not found";
    } else if (err.statusCode === 403) {
      error.value = "You do not have access to this list";
    } else {
      error.value = err.data?.error || err.message || "Failed to load list";
    }
  } finally {
    isLoading.value = false;
  }
};

const startEditName = () => {
  if (!list.value) return;
  editingName.value = list.value.name;
  isEditingName.value = true;
  nextTick(() => {
    nameInput.value?.focus();
    nameInput.value?.select();
  });
};

const cancelEditName = () => {
  isEditingName.value = false;
  editingName.value = "";
};

const saveName = async () => {
  if (!list.value || isSaving.value) return;

  const trimmedName = editingName.value.trim();
  if (!trimmedName) {
    cancelEditName();
    return;
  }

  if (trimmedName === list.value.name) {
    cancelEditName();
    return;
  }

  isSaving.value = true;
  try {
    const listId = route.params.id as string;
    const updatedList = await updateList(listId, { name: trimmedName });
    list.value = updatedList;
    isEditingName.value = false;
    editingName.value = "";
  } catch (err: any) {
    error.value =
      err.data?.error || err.message || "Failed to update list name";
    // Keep editing mode on error so user can retry
  } finally {
    isSaving.value = false;
  }
};

const handleAddItem = async () => {
  if (!addForm.value.name.trim()) {
    addError.value = "Item name is required";
    return;
  }

  isAdding.value = true;
  addError.value = null;

  try {
    const listId = route.params.id as string;
    const updatedList = await addListItem(listId, {
      name: addForm.value.name.trim(),
      quantity: addForm.value.quantity || 1,
      details: addForm.value.details?.trim() || undefined,
    });

    list.value = updatedList;
    checkAndTriggerConfetti();

    // Reset form and hide
    addForm.value = {
      name: "",
      quantity: 1,
      details: "",
    };
    showAddForm.value = false;
  } catch (err: any) {
    addError.value = err.data?.error || err.message || "Failed to add item";
  } finally {
    isAdding.value = false;
  }
};

const cancelAddForm = () => {
  showAddForm.value = false;
  addForm.value = {
    name: "",
    quantity: 1,
    details: "",
  };
  addError.value = null;
};

const openSearch = () => {
  isSearchOpen.value = true;
  nextTick(() => {
    searchInput.value?.focus();
  });
};

const closeSearch = () => {
  isSearchOpen.value = false;
  searchQuery.value = "";
};

// Watch for when add form is shown to focus input
watch(showAddForm, (isShown) => {
  if (isShown) {
    nextTick(() => {
      addNameInput.value?.focus();
    });
  }
});

const openEditModal = (index: number) => {
  if (!list.value || !list.value.items[index]) return;
  editingItem.value = { ...list.value.items[index] };
  editingItemIndex.value = index;
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingItem.value = null;
  editingItemIndex.value = null;
};

const handleItemUpdated = (updatedList: any) => {
  list.value = updatedList;
};

const handleItemDeleted = (updatedList: any) => {
  list.value = updatedList;
  checkAndTriggerConfetti();
};

// Debounce timer for checkbox updates
const debounceTimers = new Map<number, ReturnType<typeof setTimeout>>();

const toggleItemChecked = (index: number) => {
  if (!list.value || !list.value.items[index]) return;

  const currentChecked = list.value.items[index].checked;
  const newChecked = !currentChecked;

  // Create a synthetic event to reuse existing handler
  const syntheticEvent = {
    target: { checked: newChecked },
  } as unknown as Event;

  handleItemCheckedChange(index, syntheticEvent);
};

const handleItemCheckedChange = async (index: number, event: Event) => {
  if (!list.value) return;

  const target = event.target as HTMLInputElement;
  const newChecked = target.checked;

  // Optimistically update the UI
  if (list.value.items[index]) {
    list.value.items[index].checked = newChecked;
  }

  // Check for confetti after optimistic update
  checkAndTriggerConfetti();

  // Clear existing debounce timer for this item
  const existingTimer = debounceTimers.get(index);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  // Set new debounce timer
  const timer = setTimeout(async () => {
    try {
      const listId = route.params.id as string;
      const updatedList = await updateListItemChecked(
        listId,
        index,
        newChecked
      );
      // Update with server response to ensure sync
      list.value = updatedList;
      // Check for confetti after server response
      checkAndTriggerConfetti();
    } catch (err: any) {
      // Revert on error
      if (list.value.items[index]) {
        list.value.items[index].checked = !newChecked;
      }
      console.error("Failed to update item checked state:", err);
      // Re-check state after revert
      checkAndTriggerConfetti();
    } finally {
      debounceTimers.delete(index);
    }
  }, 500); // 500ms debounce

  debounceTimers.set(index, timer);
};

const handleShareList = async () => {
  if (!list.value) return;

  try {
    const shareUrl = `${window.location.origin}/lists/share/${list.value.id}`;
    await navigator.clipboard.writeText(shareUrl);

    shareNotification.value = "Share link copied to clipboard!";
    setTimeout(() => {
      shareNotification.value = null;
    }, 3000);
  } catch (err) {
    // Fallback for browsers that don't support clipboard API
    const shareUrl = `${window.location.origin}/lists/share/${list.value.id}`;
    const textArea = document.createElement("textarea");
    textArea.value = shareUrl;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      shareNotification.value = "Share link copied to clipboard!";
      setTimeout(() => {
        shareNotification.value = null;
      }, 3000);
    } catch (e) {
      shareNotification.value =
        "Failed to copy link. Please copy manually: " + shareUrl;
      setTimeout(() => {
        shareNotification.value = null;
      }, 5000);
    }
    document.body.removeChild(textArea);
  }
};

const handleDeleteList = async () => {
  if (!list.value) return;

  // Confirm deletion
  if (
    !confirm(
      `Are you sure you want to delete "${list.value.name}"? This action cannot be undone.`
    )
  ) {
    return;
  }

  isDeletingList.value = true;
  error.value = null;

  try {
    const listId = route.params.id as string;
    await deleteList(listId);
    // Redirect to dashboard after successful deletion
    await router.push("/dashboard");
  } catch (err: any) {
    error.value = err.data?.error || err.message || "Failed to delete list";
    isDeletingList.value = false;
  }
};

const handleClearCheckedItems = async () => {
  if (!list.value || isClearingCheckedItems.value) return;

  const indexesToClear = [...checkedItemIndexes.value].sort((a, b) => b - a);
  if (indexesToClear.length === 0) return;

  if (
    !confirm(
      "Remove all checked items from this list? This action cannot be undone."
    )
  ) {
    return;
  }

  isClearingCheckedItems.value = true;
  error.value = null;

  debounceTimers.forEach((timer) => clearTimeout(timer));
  debounceTimers.clear();

  try {
    const listId = route.params.id as string;
    let updatedList = list.value;

    for (const index of indexesToClear) {
      updatedList = await deleteListItem(listId, index);
    }

    list.value = updatedList;
    checkAndTriggerConfetti();
  } catch (err: any) {
    error.value =
      err.data?.error || err.message || "Failed to clear checked items";
  } finally {
    isClearingCheckedItems.value = false;
  }
};

// Load list on page load
await loadList();

// Cleanup timers on unmount
onUnmounted(() => {
  debounceTimers.forEach((timer) => clearTimeout(timer));
  debounceTimers.clear();
});
</script>
