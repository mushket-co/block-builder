# BlockBuilder - Блочный конструктор с чистой архитектурой

Библиотека для создания блочных конструкторов с правильной чистой архитектурой. Позволяет создавать и редактировать блоки контента через удобный UI с формами, валидацией и модальными окнами.

## Что это?

BlockBuilder — это npm пакет для создания блочных конструкторов в вашем приложении. Пакет предоставляет:

- Готовый UI для Vue 3 и React 19+
- Автоматическую генерацию форм на основе конфигурации
- Валидацию полей
- Чистую архитектуру (Clean Architecture)
- Кастомные типы полей
- Core API для программной работы с блоками без готового UI


## Поддержка версий

BlockBuilder поставляется одним npm-пакетом с UI для фреймворков и отдельным Core API:

- ✅ **Vue 3** — полная поддержка, все новые функции UI
- ✅ **Nuxt 3 / Nuxt 4** — полная поддержка с SSR (с версии **1.2.0**)
- ✅ **React 19+** — полная поддержка, все новые функции UI
- ✅ **Next.js** — SSR (требуется **React 19+**)
- ✅ **Core API** (`@mushket-co/block-builder/core`) — программная работа с блоками без UI пакета

### Точки входа npm

| Импорт | Назначение |
|--------|------------|
| `@mushket-co/block-builder/vue` | Vue-компоненты и composables |
| `@mushket-co/block-builder/react` | React-компоненты и hooks |
| `@mushket-co/block-builder/core` | API, типы, use-cases, утилиты |
| `@mushket-co/block-builder` | Алиас Core API (без встроенного DOM UI) |
| `@mushket-co/block-builder/index.esm.css` | Стили для Vue/React UI |


## Документация

Вся подробная документация находится на официальном сайте:

** [block-builder-doc](https://block-builder-doc.vercel.app/)**

На сайте вы найдете:
- Полное описание API
- Примеры использования для Vue3, React, Nuxt и Next (SSR)
- Документацию по кастомным полям
- Примеры интеграции

## Ссылки

- ** Документация:** [block-builder-doc](https://block-builder-doc.vercel.app/)
- ** Живые примеры (demo):** [block-builder-demo](https://block-builder-demo.vercel.app/)
- ** npm:** [@mushket-co/block-builder](https://www.npmjs.com/package/@mushket-co/block-builder)
- ** GitHub:** [github.com/mushket-co/block-builder](https://github.com/mushket-co/block-builder)
- ** Issues:** [GitHub Issues](https://github.com/mushket-co/block-builder/issues)

## Лицензия

[MIT License](LICENSE)

---

**Автор:** Mushket & Co
