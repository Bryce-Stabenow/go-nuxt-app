<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="close"
      >
        <div
          class="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all"
        >
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Edit Item</h2>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="openMoveModal"
                :disabled="isDeleting || isSubmitting"
                class="px-3 py-2 text-gray-600 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move item"
              >
                <Icon name="heroicons:arrow-right" class="h-5 w-5" />
              </button>
              <button
                type="button"
                @click="handleDelete"
                :disabled="isDeleting"
                class="px-3 py-2 text-red-600 border-2 border-red-300 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete item"
              >
                <Icon
                  v-if="isDeleting"
                  name="svg-spinners:ring-resize"
                  class="h-5 w-5"
                />
                <Icon v-else name="heroicons:trash" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label
                for="item-name"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Name*
              </label>
              <input
                id="item-name"
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter item name"
                ref="nameInput"
              />
            </div>

            <div>
              <label
                for="item-quantity"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Quantity
              </label>
              <input
                id="item-quantity"
                v-model.number="form.quantity"
                type="number"
                min="1"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="1"
              />
            </div>

            <div>
              <label
                for="item-details"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Details
              </label>
              <textarea
                id="item-details"
                v-model="form.details"
                maxlength="512"
                rows="3"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none"
                placeholder="Add any additional details (optional)"
              />
              <div class="text-xs text-gray-500 mt-1 text-right">
                {{ (form.details || "").length }}/512
              </div>
            </div>

            <div v-if="error" class="text-red-600 text-sm">
              {{ error }}
            </div>

            <div class="flex gap-4 justify-center">
              <button
                type="button"
                @click="close"
                class="px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isSubmitting">Saving...</span>
                <span v-else>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isMoveModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="closeMoveModal"
      >
        <div
          class="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all"
        >
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Move Item</h2>
          </div>

          <form @submit.prevent="handleMoveItem" class="space-y-6">
            <div>
              <label
                for="move-item-list"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Move to list
              </label>
              <select
                id="move-item-list"
                v-model="selectedMoveListId"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="" disabled>
                  Select a list
                </option>
                <option
                  v-for="availableList in availableMoveLists"
                  :key="availableList.id"
                  :value="availableList.id"
                >
                  {{ availableList.name }}
                </option>
              </select>
            </div>

            <div v-if="moveError" class="text-red-600 text-sm">
              {{ moveError }}
            </div>

            <div class="flex gap-4 justify-center">
              <button
                type="button"
                @click="closeMoveModal"
                class="px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isMovingItem || !selectedMoveListId"
                class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isMovingItem">Moving...</span>
                <span v-else>Save</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
  item?: {
    name: string;
    quantity: number;
    details?: string;
  } | null;
  itemIndex?: number | null;
}

interface Emits {
  (e: "close"): void;
  (e: "item-updated", item: any): void;
  (e: "item-deleted", item: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { updateListItem, deleteListItem, addListItem, getLists } = useLists();
const route = useRoute();

const form = ref({
  name: "",
  quantity: 1,
  details: "",
});

const error = ref<string | null>(null);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const nameInput = ref<HTMLInputElement | null>(null);
const isMoveModalOpen = ref(false);
const isMovingItem = ref(false);
const moveError = ref<string | null>(null);
const selectedMoveListId = ref("");
const availableMoveLists = ref<{ id: string; name: string }[]>([]);

const close = () => {
  emit("close");
};

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    error.value = "Item name is required";
    return;
  }

  if (props.itemIndex === null || props.itemIndex === undefined) {
    error.value = "Item index is required";
    return;
  }

  isSubmitting.value = true;
  error.value = null;

  try {
    const listId = route.params.id as string;
    // Always send details field when editing (even if empty) to allow clearing it
    const trimmedDetails = (form.value.details || "").trim();
    const updatedList = await updateListItem(listId, props.itemIndex, {
      name: form.value.name.trim(),
      quantity: form.value.quantity || 1,
      details: trimmedDetails, // Send empty string to clear, or the trimmed value
    });

    emit("item-updated", updatedList);
    close();
  } catch (err: any) {
    error.value = err.data?.error || err.message || "Failed to update item";
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async () => {
  if (props.itemIndex === null || props.itemIndex === undefined) {
    error.value = "Item index is required";
    return;
  }

  isDeleting.value = true;
  error.value = null;

  try {
    const listId = route.params.id as string;
    const updatedList = await deleteListItem(listId, props.itemIndex);

    emit("item-deleted", updatedList);
    close();
  } catch (err: any) {
    error.value = err.data?.error || err.message || "Failed to delete item";
  } finally {
    isDeleting.value = false;
  }
};

const openMoveModal = async () => {
  if (!props.item || props.itemIndex === null || props.itemIndex === undefined) {
    moveError.value = "Item is required to move";
    return;
  }

  isMoveModalOpen.value = true;
  moveError.value = null;
  selectedMoveListId.value = "";

  try {
    const allLists = await getLists();
    const currentListId = route.params.id as string;
    availableMoveLists.value = allLists
      .filter((list) => list.id !== currentListId)
      .map((list) => ({ id: list.id, name: list.name }));
  } catch (err: any) {
    moveError.value =
      err.data?.error || err.message || "Failed to load lists";
  }
};

const closeMoveModal = () => {
  isMoveModalOpen.value = false;
  moveError.value = null;
  selectedMoveListId.value = "";
};

const handleMoveItem = async () => {
  if (!props.item || props.itemIndex === null || props.itemIndex === undefined) {
    moveError.value = "Item is required to move";
    return;
  }

  if (!selectedMoveListId.value) {
    moveError.value = "Select a list to move this item";
    return;
  }

  isMovingItem.value = true;
  moveError.value = null;

  try {
    const currentListId = route.params.id as string;
    await addListItem(selectedMoveListId.value, {
      name: props.item.name.trim(),
      quantity: props.item.quantity || 1,
      details: props.item.details?.trim() || undefined,
    });

    const updatedList = await deleteListItem(
      currentListId,
      props.itemIndex
    );

    emit("item-deleted", updatedList);
    closeMoveModal();
    close();
  } catch (err: any) {
    moveError.value =
      err.data?.error || err.message || "Failed to move item";
  } finally {
    isMovingItem.value = false;
  }
};

// Update form when item prop changes
watch(
  () => props.item,
  (item) => {
    if (item) {
      form.value = {
        name: item.name,
        quantity: item.quantity,
        details: item.details || "",
      };
    }
  },
  { immediate: true }
);

// Focus name input when modal opens
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        nameInput.value?.focus();
        nameInput.value?.select();
      });
    } else {
      error.value = null;
      closeMoveModal();
    }
  }
);
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.1s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.1s ease, opacity 0.1s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
  opacity: 0;
}
</style>
