<template>
  <div 
    class="spaced-content-block"
    :style="{ backgroundColor }"
  >
    <div class="spaced-content-block__inner">
      <h2 v-if="title" class="spaced-content-block__title">{{ title }}</h2>
      <div class="spaced-content-block__content" v-html="content"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Пример блока, который использует CSS переменные для padding.
 * CSS переменные (--spacing-padding-top, --spacing-padding-bottom) 
 * автоматически устанавливаются на родительском .block-builder-block
 * и доступны для использования внутри компонента.
 */

defineProps<{
  title?: string;
  content?: string;
  backgroundColor?: string;
}>();
</script>

<style scoped>
.spaced-content-block {
  /* 🎯 Используем CSS переменные для padding из spacing */
  /* Переменные автоматически устанавливаются на .block-builder-block */
  /* и обновляются при изменении размера окна через JavaScript */
  padding-top: var(--spacing-padding-top, 20px);
  padding-bottom: var(--spacing-padding-bottom, 20px);
  transition: all 0.3s ease;
}

.spaced-content-block__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.spaced-content-block__title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.spaced-content-block__content {
  font-size: 1rem;
  line-height: 1.6;
  color: #495057;
}

/* Адаптив для контента (не для spacing!) */
@media (max-width: 1199px) {
  .spaced-content-block__title {
    font-size: 1.75rem;
  }
}

@media (max-width: 767px) {
  .spaced-content-block__inner {
    padding: 0 15px;
  }
  
  .spaced-content-block__title {
    font-size: 1.5rem;
  }
}
</style>

