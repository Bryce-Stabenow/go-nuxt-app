<template>
  <div class="mb-5">
    <label :for="id" class="field-label">
      {{ label }}
      <slot name="label-suffix"></slot>
    </label>
    <input
      :id="id"
      :type="type"
      v-model="model"
      :required="required"
      :minlength="minlength"
      class="field"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  minlength?: number;
}>();

const model = defineModel<string>();
</script>

