# BlockBuilder — руководство для разработчиков

Документ для тех, кто разрабатывает и поддерживает пакет `@mushket-co/block-builder`.
Пользовательская документация — в [DOCS.md](./DOCS.md), краткий обзор — в [README.md](./README.md). Этот файл — для разработки самого пакета.

---

## Содержание

1. [Требования и установка](#требования-и-установка)
2. [Структура репозитория](#структура-репозитория)
3. [Архитектура](#архитектура)
4. [Локальная разработка](#локальная-разработка)
5. [Сборка и публикация](#сборка-и-публикация)
6. [Качество кода](#качество-кода)
7. [Тестирование](#тестирование)
8. [Как добавить тесты для новой фичи](#как-добавить-тесты-для-новой-фичи)
9. [CI/CD](#cicd)
10. [Соглашения](#соглашения)
11. [Частые вопросы](#частые-вопросы)

---

## Требования и установка

- **Node.js** 18.x или 20.x (CI гоняет обе версии)
- **npm** (workspaces)

```bash
git clone <repo>
cd block-builder
npm install
```

Workspaces подтягивают примеры из `examples/*`. Для установки только примеров:

```bash
npm run examples:install
```

---

## Структура репозитория

```
block-builder/
├── src/                          # Исходники пакета
│   ├── core/                     # Домен: entities, use-cases, ports, types
│   ├── infrastructure/           # HTTP, repositories, registries
│   ├── shared/                   # Общий presentation-слой (icons, styles, services)
│   ├── vue/                      # Vue UI (components, composables)
│   ├── react/                    # React UI (hooks, components, types)
│   ├── utils/                    # Валидация, helpers, constants
│   ├── BlockBuilderFacade.ts     # Core API фасад
│   ├── BlockBuilderFactory.ts
│   ├── index.ts                  # Re-export core (npm main)
│   ├── styles-bundle.ts          # SCSS → dist/index.esm.css
│   ├── react.ts                  # React entry
│   └── vue.ts                    # Vue3 entry
├── dist/                         # Сборка (не в git, генерируется npm run build)
├── examples/                     # Demo-приложения (workspaces)
│   ├── shared/                   # Общий код examples (blockStorage.js)
│   ├── vue3/                     # Vue3 + Vite (E2E порт 3001)
│   ├── react/                    # React + Vite (порт 3004)
│   ├── next/                     # Next.js App Router SSR (порт 3008)
│   ├── nuxt3/                    # Nuxt 3 SSR (порт 3006)
│   ├── nuxt4/                    # Nuxt 4 SSR (порт 3007)
│   ├── vue3-core-api/
│   └── api-usage/
├── tests/
│   ├── component/                # Vitest: vue/ + react/, helpers/, setup.ts
│   ├── e2e/                      # Playwright
│   └── fixtures/                 # Общие fixtures (E2E labels, component configs)
├── scripts/
│   └── measure-package-size.mjs
├── .github/workflows/            # CI, publish
├── jest.config.js
├── vitest.config.ts
└── playwright.config.ts
```

### Где что лежит в `src/`

| Слой | Путь | Назначение |
|------|------|------------|
| Core | `src/core/` | Бизнес-логика без UI |
| Infrastructure | `src/infrastructure/` | Реализации портов (memory repo, fetch) |
| Shared UI | `src/shared/` | Icons, SCSS, `ValidationErrorHandler`, `BlockScrollService`, `NotificationService` |
| Vue UI | `src/vue/components/`, `src/vue/composables/` | Vue-компоненты форм и BlockBuilder |
| React UI | `src/react/components/`, `src/react/hooks/` | React-компоненты (зеркало Vue); peer: React 18+ / 19 |
| Scroll / layout | `src/shared/services/BlockScrollService.ts`, `src/utils/scheduling.ts`, `src/utils/scrollHelpers.ts` | Скролл к блоку, rAF, restore scroll |
| Form errors | `src/utils/formErrorHelpers.ts` | Parse/find/scroll к ошибкам (не scroll блоков) |
| Public API | `BlockBuilderFacade`, `vue.ts`, `react.ts`, `index.ts` | Точки входа npm-пакета |

---

## Архитектура

Проект следует **Clean Architecture**:

```
UI (vue / react → shared)
        ↓
Use Cases (BlockManagement, ApiSelect, …)
        ↓
Entities + Ports
        ↓
Infrastructure (MemoryBlockRepository, FetchHttpClient, …)
```

- **Vue3** — основной путь развития: `BlockBuilder.vue`, composables, field components.
- **React** — зеркало Vue API; peer `^18.0.0 || ^19.0.0`. Примеры: `examples/react19` (19, :3004), `examples/react18` (18, :3005).
- **Core API** — `@mushket-co/block-builder/core` (и корневой `.`) без UI пакета.

---

## Локальная разработка

### Сборка пакета в watch-режиме + dev-server

```bash
npm run dev
```

### Примеры (рекомендуется при работе над UI)

```bash
npm run example:vue3       # Vue3 (:3001)
npm run example:react19   # React 19 (:3004)
npm run example:react18   # React 18 (:3005)
npm run example:nuxt3      # Nuxt 3 SSR (:3006)
npm run example:nuxt4      # Nuxt 4 SSR (:3007)
npm run example:next       # Next.js SSR (:3008)
npm run example:api-usage  # Core API (:3003)
npm run example:vue3-core-api
```

Конфиги блоков для примеров:

- `examples/vue3/src/block-config.js`
- `examples/react19/src/block-config.js`
- `examples/nuxt3/block-config.js`
- `examples/nuxt4/app/block-config.js`

E2E-тесты используют **собранные preview** этих примеров, а не synthetic fixtures.

### Полезные команды

| Команда | Описание |
|---------|----------|
| `npm run build` | Production-сборка в `dist/` |
| `npm run dev:build` | Rollup watch |
| `npm run type-check` | `tsc --noEmit` (запускается перед `npm test`) |
| `npm run lint` | ESLint по `src/` |
| `npm run lint:fix` | ESLint с автофиксом |
| `npm run format` | Prettier |
| `npm run clean` | Удалить `dist/` |

---

## Сборка и публикация

```bash
npm run build
npm run type-check
npm run test:ci:full
```

Публикация на npm — через workflow `.github/workflows/publish.yml` (release / manual dispatch). Перед publish в CI выполняется полный набор тестов + Playwright.

---

## Качество кода

### TypeScript

Строгая проверка типов: `npm run type-check`. Хук `pretest` запускает type-check перед Jest.

### ESLint

```bash
npm run lint
```

В CI lint с `continue-on-error: true` — не блокирует merge, но предупреждения стоит исправлять.

### Замер размера пакета

```bash
npm run size
```

Собирает `dist` и выводит реальный вес конструктора по слоям (core / vue / react / CSS) в raw / gzip / brotli через `scripts/measure-package-size.mjs`. Информационный отчёт, не блокирует CI.

---

## Тестирование

### Три слоя

```
┌─────────────────────────────────────────┐
│  E2E (Playwright)     tests/e2e/        │  Сквозные сценарии в browser
├─────────────────────────────────────────┤
│  Component (Vitest)   tests/component/  │  vue/ + react/ UI flows
├─────────────────────────────────────────┤
│  Unit (Jest)          src/**/__tests__/ │  Логика, renderers, use cases
└─────────────────────────────────────────┘
```

| Слой | Tool | Каталог | Что покрывает |
|------|------|---------|---------------|
| Unit | Jest + jsdom | `src/**/__tests__/` | Use cases, validators, facade |
| Component | Vitest + happy-dom | `tests/component/vue/`, `tests/component/react/` | Vue (`mountBlockBuilder`) и React (`renderBlockBuilder`) |
| E2E | Playwright | `tests/e2e/specs/` | vue3 :3001, react :3004 |

**Важно:** Jest **не** запускает `tests/component` и `tests/e2e`. Vue-файлы (`.vue`) в Jest coverage часто **0%** — это нормально, их покрывают Vitest и Playwright.

### Команды

```bash
# Unit (Jest)
npm test
npm run test:watch
npm run test:coverage          # таблица coverage в консоли
npm run test:ci                # CI: coverage + пороги

# Один файл Jest
npx jest src/utils/__tests__/universalValidation.test.ts

# Component (Vitest)
npm run test:component
npm run test:component:watch
npm run test:component -- tests/component/vue/BlockBuilder/create-text-block.spec.ts
npm run test:component -- tests/component/react

# E2E (Playwright)
npm run test:e2e
npm run test:e2e:ui              # интерактивный UI
npx playwright test vue3/smoke.spec.ts
npx playwright show-report

# Всё (как в CI перед релизом)
npm run test:ci:full             # alias: npm run test:all
```

Первый запуск E2E: `npx playwright install chromium`

Preview-серверы для E2E (если нужно вручную):

```bash
npm run e2e:preview:vue3         # http://localhost:3001
npm run e2e:preview:react        # http://localhost:3004
```

### Coverage (Jest) — как читать вывод

После `npm run test:ci` в конце печатается **таблица покрытия**, не список упавших тестов.

- **`Tests: N passed`** — тесты прошли.
- **Низкий `%` в таблице** — код не вызывался в Jest, **не** означает баг.
- Пороги в `jest.config.js`: lines/statements ≥ 27%, branches ≥ 22%, functions ≥ 30%.

### E2E — нумерация сценариев

| ID | Файл / тема |
|----|-------------|
| E01 | `smoke.spec.ts` — приложение открывается |
| E02 | `block-crud.spec.ts` — create / edit / duplicate / delete |
| E03 | `form-controls.spec.ts` — toggle, repeater |
| E04 | `nested-repeater.spec.ts` — вложенные репитеры |
| E05 | `validation-ux.spec.ts` — accordion при ошибках валидации |

Новая группа → `E06-...spec.ts` в `vue3/` и `react/`.

### Fixtures

| Файл | Назначение |
|------|------------|
| `tests/fixtures/block-types.ts` | Labels блоков для E2E (`getBlockLabel('cardList', 'vue3')`) |
| `tests/fixtures/minimal-block-configs.ts` | Synthetic block types для **component**-тестов |
| `tests/e2e/fixtures/index.ts` | Playwright fixture `blockForm` (page object) |
| `scripts/start-e2e-previews.mjs` | Сборка `dist/` + preview vue3/react для Playwright |

### Page objects (E2E)

- `tests/e2e/page-objects/BlockBuilderPage.ts` — навигация, выбор типа блока
- `tests/e2e/page-objects/BlockFormPage.ts` — поля формы, repeater, submit

Расширяйте page objects, **не** дублируйте селекторы в каждом spec.

### Селекторы в тестах

- Используем **BEM-классы** пакета: `.bb-add-block-btn`, `.bb-repeater-control__item`, `.bb-modal-footer`.
- Vue/React-поля: `#field-{fieldName}`.
- **`data-testid` в пакете не добавляем** — только существующие классы и атрибуты.

### Component-тесты — паттерн

```typescript
import { flushPromises } from '@vue/test-utils';
import { mountBlockBuilder, linkBlockType } from '../helpers/mountBlockBuilder';

const wrapper = mountBlockBuilder({ blockTypes: [linkBlockType] });
await wrapper.find('.bb-add-block-btn').trigger('click');
await flushPromises();
// ...
wrapper.unmount();
```

После каждого `trigger('click')` — `await flushPromises()`.
Для validation UX с таймерами — `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync(...)`.

---

## Как добавить тесты для новой фичи

Идите **снизу вверх**: unit → component → E2E (1–2 happy path).

### Custom field

| Шаг | Где | Что |
|-----|-----|-----|
| 1 | `src/__tests__/CustomFields.integration.test.ts` | Регистрация через Facade + блок с `type: 'custom'` |
| 2 | `tests/fixtures/minimal-block-configs.ts` | Synthetic block type |
| 3 | `tests/component/vue/` + `tests/component/react/` | Component-тесты |
| 4 | `examples/vue3/src/block-config.js` | Блок для E2E |
| 5 | `tests/e2e/specs/vue3/` + `react/` | Сквозной сценарий |

### Api-select

| Шаг | Где | Что |
|-----|-----|-----|
| 1 | `src/core/use-cases/__tests__/ApiSelectUseCase.test.ts` | Логика fetch/validate |
| 2 | `src/utils/__tests__/apiSelectSearchDebounce.test.ts` | Debounce поиска (`debounceMs`) |
| 3 | `tests/component/vue/` + `tests/component/react/` | ApiSelectField / BlockBuilder flow |

**Реализации UI (держать в синхроне):**

| Слой | Файл |
|------|------|
| Vue | `src/vue/components/ApiSelectField.vue` |
| React | `src/react/components/ApiSelectField.tsx` |
| Core | `src/core/use-cases/ApiSelectUseCase.ts` |
| Debounce | `src/utils/apiSelectSearchDebounce.ts` |

**Поведение (с 1.3.1):**

- Закрытый дропдаун: `bb-api-select__value` (single + есть значение) или `bb-api-select__trigger-placeholder`
- Открытый дропдаун: только `bb-api-select__input` (поиск); при открытии/закрытии/выборе поиск очищается
- Инпут всегда в DOM, видимость через `bb-api-select__input--hidden` (нужен для фокуса при открытии)
- «Загрузить ещё» — только если API вернул `hasMore: true`
- Клавиши в поле поиска не всплывают до `CustomDropdown` (`@keydown.stop` / `onKeyDown` + `stopPropagation`)

**Конфиг поля (`apiSelectConfig`):**

```js
{
  url: '/api/news',
  debounceMs: 1500, // мс; 0 или не указано — без задержки
  limit: 20,
  minSearchLength: 0,
  multiple: false,
  placeholder: 'Начните вводить...',
}
```

**Подводные камни при правках:**

- React: в debounced-поиск передавать актуальную строку в `fetchData(..., query)`, не читать `searchQuery` из замыкания
- React/Vue: после `clear` / `onValueUpdate` обновлять ref актуального значения до завершения `fetchData`, иначе `hydrateSelectedItemsFromValue` восстановит старый label из пропа
- Не вешать отдельный `@click` open на поле поверх `CustomDropdown` — сработает и `handleTriggerClick` (toggle), дропдаун мгновенно закроется

### Валидация / dependsOn / repeater

| Шаг | Где |
|-----|-----|
| Unit | `src/utils/__tests__/universalValidation.test.ts` |
| Vue UX | `tests/component/vue/BlockBuilder/depends-on-validation.spec.ts` |
| React UX | `tests/component/react/BlockBuilder/` |
| Scroll / accordion | `ValidationErrorHandler.test.ts`, `formErrorHelpers.test.ts`, `BlockScrollService.test.ts`, `scrollHelpers.test.ts` |
| E2E | `validation-ux.spec.ts` |

### Unit-тест (Jest) — скелет

```typescript
// src/**/__tests__/MyFeature.test.ts
describe('MyFeature', () => {
  beforeEach(() => { /* DOM / mocks */ });
  afterEach(() => { document.body.innerHTML = ''; jest.clearAllMocks(); });

  test('does something', () => {
    expect(true).toBe(true);
  });
});
```

Jest подхватывает файлы: `**/__tests__/**/*.ts`, `**/*.test.ts`, `**/*.integration.test.ts`.

### E2E — скелет

```typescript
// tests/e2e/specs/vue3/my-feature.spec.ts
import { getBlockLabel } from '../../../fixtures/block-types';
import { expect, test } from '../../fixtures';

test('E06 my feature works', async ({ blockForm }) => {
  await blockForm.prepareCleanEditor();
  await blockForm.openBlockTypeSelection();
  await blockForm.selectBlockType(getBlockLabel('myBlock', 'vue3'));
  // ...
});
```

Дублируйте spec в `react/` с `getBlockLabel(..., 'react')`, если фича есть в обоих UI.

### Чеклист перед PR

- [ ] `npm run type-check`
- [ ] `npm run lint` (по возможности без новых warnings)
- [ ] `npm run test:ci:full`
- [ ] Новая фича в example (для E2E) + label в `block-types.ts`

---

## CI/CD

Workflow `.github/workflows/ci.yml`:

1. **test** (Node 18 + 20): type-check → lint → Jest → component (20.x) → build
2. **e2e**: Playwright chromium → `npm run test:e2e`

Publish: `.github/workflows/publish.yml` — `test:ci:full` + Playwright install.

---

## Соглашения

### Коммиты

Следуйте стилю репозитория. CHANGELOG обновляется при релизах.

### Стили и CSS-классы

- SCSS: `src/shared/styles/`, BEM-префикс `bb-`
- В коде пакета и тестах **не хардкодить** строки `bb-*` — только `CSS_CLASSES` из `src/utils/constants.ts`
- Новый класс → сначала ключ в `CSS_CLASSES`, затем использование в компоненте/рендерере
- Фиксированная панель управления: `getControlsFixedClass()` (не собирать `bb-controls--fixed` вручную)

### Видимость блоков и core API (с 1.3.0+)

- **Edit** (`isEdit: true`): скрытые блоки (`visible: false`) остаются в DOM с `CSS_CLASSES.OPACITY_HIDDEN`
- **View**: скрытые блоки не рендерятся — `filterBlocksForDisplay(blocks, isEdit)` из `@mushket-co/block-builder/core`
- Пример кастомного UI: `examples/vue3-core-api`

### Предупреждение при уходе со страницы (с 1.3.1)

- Опция `warnOnPageLeave` у Vue/React `BlockBuilder`
- Core: `haveBlocksChanged`, `attachPageLeaveWarning`, `createUnsavedChangesTracker`
- Кастомный UI: `usePageLeaveWarning` в `src/vue/composables/` и `src/react/hooks/`

### Api-select (с 1.3.1)

- Тип поля: `api-select`, конфиг: `apiSelectConfig` (`IApiSelectConfig` в `src/core/types/form.ts`)
- Стили: `src/shared/styles/components/_api-select-control.scss`, классы — `BB_API_SELECT_*` в `constants.ts`
- Поиск: **debounce** (не throttle) — `debounceMs`, default `0`
- Подробности UX и чеклист правок — в разделе [Api-select](#api-select) (тестирование)

### Тесты

- Имена spec: `*.test.ts` (Jest), `*.spec.ts` (Vitest / Playwright)
- Component/E2E — на **английском** в describe/it (исторически); Jest в `src/` — часто на русском
- Не глотайте ошибки в page objects через `.catch(() => undefined)` без комментария — в Playwright report будет красный крестик на шаге

### Vue vs React (E2E)

| Аспект | Vue3 | React |
|--------|------|-------|
| Entry | `src/vue.ts` | `src/react.ts` |
| E2E project | `vue3` (port 3001) | `react` (port 3004) |
| Селекторы полей | `#field-*` | `#field-*` |

---

## Частые вопросы

### Тесты зелёные, но в Jest много «красных» процентов в таблице

Это **coverage**, не failures. Смотрите строку `Tests: N passed, N total`.

### Красный крестик в Playwright report, но тест passed

Упал **отдельный шаг** (часто `waitFor` с таймаутом), ошибку перехватили. Исправьте page object — не ждите элементы, которых нет на этой форме.

### `npm test` долго / падает на type-check

`pretest` запускает `tsc --noEmit`. Исправьте ошибки типов или запустите `npx jest` напрямую (без pretest) только для локальной отладки.

### E2E не находит блок по label

Проверьте `title` в `examples/*/src/block-config.js` и запись в `tests/fixtures/block-types.ts` — строки должны совпадать.

### Как дебажить E2E

```bash
npm run test:e2e:ui
# или
npx playwright test vue3/block-crud.spec.ts --debug
```

### Где смотреть HTML coverage

После `npm run test:coverage` — `coverage/lcov-report/index.html`.

---

## Связанные файлы конфигурации

| Файл | Назначение |
|------|------------|
| `jest.config.js` | Jest roots, coverage thresholds |
| `jest.setup.js` | Global setup Jest |
| `vitest.config.ts` | Component tests, happy-dom, Vue plugin |
| `playwright.config.ts` | Projects vue3/react, webServer |
| `rollup.config.cjs` | Production build |
| `rollup.dev.cjs` | Dev watch build |
| `tsconfig.json` | TypeScript |

---

**Вопросы по разработке** — GitHub Issues или внутренняя команда.
**Документация для пользователей API** — [DOCS.md](./DOCS.md), [examples/README.md](./examples/README.md).
