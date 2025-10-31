<template>
  <div class="image-block">
    <img :src="src" :alt="alt" />
  </div>
</template>

<script setup>
defineProps({
  src: String,
  alt: String
})
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

