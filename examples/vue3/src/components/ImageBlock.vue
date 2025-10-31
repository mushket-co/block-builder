<template>
  <div class="image-block">
    <div class="container">
      <img
        :src="src"
        :alt="alt"
        :style="imageStyle"
        @error="handleImageError"
        @load="handleImageLoad"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  borderRadius: {
    type: Number,
    default: 0
  }
})

const imageStyle = computed(() => ({
  borderRadius: `${props.borderRadius}px`,
  maxWidth: '100%',
  height: 'auto',
  objectFit: 'cover',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
}))

const handleImageError = () => {
  console.warn('Ошибка загрузки изображения:', props.src)
}

const handleImageLoad = () => {
  console.log('Изображение загружено:', props.src)
}
</script>

<style scoped>
.image-block {
  text-align: center;
  margin: 20px 0;
}

.image-block img {
  transition: transform 0.3s ease;
}

.image-block img:hover {
  transform: scale(1.02);
}
</style>

