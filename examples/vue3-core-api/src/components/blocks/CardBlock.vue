<template>
  <div class="card-block" :style="cardStyle">
    <h3 class="card-block__title">{{ title }}</h3>
    <p class="card-block__description">{{ description }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  description: String,
  bgColor: String,
  borderColor: String
})

const cardStyle = computed(() => ({
  backgroundColor: props.bgColor || '#ffffff',
  border: `2px solid ${props.borderColor || '#dddddd'}`
}))
</script>

<style scoped>
.card-block {
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.card-block__title {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.card-block__description {
  margin: 0;
  color: #666;
  line-height: 1.6;
}
</style>

