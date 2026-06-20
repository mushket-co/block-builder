<template>
  <div class="text-block">
    <div class="container" :style="blockStyle">
      <p class="text-block__content">{{ content }}</p>

      <div v-if="topicLabels.length" class="text-block__media">
        <p class="text-block__media-label">Темы (select, multiple)</p>
        <div class="text-block__topics">
          <span
            v-for="label in topicLabels"
            :key="label"
            class="text-block__topic"
          >
            {{ label }}
          </span>
        </div>
      </div>

      <div v-if="imageUrl" class="text-block__media">
        <p class="text-block__media-label">Изображение</p>
        <img :src="imageUrl" alt="" class="text-block__image" />
      </div>

      <div v-if="imageUrls.length" class="text-block__media">
        <p class="text-block__media-label">Изображения</p>
        <div class="text-block__gallery">
          <img
            v-for="(url, index) in imageUrls"
            :key="`image-${index}`"
            :src="url"
            alt=""
            class="text-block__image"
          />
        </div>
      </div>

      <div v-if="fileUrl" class="text-block__media">
        <p class="text-block__media-label">Файл</p>
        <a
          :href="fileUrl"
          class="text-block__file-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Скачать файл
        </a>
      </div>

      <div v-if="fileUrls.length" class="text-block__media">
        <p class="text-block__media-label">Файлы</p>
        <ul class="text-block__file-list">
          <li v-for="(url, index) in fileUrls" :key="`file-${index}`">
            <a
              :href="url"
              class="text-block__file-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Файл {{ index + 1 }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const TOPIC_LABELS = {
  dev: 'Разработка',
  design: 'Дизайн',
  marketing: 'Маркетинг',
  analytics: 'Аналитика'
}

function resolveUploadUrl(value) {
  if (!value) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'object') {
    return value.src || value.url || ''
  }
  return ''
}

function resolveUploadUrls(value) {
  if (Array.isArray(value)) {
    return value.map(resolveUploadUrl).filter(Boolean)
  }
  const single = resolveUploadUrl(value)
  return single ? [single] : []
}

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  fontSize: {
    type: Number,
    default: 16
  },
  color: {
    type: String,
    default: '#333333'
  },
  textAlign: {
    type: String,
    default: 'left'
  },
  image: {
    type: [String, Object],
    default: ''
  },
  images: {
    type: Array,
    default: () => []
  },
  file: {
    type: [String, Object],
    default: ''
  },
  files: {
    type: Array,
    default: () => []
  },
  topics: {
    type: Array,
    default: () => []
  }
})

const blockStyle = computed(() => ({
  textAlign: props.textAlign,
  fontSize: `${props.fontSize}px`,
  color: props.color,
  padding: '10px',
  border: '1px solid #e9ecef',
  borderRadius: '4px',
  background: '#f8f9fa'
}))

const imageUrl = computed(() => resolveUploadUrl(props.image))
const imageUrls = computed(() => resolveUploadUrls(props.images))
const fileUrl = computed(() => resolveUploadUrl(props.file))
const fileUrls = computed(() => resolveUploadUrls(props.files))
const topicLabels = computed(() => {
  if (!Array.isArray(props.topics)) {
    return []
  }

  return props.topics.map(value => TOPIC_LABELS[value] || value).filter(Boolean)
})
</script>

<style scoped>
.text-block {
  transition: all 0.2s ease;
}

.text-block:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.text-block__content {
  margin: 0 0 12px;
}

.text-block__media {
  margin-top: 16px;
  text-align: left;
}

.text-block__media-label {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #6c757d;
}

.text-block__image {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.text-block__gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.text-block__gallery .text-block__image {
  width: 120px;
  height: 120px;
  object-fit: cover;
}

.text-block__file-list {
  margin: 0;
  padding-left: 18px;
}

.text-block__file-link {
  color: var(--bb-color-primary);
  font-size: 14px;
}

.text-block__topics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.text-block__topic {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: #e7f1ff;
  color: #0b5ed7;
  font-size: 13px;
}
</style>
