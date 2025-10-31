<template>
  <div class="feature-card">
    <div class="feature-card__icon" v-if="icon">{{ icon }}</div>
    <h3 class="feature-card__title">{{ title }}</h3>
    <p class="feature-card__description">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string;
  title: string;
  description: string;
}>();
</script>

<style scoped>
.feature-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  transition: transform 0.3s, box-shadow 0.3s;
  
  /* 🎯 Используем CSS переменные для padding из spacing */
  padding-top: var(--spacing-padding-top, 30px);
  padding-bottom: var(--spacing-padding-bottom, 30px);
  padding-left: 30px;
  padding-right: 30px;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.feature-card__icon {
  font-size: 3rem;
  margin-bottom: 20px;
  text-align: center;
}

.feature-card__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 15px 0;
  color: #2d3748;
}

.feature-card__description {
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  color: #4a5568;
}

@media (max-width: 767px) {
  .feature-card {
    padding-left: 20px;
    padding-right: 20px;
  }

  .feature-card__title {
    font-size: 1.3rem;
  }
}
</style>

