<template>
  <div class="gallery-slider-block">
    <div class="container">
      <h2 v-if="title" class="gallery-title">
        {{ title }}
      </h2>

      <!-- ✅ НАСТОЯЩИЙ Vue Swiper компонент из npm пакета! -->
      <Swiper
      :modules="modules"
      :slides-per-view="2"
      :space-between="spaceBetweenValue"
      :loop="loopValue"
      :autoplay="autoplayConfig"
      :pagination="{ clickable: true, dynamicBullets: true }"
      :navigation="true"
      :effect="'slide'"
      :grab-cursor="true"
      class="gallery-swiper"
    >
      <SwiperSlide
        v-for="(slide, index) in slides"
        :key="index"
      >
        <div class="slide-content">
          <img :src="slide.url" :alt="slide.title" />
          <div class="slide-info">
            <h3>{{ slide.title }}</h3>
            <p>{{ slide.description }}</p>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

// Импорт стилей Swiper
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const props = defineProps({
  title: { type: String, default: 'Галерея изображений' },
  slides: {
    type: Array,
    default: () => [
      {
        url: '/2.jpg',
        title: 'Изображение 1',
        description: 'Описание первого изображения'
      },
      {
        url: '/spanch.jpg',
        title: 'Изображение 2',
        description: 'Описание второго изображения'
      },
      {
        url: '/bear.jpg',
        title: 'Изображение 3',
        description: 'Описание третьего изображения'
      },
      {
        url: '/3.png',
        title: 'Изображение 4',
        description: 'Описание четвёртого изображения'
      }
    ]
  },
  autoplay: { type: [Boolean, String], default: true },
  autoplayDelay: { type: [Number, String], default: 3000 },
  loop: { type: [Boolean, String], default: true },
  spaceBetween: { type: [Number, String], default: 30 }
})

// Модули Swiper
const modules = [Navigation, Pagination, Autoplay]

const autoplayValue = computed(() => {
  if (typeof props.autoplay === 'string') {
    return props.autoplay === 'on' || props.autoplay === 'true'
  }
  return props.autoplay
})

const autoplayDelayValue = computed(() => {
  return typeof props.autoplayDelay === 'string'
    ? parseInt(props.autoplayDelay, 10)
    : props.autoplayDelay
})

const loopValue = computed(() => {
  if (typeof props.loop === 'string') {
    return props.loop === 'on' || props.loop === 'true'
  }
  return props.loop
})

const spaceBetweenValue = computed(() => {
  return typeof props.spaceBetween === 'string'
    ? parseInt(props.spaceBetween, 10)
    : props.spaceBetween
})

const autoplayConfig = computed(() => {
  return autoplayValue.value ? {
    delay: autoplayDelayValue.value,
    disableOnInteraction: false
  } : false
})
</script>

<style scoped>
.gallery-slider-block {
  background: #f8f9fa;
  border-radius: 8px;
}

.gallery-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.gallery-swiper {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.slide-content {
  position: relative;
  background: white;
  height: 100%;
}

.slide-content img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
}

.slide-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  padding: 30px 20px 20px;
  color: white;
}

.slide-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.slide-info p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

/* Кастомные стили для навигации Swiper */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: white;
  background: rgba(0, 0, 0, 0.3);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

:deep(.swiper-button-next):hover,
:deep(.swiper-button-prev):hover {
  background: rgba(0, 0, 0, 0.6);
  transform: scale(1.1);
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 16px;
  font-weight: bold;
}

:deep(.swiper-pagination-bullet) {
  background: white;
  opacity: 0.7;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background: #667eea;
}
</style>

