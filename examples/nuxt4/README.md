# BlockBuilder — Nuxt 4 Example

Пример интеграции `@mushket-co/block-builder` в Nuxt 4 с SSR.

## Что нужно для работы в Nuxt

| | Nuxt 3 (`examples/nuxt3`) | Nuxt 4 (`examples/nuxt4`) |
|---|---|---|
| Версия | `nuxt@^3.16` | `nuxt@^4.4` |
| Структура | `pages/`, `components/` в корне | `app/` + `shared/` + `server/` |
| Порт dev | 3006 | 3007 |
| Shared utils | `utils/` | `shared/utils/` (`#shared/...`) |

Логика интеграции с BlockBuilder та же: transpile, client plugin, `useAsyncData`, Nitro API, enrich для SSR.

## Установка

```bash
# Из корня block-builder
npm run build
npm install
```

При первом запуске можно скопировать демо-блоки:

```bash
cp examples/nuxt3/data/blocks.json examples/nuxt4/data/blocks.json
```

## Запуск

```bash
# Из корня
npm run example:nuxt4

# Или из папки примера
cd examples/nuxt4
npm run dev
```

Приложение: `http://localhost:3007`

Перед `dev` скрипт `scripts/ensure-port-free.mjs` завершает старый процесс на 3007 (Windows). Иначе Nuxt 4 при занятом порте уходит на 3000.

Если `Failed to resolve import "#app-manifest"`:

```bash
cd examples/nuxt4
npm run dev:clean
```

## Структура

```
nuxt4/
├── app/                        # srcDir (Nuxt 4 default)
│   ├── app.vue
│   ├── pages/index.vue
│   ├── components/blocks/
│   ├── composables/useBlockBuilder.ts
│   ├── plugins/block-builder.client.ts
│   ├── customFieldRenderers/
│   └── block-config.js
├── shared/utils/               # код для app + server
│   ├── serializeBlocks.ts
│   ├── stripEnrichedProps.ts
│   └── enrichNewsListClient.ts
├── server/api/                 # Nitro routes
├── data/blocks.json            # хранилище (gitignored)
└── nuxt.config.ts
```
