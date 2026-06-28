<template>
  <div class="text-block">
    <p class="text-block__content" :style="blockStyle">{{ content }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  fontSize: {
    type: Number,
    default: 16,
  },
  color: {
    type: String,
    default: '#333333',
  },
  textAlign: {
    type: String,
    default: 'left',
  },
})

const blockStyle = computed(() => ({
  textAlign: props.textAlign,
  fontSize: `${props.fontSize}px`,
  color: props.color,
  margin: 0,
  padding: '16px',
}))
</script>
