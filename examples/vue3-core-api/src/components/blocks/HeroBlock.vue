<template>
  <div class="hero-block" :style="heroStyle">
    <div class="hero-block__content">
      <h1 class="hero-block__title">{{ title }}</h1>
      <p v-if="subtitle" class="hero-block__subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  subtitle: String,
  bgImage: String
})

const heroStyle = computed(() => ({
  backgroundImage: props.bgImage ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${props.bgImage})` : 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))',
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}))
</script>

<style scoped>
.hero-block {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
  padding: 40px;
}

.hero-block__content {
  text-align: center;
  z-index: 1;
}

.hero-block__title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 20px 0;
  line-height: 1.2;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.hero-block__subtitle {
  font-size: 1.5rem;
  margin: 0;
  opacity: 0.95;
  line-height: 1.5;
}

@media (max-width: 767px) {
  .hero-block {
    min-height: 300px;
    padding: 20px;
  }

  .hero-block__title {
    font-size: 2rem;
  }

  .hero-block__subtitle {
    font-size: 1.1rem;
  }
}
</style>

