# BlockBuilder — Next.js SSR Example

Пример интеграции `@mushket-co/block-builder/react` в Next.js App Router с SSR.

## Что нужно для работы в Next.js

| Шаг | Описание |
|-----|----------|
| `transpilePackages` | `next.config.ts` — transpile `@mushket-co/block-builder` |
| Алиасы | На `src/react.ts` и `dist/` для локальной разработки (как в `react`/`nuxt4`) |
| Client boundary | `BlockBuilderEditor.tsx` с `'use client'` — редактор и формы |
| SSR страница | `app/page.tsx` (Server Component) читает `data/blocks.json` и вызывает `enrichBlocksForSsr` |
| API | Route Handlers `/api/blocks`, `/api/news`, `/api/articles`, `/api/upload` |
| Блоки | Переиспользуются из `examples/react19/src` через alias `@react-example` |

Логика enrich/serialize/strip — как в `examples/nuxt4/shared/utils/`.

## Установка

```bash
# Из корня block-builder
npm run build
npm install
```

Демо-блоки (опционально):

```bash
cp examples/nuxt4/data/blocks.json examples/next/data/blocks.json
```

## Запуск

```bash
# Из корня
npm run example:next

# Или из папки примера
cd examples/next
npm run dev
```

Приложение: `http://localhost:3008`

## Структура

```
next/
├── app/
│   ├── page.tsx                 # Server Component — SSR initialBlocks
│   ├── BlockBuilderEditor.tsx   # Client Component — BlockBuilder
│   ├── api/                     # Route Handlers
│   └── icons/[...path]/         # Статика из examples/static/icons
├── lib/
│   ├── enrichBlocks.ts          # SSR enrich для newsList
│   ├── serializeBlocks.ts
│   └── blocksFile.ts
├── data/blocks.json             # хранилище (gitignored)
└── next.config.ts
```
