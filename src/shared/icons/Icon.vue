<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="viewBox"
    :fill="usesFill ? 'currentColor' : 'none'"
    :stroke="usesFill ? 'none' : 'currentColor'"
    :stroke-width="usesFill ? undefined : 1"
    :stroke-linecap="usesFill ? undefined : 'round'"
    :stroke-linejoin="usesFill ? undefined : 'round'"
    :class="iconClass"
  >
    <use :href="`#block-builder-icon-${name}`" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { ICON_SYMBOLS, resolveIconUsesFill, resolveIconViewBox } from './sprite';

interface Props {
  name: keyof typeof ICON_SYMBOLS;
  width?: number;
  height?: number;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 16,
  height: 16,
  className: '',
});

const viewBox = computed(() => resolveIconViewBox(props.name));
const usesFill = computed(() => resolveIconUsesFill(props.name));
const iconClass = computed(() =>
  [props.className, usesFill.value ? 'bb-icon--filled' : 'bb-icon--stroke'].filter(Boolean).join(' ')
);
</script>
