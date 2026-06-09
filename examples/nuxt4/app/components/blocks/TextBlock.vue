<template>
  <div class="text-block">
    <div class="container" :style="blockStyle">
      {{ content }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  fontSize: {
    type: Number,
    default: 16
  },
  color: {
    type: String,
    default: '#333333'
  },
  textAlign: {
    type: String,
    default: 'left'
  }
})

const blockStyle = computed(() => ({
  textAlign: props.textAlign,
  fontSize: `${props.fontSize}px`,
  color: props.color,
  padding: '10px',
  border: '1px solid #e9ecef',
  borderRadius: '4px',
  background: '#f8f9fa'
}))
</script>

<style scoped>
.text-block {
  transition: all 0.2s ease;
}

.text-block:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>

