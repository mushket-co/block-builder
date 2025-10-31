# BlockBuilder - Vue3 + Vite Example

Полноценный пример использования BlockBuilder с Vue3 и Vite сборкой.

## ✅ Преимущества этого примера

1. **Настоящие Vue SFC компоненты** - `.vue` файлы вместо inline templates
2. **Полноценная сборка Vite** - все возможности современного тулинга
3. **Hot Module Replacement** - мгновенное обновление при разработке
4. **TypeScript поддержка** - при необходимости
5. **Оптимизированная продакшн сборка** - tree-shaking, минификация и т.д.

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
│   │   └── GallerySliderBlock.vue
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
| Сборка | Нет | Vite |
| HMR | Нет | Да |
| Tree-shaking | Нет | Да |
| Типизация | Нет | Опциональная |
| npm пакеты | Ограничено | Любые |

## Примечания

- Этот пример не попадает в npm публикацию пакета (настроено через `files` в корневом `package.json`)
- Используется для локальной разработки и демонстрации возможностей
- Показывает реальное использование в production приложениях

