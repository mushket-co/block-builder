<template>
  <div class="text-block" :style="blockStyle">
    <p>{{ content }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: String,
  fontSize: Number,
  color: String
})

const blockStyle = computed(() => ({
  fontSize: `${props.fontSize || 16}px`,
  color: props.color || '#333'
}))
</script>

<style scoped>
.text-block {
  padding: 1rem;
  background: white;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.text-block p {
  margin: 0;
}
</style>

