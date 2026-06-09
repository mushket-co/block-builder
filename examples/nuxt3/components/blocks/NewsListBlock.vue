<template>
  <div
    class="news-list-block"
    :style="{
      backgroundColor: props.backgroundColor,
      color: props.textColor,
    }"
  >
    <div class="container">
      <h2 class="news-list-block__title">{{ props.title }}</h2>

      <div v-if="displayFeaturedNews" class="news-list-block__featured">
        <h3>🌟 Главная новость:</h3>
        <div class="news-card news-card--featured">
          <h4>{{ displayFeaturedNews.title }}</h4>
          <p v-if="props.showDate" class="news-date">{{ displayFeaturedNews.date }}</p>
        </div>
      </div>

      <div
        v-if="displayNewsList.length > 0"
        class="news-list-block__grid"
        :style="{
          gridTemplateColumns: `repeat(${props.columns || 2}, 1fr)`,
        }"
      >
        <div v-for="news in displayNewsList" :key="news.id" class="news-card">
          <h4>{{ news.title }}</h4>
          <p v-if="props.showDate" class="news-date">{{ news.date }}</p>
        </div>
      </div>

      <div v-if="loading" class="news-list-block__loading">Загрузка новостей...</div>

      <div v-if="error" class="news-list-block__error">Ошибка загрузки: {{ error }}</div>

      <div
        v-if="!loading && !error && !displayFeaturedNews && displayNewsList.length === 0"
        class="news-list-block__empty"
      >
        Новости не выбраны. Настройте блок в редакторе.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface INews {
  id: number
  name: string
  title: string
  date: string
}

function normalizeNewsId(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = Number((value as { id: unknown }).id)
    return Number.isNaN(id) ? null : id
  }

  const id = Number(value)
  return Number.isNaN(id) ? null : id
}

function normalizeNewsIds(values: unknown): number[] {
  if (!Array.isArray(values)) {
    return []
  }

  return values.map(normalizeNewsId).filter((id): id is number => id !== null)
}

interface IProps {
  title?: string
  featuredNewsId?: unknown
  newsIds?: unknown
  /** Денормализованные данные с сервера (SSR), только для чтения */
  featuredNews?: INews | null
  newsItems?: INews[]
  showDate?: boolean
  columns?: string
  backgroundColor?: string
  textColor?: string
}

const props = withDefaults(defineProps<IProps>(), {
  title: 'Последние новости',
  featuredNewsId: null,
  newsIds: () => [],
  showDate: true,
  columns: '2',
  backgroundColor: '#f8f9fa',
  textColor: '#333333',
})

const loading = ref(false)
const error = ref<string | null>(null)
const fetchedFeaturedNews = ref<INews | null>(null)
const fetchedNewsList = ref<INews[]>([])

const hasServerNewsItems = computed(
  () => Array.isArray(props.newsItems) && props.newsItems.length > 0
)

const newsIdsValue = computed(() => normalizeNewsIds(props.newsIds))
const featuredNewsIdValue = computed(() => normalizeNewsId(props.featuredNewsId))

const displayFeaturedNews = computed(() => {
  if (props.featuredNews) {
    return props.featuredNews
  }

  if (featuredNewsIdValue.value && hasServerNewsItems.value) {
    return (
      props.newsItems!.find(item => item.id === featuredNewsIdValue.value) ?? null
    )
  }

  return fetchedFeaturedNews.value
})

const displayNewsList = computed(() =>
  hasServerNewsItems.value ? props.newsItems! : fetchedNewsList.value
)

async function loadNewsData(): Promise<void> {
  if (props.featuredNews) {
    fetchedFeaturedNews.value = null
  }

  if (hasServerNewsItems.value) {
    fetchedNewsList.value = []
    if (props.featuredNews || !featuredNewsIdValue.value) {
      return
    }
  }

  if (
    !featuredNewsIdValue.value &&
    (!newsIdsValue.value || newsIdsValue.value.length === 0)
  ) {
    fetchedFeaturedNews.value = null
    fetchedNewsList.value = []
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await fetch('/api/news?limit=100')

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const allNews: INews[] = data.data || []

    if (featuredNewsIdValue.value) {
      fetchedFeaturedNews.value =
        allNews.find(item => item.id === featuredNewsIdValue.value) ?? null
    } else {
      fetchedFeaturedNews.value = null
    }

    if (newsIdsValue.value.length > 0) {
      fetchedNewsList.value = allNews.filter(item => newsIdsValue.value.includes(item.id))
    } else {
      fetchedNewsList.value = []
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
    console.error('Ошибка загрузки новостей:', err)
  } finally {
    loading.value = false
  }
}

watch(
  [newsIdsValue, featuredNewsIdValue, () => props.newsItems, () => props.featuredNews],
  () => {
    void loadNewsData()
  },
  { deep: true, immediate: true }
)
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
  transition:
    transform 0.2s,
    box-shadow 0.2s;
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
