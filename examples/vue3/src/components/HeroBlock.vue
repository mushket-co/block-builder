<template>
  <div class="hero-block">
    <div class="hero-block__content">
      <h1 class="hero-block__title">{{ title }}</h1>
      <p v-if="subtitle" class="hero-block__subtitle">{{ subtitle }}</p>
      <button v-if="buttonText" class="hero-block__button">
        {{ buttonText }}
      </button>
    </div>
    <div v-if="backgroundImage" class="hero-block__background">
      <img :src="backgroundImage" :alt="title" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  buttonText?: string;
  backgroundImage?: string;
}>();
</script>

<style scoped>
.hero-block {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  overflow: hidden;
  
  /* 🎯 Используем CSS переменные для padding из spacing */
  padding-top: var(--spacing-padding-top, 60px);
  padding-bottom: var(--spacing-padding-bottom, 60px);
  padding-left: 40px;
  padding-right: 40px;
}

.hero-block__background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.hero-block__background img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3;
}

.hero-block__content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  max-width: 700px;
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
  margin: 0 0 30px 0;
  opacity: 0.95;
  line-height: 1.5;
}

.hero-block__button {
  padding: 16px 40px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #667eea;
  background: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.hero-block__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.3);
}

.hero-block__button:active {
  transform: translateY(0);
}

/* Адаптив для маленьких экранов */
@media (max-width: 767px) {
  .hero-block {
    min-height: 300px;
    padding-left: 20px;
    padding-right: 20px;
  }

  .hero-block__title {
    font-size: 2rem;
  }

  .hero-block__subtitle {
    font-size: 1.1rem;
  }
}
</style>
