<template>
  <NuxtLink
    :to="`/lists/${list.id}`"
    draggable="false"
    class="block p-5 border-2 rounded-lg hover:shadow-md transition-all cursor-pointer no-underline relative"
    :class="[
      isShared
        ? 'border-purple-300 bg-purple-50 hover:border-purple-400'
        : 'border-gray-200 hover:border-purple-500',
      draggable ? 'pl-10' : '',
    ]"
  >
    <div
      v-if="draggable"
      class="drag-handle absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none select-none"
      aria-label="Drag to reorder"
      @click.prevent.stop
      @mousedown.stop
    >
      <Icon name="heroicons:bars-3" class="h-5 w-5" />
    </div>
    <div class="flex items-start justify-between mb-2">
      <h3 class="text-xl font-semibold text-gray-900 flex-1">
        {{ list.name }}
      </h3>
      <span
        v-if="isShared"
        class="ml-2 px-2 py-1 bg-purple-200 text-purple-700 text-xs font-semibold rounded-full whitespace-nowrap"
      >
        Shared with you
      </span>
    </div>
    <p
      v-if="list.description"
      class="text-gray-600 text-sm mb-3 line-clamp-2"
    >
      {{ list.description }}
    </p>
    <div
      class="flex justify-between items-center text-sm text-gray-500"
    >
      <span
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

