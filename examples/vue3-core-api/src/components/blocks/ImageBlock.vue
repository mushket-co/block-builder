<template>
  <div class="image-block">
    <img :src="imageUrl" :alt="alt" />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  image: [String, Object],
  alt: String
});

// Преобразуем image в URL для img тега
// base64 - всегда строка
// серверное загрузка - объект с обязательным src
const imageUrl = computed(() => {
  if (typeof props.image === 'string') return props.image;
  if (typeof props.image === 'object' && props.image !== null) {
    return props.image.src || '';
  }
  return '';
});
</script>

<style scoped>
.image-block {
  text-align: center;
  margin-bottom: 1rem;
}

.image-block img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>

