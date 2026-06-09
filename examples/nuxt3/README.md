# BlockBuilder — Nuxt 3 Example

Пример интеграции `@mushket-co/block-builder` в Nuxt 3.

## Что нужно для работы в Nuxt

1. **Транспиляция пакета** — entry `@mushket-co/block-builder/vue` отдаёт исходные `.ts` и `.vue`, поэтому в `nuxt.config` нужен `build.transpile: ['@mushket-co/block-builder']`.

2. **Стили** — подключить CSS в client-only плагине (`plugins/block-builder.client.ts`):
   ```ts
   import '@mushket-co/block-builder/index.css'
   ```

3. **Данные блоков для SSR** — загружайте на сервере (`useAsyncData` + API/БД), передавайте в `:initial-blocks`. Пакет рендерит контент блоков в HTML на сервере (и в `isEdit: true`, и в `isEdit: false`).

4. **Vite alias (для локальной разработки примера)** — как в `vue3`, алиасы на `src/vue.ts` и `dist/index.esm.css` из корня пакета. В production-проекте после `npm install` алиасы обычно не нужны.

5. **Загрузка файлов / api-select** — реализуйте Nitro routes (`server/api/upload.post.ts`, `server/api/news.get.ts` и т.д.) или проксируйте на бэкенд.

6. **Сохранение** — `POST /api/blocks` пишет в `data/blocks.json` (сериализация без Vue-компонентов и base64). `GET /api/blocks` читает тот же файл. В production — ваш бэкенд/БД.

Nuxt 4 совместим с этой схемой для базовой интеграции: те же шаги (transpile, client plugin, `ssr: false`). Отличия в основном в версиях зависимостей и `compatibilityDate` — пример ориентирован на Nuxt 3.

## Установка

```bash
# Из корня block-builder (собрать пакет и установить workspaces)
npm run build
npm install
```

## Запуск

Если в консоли `Failed to resolve import "#app-manifest"` — остановите dev-сервер и выполните:

```bash
cd examples/nuxt3
npm run dev:clean
```

```bash
# Из корня
npm run example:nuxt3

# Или из папки примера
cd examples/nuxt3
npm run dev
```

Приложение: `http://localhost:3006`

## Структура

```
nuxt3/
├── nuxt.config.ts          # transpile, vite alias, static icons
├── plugins/
│   └── block-builder.client.ts
├── composables/
│   └── useBlockBuilder.ts
├── pages/
│   └── index.vue           # ssr: false
├── components/blocks/      # Все блоки как в examples/vue3
├── customFieldRenderers/   # WYSIWYG (Jodit)
├── block-config.js         # Полная конфигурация блоков
└── server/api/             # mock upload и news API
```
