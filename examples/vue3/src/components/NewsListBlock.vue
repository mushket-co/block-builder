<template>
  <div
    class="news-list-block"
    :style="{
      backgroundColor: props.backgroundColor,
      color: props.textColor
    }"
  >
    <div class="container">
      <!-- Заголовок -->
      <h2 class="news-list-block__title">{{ props.title }}</h2>

    <!-- Главная новость -->
    <div v-if="featuredNews" class="news-list-block__featured">
      <h3>🌟 Главная новость:</h3>
      <div class="news-card news-card--featured">
        <h4>{{ featuredNews.title }}</h4>
        <p v-if="props.showDate" class="news-date">{{ featuredNews.date }}</p>
      </div>
    </div>

    <!-- Список новостей -->
    <div
      v-if="newsList.length > 0"
      class="news-list-block__grid"
      :style="{
        gridTemplateColumns: `repeat(${props.columns || 2}, 1fr)`
      }"
    >
      <div
        v-for="news in newsList"
        :key="news.id"
        class="news-card"
      >
        <h4>{{ news.title }}</h4>
        <p v-if="props.showDate" class="news-date">{{ news.date }}</p>
      </div>
    </div>

    <!-- Состояния загрузки -->
    <div v-if="loading" class="news-list-block__loading">
      Загрузка новостей...
    </div>

    <div v-if="error" class="news-list-block__error">
      Ошибка загрузки: {{ error }}
    </div>

    <div v-if="!loading && !error && !featuredNews && newsList.length === 0" class="news-list-block__empty">
      Новости не выбраны. Настройте блок в редакторе.
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';

interface IProps {
  title?: string;
  featuredNewsId?: number | null;
  newsIds?: number[];
  showDate?: boolean;
  columns?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface INews {
  id: number;
  name: string;
  title: string;
  date: string;
}

const props = withDefaults(defineProps<IProps>(), {
  title: 'Последние новости',
  featuredNewsId: null,
  newsIds: () => [],
  showDate: true,
  columns: '2',
  backgroundColor: '#f8f9fa',
  textColor: '#333333'
});

const loading = ref(false);
const error = ref<string | null>(null);
const featuredNews = ref<INews | null>(null);
const newsList = ref<INews[]>([]);

// Используем computed для отслеживания изменений
const newsIdsValue = computed(() => props.newsIds || []);
const featuredNewsIdValue = computed(() => props.featuredNewsId);

/**
 * Загрузка данных новостей с API
 */
async function loadNewsData(): Promise<void> {
  if (!newsIdsValue.value || newsIdsValue.value.length === 0) {
    newsList.value = [];
  }

  if (!featuredNewsIdValue.value && (!newsIdsValue.value || newsIdsValue.value.length === 0)) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Загружаем все новости (в реальном приложении можно отправить список ID)
    const response = await fetch('http://localhost:3001/api/news?limit=100');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const allNews = data.data || [];

    // Находим главную новость
    if (featuredNewsIdValue.value) {
      featuredNews.value = allNews.find((n: INews) => n.id === featuredNewsIdValue.value) || null;
    } else {
      featuredNews.value = null;
    }

    // Находим выбранные новости
    if (newsIdsValue.value && newsIdsValue.value.length > 0) {
      newsList.value = allNews.filter((n: INews) => newsIdsValue.value.includes(n.id));
    } else {
      newsList.value = [];
    }
  } catch (err: any) {
    error.value = err.message || 'Неизвестная ошибка';
    console.error('Ошибка загрузки новостей:', err);
  } finally {
    loading.value = false;
  }
}

// Загрузка при монтировании
onMounted(() => {
  loadNewsData();
});

// Перезагрузка при изменении выбранных новостей
watch([newsIdsValue, featuredNewsIdValue], () => {
  loadNewsData();
});
</script>

<style scoped>
.news-list-block {
  border-radius: 8px;
}

.news-list-block__title {
  margin: 0 0 20px 0;
  font-size: 28px;
  font-weight: bold;
}

.news-list-block__featured {
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.news-list-block__featured h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
}

.news-list-block__grid {
  display: grid;
  gap: 20px;
}

.news-card {
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.news-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.news-card--featured {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.news-card h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
  color: inherit;
}

.news-date {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

.news-list-block__loading,
.news-list-block__error,
.news-list-block__empty {
  padding: 40px;
  text-align: center;
  font-size: 16px;
}

.news-list-block__error {
  color: #e74c3c;
}

.news-list-block__empty {
  opacity: 0.6;
}

@media (max-width: 768px) {
  .news-list-block__grid {
    grid-template-columns: 1fr !important;
  }
}
</style>

