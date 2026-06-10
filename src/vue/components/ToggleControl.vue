<template>
  <div :class="CSS_CLASSES.TOGGLE_CONTROL">
    <div :class="CSS_CLASSES.TOGGLE_CONTROL_HEADER">
      <div
        :class="[
          CSS_CLASSES.TOGGLE_CONTROL_LABEL,
          { [CSS_CLASSES.TOGGLE_CONTROL_LABEL_ACTIVE]: modelValue },
        ]"
        @click="handleToggleClick"
      >
        <slot name="label">{{ label }}</slot>
      </div>
      <div
        :class="[
          CSS_CLASSES.TOGGLE_CONTROL_BUTTON,
          { [CSS_CLASSES.TOGGLE_CONTROL_BUTTON_ACTIVE]: modelValue },
        ]"
        @click="handleToggleClick"
      >
        <div :class="CSS_CLASSES.TOGGLE_CONTROL_BUTTON_INNER">
          <div :class="CSS_CLASSES.TOGGLE_CONTROL_BUTTON_CIRCLE" />
        </div>
      </div>
    </div>
    <div v-if="modelValue" :class="CSS_CLASSES.TOGGLE_CONTROL_BODY">
      <slot name="body" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CSS_CLASSES } from '../../utils/constants';
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
