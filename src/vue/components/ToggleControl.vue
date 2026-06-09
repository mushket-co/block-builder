<template>
  <div class="bb-toggle-control">
    <div class="bb-toggle-control__header">
      <div
        class="bb-toggle-control__label"
        :class="{ 'bb-toggle-control__label--is-active': modelValue }"
        @click="handleToggleClick"
      >
        <slot name="label">{{ label }}</slot>
      </div>
      <div
        class="bb-toggle-control__button"
        :class="{ 'bb-toggle-control__button--is-active': modelValue }"
        @click="handleToggleClick"
      >
        <div class="bb-toggle-control__button-inner">
          <div class="bb-toggle-control__button-circle" />
        </div>
      </div>
    </div>
    <div v-if="modelValue" class="bb-toggle-control__body">
      <slot name="body" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  label?: string;
  fieldName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  fieldName: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const handleToggleClick = (): void => {
  (emit as any)('update:modelValue', !props.modelValue);
};
</script>
