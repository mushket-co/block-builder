<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="className"
  >
    <use :href="`#icon-${name}`" />
  </svg>
</template>

<script setup lang="ts">
import { ICON_SYMBOLS } from './sprite';

interface Props {
  name: keyof typeof ICON_SYMBOLS;
  width?: number;
  height?: number;
  className?: string;
}

withDefaults(defineProps<Props>(), {
  width: 16,
  height: 16,
  className: ''
});
</script>
