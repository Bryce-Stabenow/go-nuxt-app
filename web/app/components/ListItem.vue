<template>
  <div
    class="flex items-stretch overflow-hidden rounded-ticket transition-all"
    :class="
      item.checked
        ? 'bg-navy-950/50 opacity-70'
        : 'bg-navy-800/70 hover:-translate-y-px'
    "
    style="border: 1px solid rgba(147, 169, 199, 0.16)"
  >
    <div
      v-if="draggable"
      class="drag-handle flex items-center justify-center px-1.5 text-mist/50 transition-colors hover:text-brass cursor-grab active:cursor-grabbing touch-none select-none"
      style="border-right: 1px dashed rgba(147, 169, 199, 0.18)"
      aria-label="Drag to reorder"
      @click.stop
    >
      <Icon name="heroicons:bars-2" class="h-5 w-5" />
    </div>
    <div
      class="flex-1 cursor-pointer p-3 md:p-4 transition-colors"
      @click="handleItemClick"
    >
      <div class="flex items-center gap-2.5">
        <span
          class="font-display font-semibold text-cloud"
          :class="{ 'text-mist line-through decoration-citron/70': item.checked }"
        >
          {{ item.name }}
        </span>
        <span v-if="item.quantity > 0" class="chip chip-brass shrink-0">
          ×{{ item.quantity }}
        </span>
      </div>
      <p
        v-if="item.details"
        class="mt-1.5 font-mono text-xs leading-relaxed text-mist"
      >
        {{ item.details }}
      </p>
    </div>
    <button
      type="button"
      @click.stop="handleToggle"
      :aria-pressed="item.checked"
      :aria-label="item.checked ? 'Mark as not gathered' : 'Mark as gathered'"
      class="flex w-16 shrink-0 items-center justify-center transition-colors md:w-20"
      :class="
        item.checked
          ? 'bg-citron/90 hover:bg-citron'
          : 'bg-navy-950/60 hover:bg-navy-700'
      "
      style="border-left: 1px dashed rgba(147, 169, 199, 0.18)"
    >
      <input
        type="checkbox"
        :checked="item.checked"
        @change="handleChange"
        class="sr-only"
        tabindex="-1"
      />
      <Icon
        name="heroicons:check"
        class="h-7 w-7 transition-transform"
        :class="item.checked ? 'text-ink scale-100' : 'text-mist/40 scale-90'"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  item: {
    name: string;
    checked: boolean;
    quantity: number;
    details?: string;
  };
  originalIndex: number;
  draggable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  draggable: false,
});

const emit = defineEmits<{
  toggle: [index: number];
  change: [index: number, event: Event];
  click: [index: number];
}>();

const handleToggle = () => {
  emit("toggle", props.originalIndex);
};

const handleChange = (event: Event) => {
  emit("change", props.originalIndex, event);
};

const handleItemClick = () => {
  emit("click", props.originalIndex);
};
</script>
