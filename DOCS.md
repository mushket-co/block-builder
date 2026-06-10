# Документация BlockBuilder

Полное руководство по `@mushket-co/block-builder` **v1.3.1**. Краткий обзор — в [README.md](./README.md).

## Содержание

- [Быстрый старт](#быстрый-старт)
- [Основные концепции](#основные-концепции)
- [Точки входа](#точки-входа)
- [Core API](#core-api)
  - [Класс BlockBuilder](#класс-blockbuilder)
  - [Методы](#методы)
  - [Опции инициализации](#опции-инициализации)
  - [Типы](#типы)
  - [Поля форм](#поля-форм)
  - [Кастомные рендереры](#кастомные-рендереры)
  - [Утилиты](#утилиты)
- [Vue 3](#vue-3)
  - [Быстрый старт](#быстрый-старт-vue-3)
  - [BlockBuilderComponent](#blockbuildercomponent)
  - [События](#события)
  - [Core API в Vue](#core-api-в-vue)
- [React](#react)
  - [Быстрый старт](#быстрый-старт-react)
  - [BlockBuilderComponent](#blockbuildercomponent-react)
- [SSR и гидрация](#ssr-и-гидрация)
- [Интеграция с бэкендом](#интеграция-с-бэкендом)
- [Примеры](#примеры)

---

## Быстрый старт

### Установка

```bash
npm install @mushket-co/block-builder
```

Подключите стили (обязательно для готового UI):

```js
import '@mushket-co/block-builder/index.esm.css'
```

Peer-зависимости по стеку: `vue` ^3, `react`/`react-dom` ^18 || ^19 (опциональные).

### Минимальный пример (Pure JS)

```js
import '@mushket-co/block-builder/index.esm.css'
import { BlockBuilder } from '@mushket-co/block-builder'

const blockConfigs = {
  text: {
    title: 'Текст',
    fields: [
      {
        field: 'content',
        label: 'Содержимое',
        type: 'textarea',
        rules: [{ type: 'required', field: 'content', message: 'Обязательное поле' }],
      },
    ],
    render: { kind: 'html', template: '<div>{{content}}</div>' },
  },
}

const builder = new BlockBuilder({
  containerId: 'app',
  blockConfigs,
  onSave: async (blocks) => {
    console.log('saved', blocks)
    return true
  },
})
```

Для Vue/React используйте готовые компоненты — см. разделы ниже.

---

## Основные концепции

| Концепция | Описание |
|-----------|----------|
| **Тип блока** | Запись в `blockConfigs` / `availableBlockTypes`: поля формы, `render`, spacing |
| **Блок (instance)** | Экземпляр с `id`, `type`, `props`, `settings`, `render`, `visible`, `locked` |
| **BlockBuilder / BlockBuilderComponent** | Готовый UI: список блоков, формы, модалки, панель управления |
| **Core API** | Use cases и репозиторий — для полностью кастомного UI |
| **Field renderers** | Встроенные типы полей + кастомные через `ICustomFieldRenderer` |
| **onSave** | Колбэк сохранения; после успешного save сбрасывается baseline для `warnOnPageLeave` |

### Структура конфигурации типа блока

```js
{
  type: 'hero',           // ключ в blockConfigs или поле type в availableBlockTypes
  title: 'Hero-блок',
  label: 'Hero',          // для UI выбора типа
  icon: '/icons/hero.svg',
  description: 'Крупный заголовок с кнопкой',
  defaultProps: { title: 'Заголовок' },
  defaultSettings: {},
  spacingOptions: {
    enabled: true,
    spacingTypes: ['padding-top', 'padding-bottom', 'margin-top', 'margin-bottom'],
    config: {
      min: 0,
      max: 200,
      step: 4,
      breakpoints: [ /* кастомные брекпоинты, опционально */ ],
    },
  },
  fields: [ /* IFormFieldConfig[] */ ],
  render: {
    kind: 'component',    // 'component' | 'html'
    framework: 'vue',     // 'vue' | 'react' — для component
    component: HeroBlock, // Vue/React-компонент или имя для registry
  },
}
```

### Объект блока (`IBlock`)

```ts
{
  id: 'block-uuid',
  type: 'hero',
  props: { title: 'Привет', spacing: { desktop: { 'padding-top': 32 } } },
  settings: {},
  visible: true,
  locked: false,
  order: 0,
  render: { kind: 'component', framework: 'vue', component: HeroBlock },
  metadata: { createdAt: Date, updatedAt: Date, version: 1 },
}
```

---

## Точки входа

| Импорт | Содержимое |
|--------|------------|
| `@mushket-co/block-builder` | `BlockBuilder` (фасад Pure JS) + типы блоков и форм |
| `@mushket-co/block-builder/core` | Core без UI: типы, `BlockBuilder`, репозитории, валидатор, helpers |
| `@mushket-co/block-builder/vue` | `BlockBuilderComponent`, use cases, SSR-хелперы |
| `@mushket-co/block-builder/react` | `BlockBuilderComponent`, use cases, SSR-хелперы |
| `@mushket-co/block-builder/index.esm.css` | Стили редактора |

---

## Core API

### Класс BlockBuilder

Экспортируется как `BlockBuilder` из `@mushket-co/block-builder` и `@mushket-co/block-builder/core` (алиас `BlockBuilderFacade`).

```ts
import { BlockBuilder } from '@mushket-co/block-builder/core'

const builder = new BlockBuilder({
  containerId: 'editor',
  blockConfigs,
  autoInit: true,       // по умолчанию true
  initialBlocks: [],
  onSave: async (blocks) => true,
  isEdit: true,
  warnOnPageLeave: true,
})
```

При `autoInit: false` UI не монтируется автоматически — используйте Vue/React-компоненты или передайте `containerId` при создании.

### Методы

#### CRUD и управление блоками

| Метод | Описание |
|-------|----------|
| `createBlock(blockData)` | Создать блок |
| `getBlock(blockId)` | Получить блок по id |
| `getAllBlocks()` | Все блоки |
| `updateBlock(blockId, updates)` | Обновить блок |
| `deleteBlock(blockId)` | Удалить блок |
| `duplicateBlock(blockId)` | Дублировать |
| `reorderBlocks(blockIds)` | Изменить порядок |
| `setBlockLocked(blockId, locked)` | Заблокировать / разблокировать |
| `setBlockVisible(blockId, visible)` | Показать / скрыть |
| `getBlocksByType(type)` | Фильтр по типу |
| `getBlocksCount()` | Количество блоков |
| `clearAllBlocks()` | Очистить все |
| `exportBlocks()` | `JSON.stringify` всех блоков |
| `importBlocks(json)` | Импорт из JSON |

#### Компоненты (registry)

| Метод | Описание |
|-------|----------|
| `registerComponent(name, component)` | Зарегистрировать компонент |
| `getComponent(name)` | Получить компонент |
| `hasComponent(name)` | Проверить наличие |
| `unregisterComponent(name)` | Удалить |
| `getAllComponents()` | Все компоненты |
| `registerComponents(map)` | Пакетная регистрация |

#### Конфигурация типов

| Метод | Описание |
|-------|----------|
| `getBlockConfigs()` | Все конфиги |
| `getBlockConfig(type)` | Конфиг одного типа |
| `hasBlockType(type)` | Есть ли тип |
| `getAvailableBlockTypes()` | Список ключей типов |

#### Кастомные поля

| Метод | Описание |
|-------|----------|
| `registerCustomFieldRenderer(renderer)` | Зарегистрировать рендерер |
| `registerCustomFieldRenderers(renderers)` | Несколько рендереров |
| `getCustomFieldRenderer(id)` | Получить по id |
| `hasCustomFieldRenderer(id)` | Проверить |
| `unregisterCustomFieldRenderer(id)` | Удалить |
| `getAllCustomFieldRenderers()` | Все рендереры |

#### Режим редактирования

| Метод | Описание |
|-------|----------|
| `setIsEdit(isEdit)` | Переключить edit/view |
| `getIsEdit()` | Текущий режим |

В режиме просмотра (`isEdit: false`) скрытые блоки (`visible: false`) не попадают в DOM. В режиме редактирования они остаются с классом `bb-opacity-hidden`.

#### UI-методы (Pure JS, требуют инициализированный UI)

`showBlockTypeSelectionModal`, `showAddBlockForm`, `editBlock`, `toggleBlockLock`, `toggleBlockVisibility`, `deleteBlockUI`, `duplicateBlockUI`, `saveAllBlocksUI`, `moveBlockUp`, `moveBlockDown`, `closeModal`, `submitModal`, `destroy`.

### Опции инициализации

`IBlockBuilderOptions`:

| Опция | Тип | По умолчанию | Описание |
|-------|-----|--------------|----------|
| `containerId` | `string` | — | id DOM-элемента для Pure JS UI |
| `blockConfigs` | `Record<string, config>` | **обязательно** | Конфигурация типов блоков |
| `repository` | `IBlockRepository` | in-memory | Хранилище блоков |
| `componentRegistry` | `IComponentRegistry` | in-memory | Реестр компонентов |
| `httpClient` | `IHttpClient` | `FetchHttpClient` | HTTP для api-select |
| `customFieldRendererRegistry` | registry | in-memory | Кастомные поля |
| `autoInit` | `boolean` | `true` | Автоинициализация UI |
| `onSave` | `(blocks) => boolean \| Promise<boolean>` | — | Колбэк сохранения |
| `initialBlocks` | `IBlockDto[]` | — | Начальные блоки |
| `theme` | `'light' \| 'dark'` | `'light'` | Тема (readonly после создания) |
| `locale` | `string` | `'ru'` | Локаль (readonly) |
| `controlsContainerClass` | `string` | — | CSS-класс контейнера панели |
| `controlsFixedPosition` | `'top' \| 'bottom'` | — | Фиксированная панель |
| `controlsOffset` | `number` | — | Отступ панели, px |
| `controlsOffsetVar` | `string` | — | CSS-переменная для учёта шапки |
| `isEdit` | `boolean` | `true` | Режим редактирования |
| `warnOnPageLeave` | `boolean` | `false` | Предупреждение при уходе с несохранёнными блоками |

При `warnOnPageLeave: true` браузер показывает нативный диалог, если текущие блоки отличаются от последнего успешного `onSave`. Не срабатывает в режиме просмотра.

### Типы

Основные интерфейсы (экспорт из `/core`):

- **Блоки:** `IBlock`, `IBlockDto`, `ICreateBlockDto`, `IUpdateBlockDto`, `IBlockMetadata`, `TBlockId`
- **Формы:** `IFormFieldConfig`, `IFormGenerationConfig`, `TFieldType`, `IRepeaterFieldConfig`, `IRepeaterItemFieldConfig`
- **Api-select:** `IApiSelectConfig`, `IApiSelectItem`, `IApiSelectResponse`, `IApiRequestParams`, `THttpMethod`
- **Изображения:** `IImageUploadConfig`
- **Spacing:** `IBreakpoint`, `ISpacingFieldConfig`, `IBlockSpacingOptions`, `TSpacingType`
- **Валидация:** `IValidationRule`, `IValidationResult`, `TValidationRuleType`
- **Условные поля (Vue):** `IDependsOnConfig`
- **Кастомные поля:** `ICustomFieldRenderer`, `ICustomFieldContext`, `ICustomFieldRenderResult`, `ICustomFieldConfig`
- **Порты:** `IBlockRepository`, `IComponentRegistry`, `IHttpClient`

### Поля форм

Каждое поле — `IFormFieldConfig`:

```ts
{
  field: 'title',       // имя свойства в block.props
  label: 'Заголовок',
  type: 'text',
  placeholder: 'Введите заголовок',
  defaultValue: '',
  rules: [
    { type: 'required', field: 'title', message: 'Обязательное поле' },
    { type: 'maxLength', field: 'title', value: 100 },
  ],
}
```

В конфиге поля `field` в правилах можно опустить — подставляется из родительского `field`.

#### Стандартные типы (`TFieldType`)

| Тип | Описание |
|-----|----------|
| `text` | Однострочный текст |
| `textarea` | Многострочный текст |
| `number` | Число |
| `email` | Email с валидацией |
| `url` | URL с валидацией |
| `select` | Выпадающий список (`options`) |
| `checkbox` | Чекбокс |
| `radio` | Радио-группа (`options`) |
| `color` | Выбор цвета |
| `file` | Файл |
| `image` | Загрузка изображения (`imageUploadConfig`) |
| `spacing` | Отступы по брекпоинтам (`spacingConfig`) |
| `repeater` | Повторяющаяся группа (`repeaterConfig`) |
| `api-select` | Выбор из API (`apiSelectConfig`) |
| `custom` | Кастомный рендерер (`customFieldConfig.rendererId`) |

#### Spacing

Данные хранятся в `block.props.spacing`:

```js
{
  desktop: { 'padding-top': 32, 'margin-bottom': 16 },
  tablet: { 'padding-top': 24 },
  mobile: { 'padding-top': 16 },
}
```

Дефолтные брекпоинты: `desktop`, `tablet` (≤1199px), `mobile` (≤767px).

**Margin** применяется автоматически на обёртку `.bb-block`. **Padding** — через CSS-переменные на обёртке:

```css
.my-block {
  padding-top: var(--spacing-padding-top, 0);
  padding-bottom: var(--spacing-padding-bottom, 0);
}
/* Для tablet/mobile: --spacing-padding-top-tablet, --spacing-padding-top-mobile */
```

Кастомные брекпоинты задаются в `spacingOptions.config.breakpoints` типа блока.

#### Repeater

```js
{
  field: 'items',
  label: 'Элементы',
  type: 'repeater',
  repeaterConfig: {
    fields: [
      { field: 'title', label: 'Заголовок', type: 'text', rules: [{ type: 'required', field: 'title' }] },
      { field: 'price', label: 'Цена', type: 'number' },
    ],
    addButtonText: 'Добавить',
    removeButtonText: 'Удалить',
    min: 1,
    max: 10,
    maxNestingDepth: 2,  // вложенные репитеры
  },
}
```

#### Image

```js
{
  field: 'image',
  label: 'Изображение',
  type: 'image',
  imageUploadConfig: {
    uploadUrl: '/api/upload',
    fileParamName: 'file',
    maxFileSize: 5 * 1024 * 1024,
    accept: 'image/*',
    responseMapper: (res) => res.url,
  },
}
```

Без `uploadUrl` изображение сохраняется как base64 в `props`.

#### Api-select

```js
{
  field: 'articleId',
  label: 'Статья',
  type: 'api-select',
  apiSelectConfig: {
    url: '/api/articles',
    method: 'GET',
    searchParam: 'search',
    pageParam: 'page',
    limitParam: 'limit',
    limit: 20,
    debounceMs: 0,        // задержка поиска, мс (0 — сразу)
    placeholder: 'Найти статью...',
    responseMapper: (res) => ({
      data: res.items.map(i => ({ id: i.id, name: i.title })),
      hasMore: res.hasMore,
    }),
  },
}
```

Ответ API по умолчанию: `{ data: IApiSelectItem[], hasMore?: boolean }`. Кнопка «Загрузить ещё» показывается только при `hasMore: true`.

#### Условные поля (`dependsOn`) — только Vue 3

```js
{
  field: 'buttonUrl',
  label: 'Ссылка',
  type: 'url',
  dependsOn: { field: 'showButton', value: true, operator: 'equals' },
}
```

Операторы: `equals`, `notEquals`, `in`, `notIn`. Скрытые поля не валидируются. В Vue также доступен **ToggleControl** — переключаемая группа полей (checkbox + зависимые поля).

#### Правила валидации

Типы: `required`, `email`, `url`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `custom`.

```js
rules: [
  { type: 'required', field: 'email', message: 'Email обязателен' },
  { type: 'min', field: 'age', value: 18, message: 'Минимум 18 лет' },
  { type: 'pattern', field: 'phone', value: /^\+7/, message: 'Формат +7...' },
  { type: 'custom', field: 'code', validator: (v) => v === 'ABC' },
]
```

### Кастомные рендереры

Реализуйте `ICustomFieldRenderer`:

```ts
import type { ICustomFieldRenderer, ICustomFieldContext, ICustomFieldRenderResult } from '@mushket-co/block-builder/core'

export class WysiwygFieldRenderer implements ICustomFieldRenderer {
  readonly id = 'wysiwyg-editor'
  readonly name = 'WYSIWYG Editor'

  render(container: HTMLElement, context: ICustomFieldContext): ICustomFieldRenderResult {
    const editor = document.createElement('div')
    editor.innerHTML = String(context.value ?? '')
    container.appendChild(editor)

    return {
      element: editor,
      getValue: () => editor.innerHTML,
      setValue: (v) => { editor.innerHTML = String(v ?? '') },
      setError: (err) => { /* подсветка ошибки */ },
      destroy: () => editor.remove(),
    }
  }
}
```

**Pure JS** — регистрация через фасад:

```js
builder.registerCustomFieldRenderer(new WysiwygFieldRenderer())
```

**Vue / React** — через `CustomFieldRendererRegistry`:

```js
import { CustomFieldRendererRegistry } from '@mushket-co/block-builder/vue'

const registry = new CustomFieldRendererRegistry()
registry.register(new WysiwygFieldRenderer())
// передайте registry в BlockBuilderComponent
```

Использование в конфиге поля:

```js
{
  field: 'content',
  label: 'Содержимое',
  type: 'custom',
  customFieldConfig: {
    rendererId: 'wysiwyg-editor',
    options: { mode: 'default' },
  },
}
```

### Утилиты

Экспорт из `@mushket-co/block-builder/core`:

**Блоки:**
- `buildBlockHierarchy`, `cloneBlock`, `getAllChildren`, `isChildOf`
- `filterBlocksForDisplay(blocks, isEdit)` — фильтрация для режима просмотра

**Несохранённые изменения (1.3.1):**
- `haveBlocksChanged(current, baseline)`
- `attachPageLeaveWarning(options)`
- `createUnsavedChangesTracker(initialBlocks)`
- `shouldActivatePageLeaveWarning({ warnOnPageLeave, isEdit })`

**Spacing:**
- `DEFAULT_BREAKPOINTS`, `generateSpacingCSS`, `generateSpacingCSSVariables`
- `getSpacingValue`, `setSpacingValue`, `mergeSpacing`, `validateSpacing`

**Прочее:**
- `UniversalValidator` — валидация полей и репитеров
- `lockBodyScroll`, `unlockBodyScroll`, `setScrollLockHandlers`

**SSR** (экспорт из `/vue` и `/react`):
- `prepareBlocksForDisplay`, `enrichBlockForDisplay`
- `canRenderVueBlock`, `canRenderReactBlock`, `resolveVueComponentForBlock`, `resolveReactComponentForBlock`
- `seedRepositoryFromBlocks`
- `isClient`, `isServer`, `enableViewportBreakpointDetection`, `getDefaultBreakpoint`

---

## Vue 3

### Быстрый старт (Vue 3)

```vue
<template>
  <BlockBuilderComponent
    :config="{ availableBlockTypes }"
    :block-management-use-case="blockManagementUseCase"
    :api-select-use-case="apiSelectUseCase"
    :custom-field-renderer-registry="customFieldRendererRegistry"
    :initial-blocks="initialBlocks"
    :on-save="handleSave"
    :is-edit="isEdit"
    :warn-on-page-leave="true"
    controls-container-class="container"
    controls-fixed-position="bottom"
    :controls-offset="20"
    @block-added="onBlockAdded"
    @block-updated="onBlockUpdated"
    @block-deleted="onBlockDeleted"
  />
</template>

<script setup>
import '@mushket-co/block-builder/index.esm.css'
import { ref } from 'vue'
import {
  BlockBuilderComponent,
  createBlockManagementUseCase,
  ApiSelectUseCase,
  FetchHttpClient,
  CustomFieldRendererRegistry,
} from '@mushket-co/block-builder/vue'
import { blockConfigs } from './block-config'
import { WysiwygFieldRenderer } from './customFieldRenderers/WysiwygFieldRenderer'

const blockManagementUseCase = createBlockManagementUseCase()
const httpClient = new FetchHttpClient()
const apiSelectUseCase = new ApiSelectUseCase(httpClient)

const customFieldRendererRegistry = new CustomFieldRendererRegistry()
customFieldRendererRegistry.register(new WysiwygFieldRenderer())

// Регистрация компонентов блоков в registry
const componentRegistry = blockManagementUseCase.getComponentRegistry()
Object.entries(blockConfigs).forEach(([type, config]) => {
  if (config.render?.component) {
    componentRegistry.register(type, config.render.component)
  }
})

const availableBlockTypes = ref(
  Object.entries(blockConfigs).map(([type, cfg]) => ({ type, ...cfg }))
)

const initialBlocks = ref([])
const isEdit = ref(true)

const handleSave = async (blocks) => {
  await fetch('/api/blocks', { method: 'POST', body: JSON.stringify(blocks) })
  return true
}
</script>
```

Компонент блока:

```vue
<!-- components/TextBlock.vue -->
<template>
  <div class="text-block" v-html="block.props.content" />
</template>

<script setup>
defineProps({ block: { type: Object, required: true } })
</script>

<style scoped>
.text-block {
  padding-top: var(--spacing-padding-top, 1rem);
  padding-bottom: var(--spacing-padding-bottom, 1rem);
}
</style>
```

### BlockBuilderComponent

#### Props

| Prop | Тип | Обязательный | Описание |
|------|-----|--------------|----------|
| `config` | `{ availableBlockTypes }` | — | Типы блоков |
| `blockManagementUseCase` | `BlockManagementUseCase` | **да** | Use case + registry |
| `apiSelectUseCase` | `ApiSelectUseCase` | — | Для полей `api-select` |
| `customFieldRendererRegistry` | registry | — | Для полей `custom` |
| `onSave` | `(blocks) => boolean \| Promise<boolean>` | — | Сохранение |
| `initialBlocks` | `IBlock[]` | — | Начальные блоки |
| `isEdit` | `boolean` | `true` | Режим редактирования |
| `warnOnPageLeave` | `boolean` | `false` | Предупреждение при уходе |
| `controlsContainerClass` | `string` | — | Класс панели управления |
| `controlsFixedPosition` | `'top' \| 'bottom'` | — | Фиксация панели |
| `controlsOffset` | `number` | — | Отступ панели |
| `controlsOffsetVar` | `string` | — | CSS-переменная отступа |

В режиме редактирования на `document.body` добавляется класс `bb-is-edit-mode`.

#### Composables (для кастомного UI)

Экспортируются из `src/vue/composables/` (при необходимости импортируйте из исходников или соберите обёртку):

- `useBlocks`, `useBlockForm`, `useModals`, `usePageLeaveWarning`

### События

| Событие | Payload | Когда |
|---------|---------|-------|
| `block-added` | `IBlock` | Создан или продублирован блок |
| `block-updated` | `IBlock` | Обновлён блок |
| `block-deleted` | `TBlockId` | Удалён блок |

Переупорядочивание блоков отдельного события не эмитит — отслеживайте через `onSave` или опрашивайте use case.

### Core API в Vue

Для полностью кастомного UI без `BlockBuilderComponent`:

```js
import { BlockBuilder, BlockBuilderFactory } from '@mushket-co/block-builder/vue'

const builder = new BlockBuilder({
  blockConfigs,
  autoInit: false,
  isEdit: true,
})

const block = await builder.createBlock({
  type: 'text',
  props: { content: 'Hello' },
  settings: {},
})

builder.setIsEdit(false)
```

`createBlockManagementUseCase()` — рекомендуемый способ получить настроенный `BlockManagementUseCase` с репозиторием и registry.

---

## React

### Быстрый старт (React)

```tsx
import '@mushket-co/block-builder/index.esm.css'
import {
  BlockBuilderComponent,
  createBlockManagementUseCase,
  ApiSelectUseCase,
  FetchHttpClient,
  CustomFieldRendererRegistry,
} from '@mushket-co/block-builder/react'
import { blockConfigs } from './block-config'
import { WysiwygFieldRenderer } from './customFieldRenderers/WysiwygFieldRenderer'
import { TextBlock } from './components/blocks/TextBlock'

const blockManagementUseCase = createBlockManagementUseCase()
const apiSelectUseCase = new ApiSelectUseCase(new FetchHttpClient())
const customFieldRendererRegistry = new CustomFieldRendererRegistry()
customFieldRendererRegistry.register(new WysiwygFieldRenderer())

Object.entries(blockConfigs).forEach(([type, config]) => {
  if (config.render?.component) {
    blockManagementUseCase.getComponentRegistry().register(type, config.render.component)
  }
})

const availableBlockTypes = Object.entries(blockConfigs).map(([type, cfg]) => ({
  type,
  ...cfg,
  framework: 'react',
}))

export function App() {
  return (
    <BlockBuilderComponent
      config={{ availableBlockTypes }}
      blockManagementUseCase={blockManagementUseCase}
      apiSelectUseCase={apiSelectUseCase}
      customFieldRendererRegistry={customFieldRendererRegistry}
      onSave={async (blocks) => {
        await fetch('/api/blocks', { method: 'POST', body: JSON.stringify(blocks) })
        return true
      }}
      initialBlocks={[]}
      isEdit
      warnOnPageLeave
      onBlockAdded={(block) => console.log('added', block)}
      onBlockUpdated={(block) => console.log('updated', block)}
      onBlockDeleted={(id) => console.log('deleted', id)}
    />
  )
}
```

В `vite.config` нужен alias на исходники пакета (entry `/react` отдаёт `.ts`/`.tsx`). См. [`examples/react/vite.config.js`](./examples/react/vite.config.js).

Компонент блока:

```tsx
export function TextBlock({ block }: { block: { props: { content?: string } } }) {
  return (
    <div
      className="text-block"
      style={{
        paddingTop: 'var(--spacing-padding-top, 1rem)',
        paddingBottom: 'var(--spacing-padding-bottom, 1rem)',
      }}
      dangerouslySetInnerHTML={{ __html: block.props.content ?? '' }}
    />
  )
}
```

В `block-config` укажите `framework: 'react'` в `render`.

### BlockBuilderComponent (React)

Props зеркалят Vue (`IBlockBuilderProps`), колбэки вместо событий:

| Prop / callback | Описание |
|---------------|----------|
| `onBlockAdded` | Блок создан / продублирован |
| `onBlockUpdated` | Блок обновлён |
| `onBlockDeleted` | Блок удалён |

Хуки для кастомного UI: `useBlockBuilder`, `useBlocks`, `useBlockForm`, `useModals`, `usePageLeaveWarning`.

`dependsOn` и ToggleControl в React **не поддерживаются**.

---

## SSR и гидрация

### Общий паттерн

1. На сервере загрузите блоки из БД/API.
2. Зарегистрируйте компоненты в `componentRegistry`.
3. Передайте `initialBlocks` в `BlockBuilderComponent`.
4. При сериализации в JSON убирайте `render.component` (функции/классы не сериализуются).
5. На клиенте `prepareBlocksForDisplay` / `enrichBlockForDisplay` восстанавливают `render` из `availableBlockTypes`.
6. `seedRepositoryFromBlocks(useCase, blocks)` синхронизирует in-memory репозиторий.
7. `enableViewportBreakpointDetection()` — корректный пересчёт spacing после гидрации.

### Vue / Nuxt

```js
// server / asyncData
import { prepareBlocksForDisplay } from '@mushket-co/block-builder/vue'

const blocks = prepareBlocksForDisplay(rawBlocks, getBlockTypeConfig)
```

Примеры: [`examples/nuxt3`](./examples/nuxt3) (порт 3006), [`examples/nuxt4`](./examples/nuxt4) (порт 3007).

### React / Next.js

Server Component загружает блоки → Client Component рендерит `BlockBuilderComponent` с `initialBlocks`.

Пример: [`examples/next`](./examples/next) (порт 3008).

---

## Интеграция с бэкендом

### Сохранение блоков

```js
// POST /api/blocks
{
  "blocks": [ /* IBlockDto[] без render.component */ ]
}
```

Перед сохранением удаляйте несериализуемые поля (`render.component`, SSR-кэш вроде предзагруженных `newsItems`). См. `serializeBlocksForStorage` в примерах Nuxt.

### Загрузка

```js
// GET /api/blocks → { blocks: IBlockDto[] }
```

При загрузке восстанавливайте `render` из локального `blockConfigs` / registry.

### Загрузка изображений

```js
// POST /api/upload
// multipart/form-data, поле file
// Ответ: { url: 'https://...' } или через responseMapper
```

### onSave

```js
const onSave = async (blocks) => {
  const res = await fetch('/api/blocks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks: stripForStorage(blocks) }),
  })
  return res.ok  // true сбрасывает baseline warnOnPageLeave
}
```

---

## Примеры

| Команда | Стек | Порт |
|---------|------|------|
| `npm run example:vue3` | Vue 3 + Vite | 3001 |
| `npm run example:pure-js` | Pure JS + Vite | 3002 |
| `npm run example:react` | React + Vite | 3004 |
| `npm run example:vue3-core-api` | Vue + только Core API | 3005 |
| `npm run example:nuxt3` | Nuxt 3 SSR | 3006 |
| `npm run example:nuxt4` | Nuxt 4 SSR | 3007 |
| `npm run example:next` | Next.js SSR | 3008 |
| `npm run example:cdn` | CDN без сборщика | — |
| `npm run example:api-usage` | Core API | — |

Подробнее: [`examples/README.md`](./examples/README.md).

---

## Миграция

### С версий до 1.1.0

- Удалено лицензирование FREE/PRO — пакет полностью MIT, без ключей и ограничений.
- Убраны опции `license`, `licenseKey`, `licenseService`.

### Именование событий (Vue)

- `block-created` → **`block-added`**
- События `block-reordered` нет

### Поля форм

- Используйте `field` (не `name`) и `rules: [{ type: 'required', ... }]` (не `required: true`).

---

**Вопросы и баги:** [GitHub Issues](https://github.com/mushket-co/block-builder/issues)
