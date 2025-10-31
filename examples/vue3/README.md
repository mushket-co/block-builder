# BlockBuilder - Vue3 + Vite Example

Полноценный пример использования BlockBuilder с Vue3 и Vite сборкой.

## ✅ Преимущества этого примера

1. **Настоящие Vue SFC компоненты** - `.vue` файлы вместо inline templates
2. **Настоящий Swiper из npm** - Vue компонент Swiper вместо CDN импорта
3. **Полноценная сборка Vite** - все возможности современного тулинга
4. **Hot Module Replacement** - мгновенное обновление при разработке
5. **TypeScript поддержка** - при необходимости
6. **Оптимизированная продакшн сборка** - tree-shaking, минификация и т.д.

## Установка

```bash
# Из корня проекта
npm install

# Или только для этого примера
cd examples/vue3-app
npm install
```

## Запуск

```bash
# Из корня проекта
npm run example:vue3

# Или из директории примера
cd examples/vue3-app
npm run dev
```

Приложение откроется на `http://localhost:3000`

## Структура

```
vue3-app/
├── src/
│   ├── components/           # Vue SFC компоненты блоков
│   │   ├── TextBlock.vue
│   │   ├── ImageBlock.vue
│   │   ├── ButtonBlock.vue
│   │   ├── HeroBlock.vue
│   │   ├── CardListBlock.vue
│   │   └── GallerySliderBlock.vue  # ✅ С настоящим Swiper!
│   ├── block-config.js       # Конфигурация блоков
│   ├── App.vue               # Главный компонент
│   ├── main.js               # Точка входа
│   └── style.css             # Глобальные стили
├── public/
│   └── static-files/         # Статические файлы (изображения)
├── index.html
├── vite.config.js
└── package.json
```

## Особенности

### GallerySliderBlock - Настоящий Swiper

Этот компонент демонстрирует главное преимущество полноценной сборки:

```vue
<template>
  <Swiper
    :modules="modules"
    :slides-per-view="2"
    :navigation="true"
    :pagination="{ clickable: true }"
  >
    <SwiperSlide v-for="slide in slides" :key="slide.id">
      <!-- ... -->
    </SwiperSlide>
  </Swiper>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
</script>
```

В CDN версии это невозможно из-за конфликтов между глобальным Vue и ESM импортами!

## Сборка для продакшн

```bash
npm run build
npm run preview
```

## Как это работает

1. BlockBuilder импортируется из локального пакета (`file:../..`)
2. Компоненты блоков - настоящие `.vue` файлы
3. Vite собирает всё вместе
4. HMR обновляет изменения на лету

## Разница с CDN версией

| Функция | CDN версия | Vite версия |
|---------|------------|-------------|
| Vue компоненты | Inline templates | SFC (.vue файлы) |
| Swiper | Императивный API | Vue компоненты |
| Сборка | Нет | Vite |
| HMR | Нет | Да |
| Tree-shaking | Нет | Да |
| Типизация | Нет | Опциональная |
| npm пакеты | Ограничено | Любые |

## Примечания

- Этот пример не попадает в npm публикацию пакета (настроено через `files` в корневом `package.json`)
- Используется для локальной разработки и демонстрации возможностей
- Показывает реальное использование в production приложениях

