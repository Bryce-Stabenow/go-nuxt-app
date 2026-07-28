<template>
  <NuxtLink
    :to="`/lists/${list.id}`"
    draggable="false"
    class="ticket group block no-underline transition-all duration-200 hover:-translate-y-0.5"
    :class="[
      isShared ? 'hover:border-citron/40' : 'hover:border-brass/45',
      draggable ? 'pl-11' : 'pl-5',
      'py-4 pr-5',
    ]"
  >
    <!-- Left accent spine -->
    <span
      class="absolute inset-y-3 left-0 w-[3px] rounded-full transition-colors"
      :class="isShared ? 'bg-citron/50 group-hover:bg-citron' : 'bg-brass/45 group-hover:bg-brass'"
    ></span>
    <div
      v-if="draggable"
      class="drag-handle absolute left-3 top-1/2 flex -translate-y-1/2 items-center justify-center p-1 text-mist/60 transition-colors hover:text-brass cursor-grab active:cursor-grabbing touch-none select-none"
      aria-label="Drag to reorder"
      @click.prevent.stop
      @mousedown.stop
    >
      <Icon name="heroicons:bars-2" class="h-5 w-5" />
    </div>
    <div class="mb-1.5 flex items-start justify-between gap-3">
      <h3
        class="flex-1 font-display text-xl font-bold text-cloud transition-colors group-hover:text-brass"
      >
        {{ list.name }}
      </h3>
      <span
        v-if="isShared"
        class="chip whitespace-nowrap !text-citron"
        style="background: rgba(190, 234, 76, 0.14)"
      >
        Shared
      </span>
    </div>
    <p v-if="list.description" class="mb-3 line-clamp-2 text-sm text-mist">
      {{ list.description }}
    </p>
    <div class="flex items-center justify-between font-mono text-xs text-mist">
      <span class="text-brass/90"
        >{{ list.items.length }} item{{
          list.items.length !== 1 ? "s" : ""
        }}</span
      >
      <span>{{ new Date(list.created_at).toLocaleDateString() }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    list: any;
    isShared: boolean;
    draggable?: boolean;
  }>(),
  {
    draggable: false,
  }
);
</script>

