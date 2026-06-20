# BlockBuilder - Блочный конструктор с чистой архитектурой

Библиотека для создания блочных конструкторов с правильной чистой архитектурой. Позволяет создавать и редактировать блоки контента через удобный UI с формами, валидацией и модальными окнами.

## Что это?

BlockBuilder — это npm пакет для создания блочных конструкторов в вашем приложении. Пакет предоставляет:

- Готовый UI для создания и редактирования блоков
- Автоматическую генерацию форм на основе конфигурации
- Валидацию полей
- Поддержку Vue3 компонентов и Pure JavaScript
- Чистую архитектуру (Clean Architecture)
- Кастомные типы полей
- API для программной работы с блоками


## Поддержка версий

BlockBuilder поставляется одним npm-пакетом с тремя UI-слоями:

- ✅ **Vue 3** — полная поддержка, все новые функции UI
- ✅ **Nuxt 3 / Nuxt 4** — полная поддержка с SSR (с версии **1.2.0**)
- ✅ **React 19+** — полная поддержка, все новые функции UI
- ✅ **Next.js** — SSR (требуется **React 19+**)
- ✅ **Pure JS** — полноценный UI без фреймворка; **новые фичи добавляются выборочно**, не все UI-возможности Vue/React переносятся в pure-js

### Что есть в Pure JS (актуально с 1.6.0)

Типы полей: `text`, `textarea`, `number`, `email`, `url`, `color`, `select` (в т.ч. `multiple: true`), `checkbox`, `radio`, `image`, `file`, `spacing`, `repeater`, `api-select`, `custom`, `block-anchor`.

Также: валидация, кастомные рендереры через `ControlManager`, multi-upload, SVG-иконки в контролах.

### Чего нет в Pure JS

| Функция | Vue | React | Pure JS |
|--------|-----|-------|---------|
| `matrix-table` | ✅ | ✅ | ❌ |
| `dependsOn` (условная видимость полей) | ✅ | ✅ | ❌ |
| `ToggleControl` (группа checkbox + зависимые поля) | ✅ | ✅ | ❌ |

Для `matrix-table` и `dependsOn` используйте Vue или React UI, либо реализуйте аналог через `type: 'custom'`.


## Документация

Вся подробная документация находится на официальном сайте:

** [block-builder-doc](https://block-builder-doc.vercel.app/)**

На сайте вы найдете:
- Полное описание API
- Примеры использования для Vue3, Nuxt (SSR) и Pure JS
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
