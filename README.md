# 🏗️ BlockBuilder - Блочный конструктор с чистой архитектурой

Библиотека для создания блочных конструкторов с правильной чистой архитектурой.

## 📖 Содержание

- [🎯 Принципы чистой архитектуры](#-принципы-чистой-архитектуры)
- [🚀 Быстрый старт](#-быстрый-старт)
- [📋 API](#-api)
- [🎨 Кастомные типы полей](#-кастомные-типы-полей)
- [🧪 Тестирование](#-тестирование)
- [📚 Примеры](#-примеры)
- [🛠️ Разработка](#️-разработка)

## 🎯 Принципы чистой архитектуры

### Структура проекта
```
src/
├── core/                    # 🎯 Ядро приложения
│   ├── entities/            # ✅ Сущности с бизнес-правилами
│   ├── use-cases/           # ✅ Сценарии (единственный вход в ядро)
│   ├── ports/               # ✅ Интерфейсы (контракты)
│   └── types/               # ✅ Типы и интерфейсы
├── infrastructure/          # 🔧 Реализации портов
│   ├── repositories/        # ✅ Реализации репозиториев
│   ├── registries/          # ✅ Реализации реестров
│   └── http/                # ✅ HTTP клиенты
├── ui/                      # 🎨 UI слой (только вызывает Use Cases)
│   ├── components/           # ✅ Vue3 компоненты
│   ├── controllers/         # ✅ UI контроллеры
│   ├── services/            # ✅ UI сервисы
│   └── styles/              # ✅ Стили (SCSS)
├── utils/                    # 🔧 Утилиты
└── examples/                # 📚 Примеры использования
```


## 🚀 Быстрый старт

### Установка
```bash
npm install @mushket-co/block-builder
```

> ⚠️ **Примечание:** Текущая версия находится в стадии Beta. Пакет стабилен и готов к использованию, но возможны изменения API в будущих версиях.

### 📦 Entry Points

Пакет предоставляет несколько точек входа:

- **`@mushket-co/block-builder`** - основной экспорт с UI для Pure JS
- **`@mushket-co/block-builder/core`** - только API без UI компонентов
- **`@mushket-co/block-builder/vue`** - Vue3 компоненты

```javascript
// Основной экспорт (Pure JS с автоматическим UI)
import { BlockBuilder } from '@mushket-co/block-builder'
import '@mushket-co/block-builder/index.esm.css' // Импортируйте стили!

// Только API без UI
import { BlockBuilder } from '@mushket-co/block-builder/core'

// Vue3 компоненты
import { BlockBuilderComponent } from '@mushket-co/block-builder/vue'
import '@mushket-co/block-builder/index.esm.css' // Импортируйте стили!
```

**💡 Разница между `@mushket-co/block-builder` и `@mushket-co/block-builder/core`:**

### `@mushket-co/block-builder` (основной экспорт)
- **Размер бандла:** ~114KB (87KB JS + 27KB CSS)
- **Включает:** Полный API + готовый UI + стили
- **Использование:** Когда нужен готовый UI из коробки

```javascript
import { BlockBuilder } from '@mushket-co/block-builder'
import '@mushket-co/block-builder/index.esm.css' // Импортируйте стили!
```

### `@mushket-co/block-builder/core` (только API)
- **Размер бандла:** ~89KB (только JS, без CSS)
- **Включает:** Только API, без UI и стилей
- **Использование:** Когда нужен только программный API, без готового UI

```javascript
import { BlockBuilder } from '@mushket-co/block-builder/core'
// CSS НЕ нужен!
```

⚠️ **ВАЖНО:** Для `@mushket-co/block-builder/core` **НЕ передавайте `containerId`**!

**🔑 Логика автоматической инициализации UI:**
- Если передаете `containerId` - UI инициализируется автоматически (только в `@mushket-co/block-builder`)
- Если НЕ передаете `containerId` - используется только API
- **Для `@mushket-co/block-builder/core` `containerId` НЕ нужен** - используйте только программный API
- Если случайно передать `containerId` в core версию, UI попытается инициализироваться, но стили работать НЕ БУДУТ (их нет в core bundle)

### 🎯 Использование без UI (только для особых случаев)

**⚠️ Внимание:** Использование `@mushket-co/block-builder/core` без готового UI **не рекомендуется** для большинства проектов!

**Суть пакета BlockBuilder** — предоставить из коробки всё необходимое для создания и редактирования блоков: оптимизированные формы, валидацию, модалки, UI управления блоками. Используйте готовый UI — это и есть главная ценность пакета.

**Используйте `@mushket-co/block-builder/core` только в исключительных случаях:**

#### ⚙️ Случай 1: Серверная обработка (Node.js)
Обработка и валидация блоков на бэкенде без браузера.

```javascript
// На сервере (Node.js)
import { BlockBuilder } from '@mushket-co/block-builder/core'

const bb = new BlockBuilder({
  blockConfigs: {}
  // containerId НЕ передаем - для core версии он не нужен!
})

// Обрабатывайте блоки программно
const validationResults = await validateAllBlocks(blocks)
```

#### ⚙️ Случай 2: Максимально кастомизированный проект
Когда нужен полностью уникальный UI, не совместимый с нашим дизайном.

```javascript
import { BlockBuilder } from '@mushket-co/block-builder/core'

const bb = new BlockBuilder({
  blockConfigs: {}
  // containerId НЕ передаем - для core версии он не нужен!
})

// Создайте свой UI, вызывая API
await bb.createBlock({ type: 'text', props: {} })
const blocks = await bb.getAllBlocks()
```

#### ⚙️ Случай 3: Критический размер бандла
Когда каждый килобайт важен (редкие случаи).

```javascript
import { BlockBuilder } from '@mushket-co/block-builder/core' // ~50kb без UI
```

### ❌ Что теряете без UI?

Используя `@mushket-co/block-builder/core`, вы теряете:
- **Формы с валидацией** — придётся создавать сами
- **Автоматические модалки** для создания/редактирования
- **UI управления блоками** — кнопки удаления, копирования, дублирования
- **Готовые компоненты** Vue
- **Встроенные стили** и дизайн-систему
- **Оптимизацию и тестирование** нашего UI

### ✅ Рекомендуем использовать готовый UI!

```javascript
// ✅ ПРАВИЛЬНО - для 99% случаев
import { BlockBuilder } from '@mushket-co/block-builder'
// Автоматически получаете весь UI: формы, валидацию, модалки, управление блоками

// ❌ ТОЛЬКО ДЛЯ ОСОБЫХ СЛУЧАЕВ
import { BlockBuilder } from '@mushket-co/block-builder/core'
// Придётся создавать всё сами
```

### 🔧 API доступен в обоих вариантах

Что доступно в `@mushket-co/block-builder/core`:
- CRUD операции (create, get, update, delete, duplicate)
- Управление видимостью и блокировкой
- Экспорт/импорт данных
- Работа с компонентами и кастомными полями
- Расширение функциональности через порты
- Типы и интерфейсы для TypeScript

**Разница:** В `block-builder` тот же API + готовый оптимизированный UI.

### 📚 Примеры использования core

См. [examples/api-usage](./examples/api-usage) — готовый пример с собственным UI.

### 🎨 Для Vue3 проектов

BlockBuilder предоставляет готовые Vue3 компоненты из коробки:

```vue
<template>
  <BlockBuilderComponent :config="config" />
</template>

<script setup>
import { BlockBuilderComponent } from '@mushket-co/block-builder/vue'
import YourTextBlock from './components/YourTextBlock.vue'

const config = {
  availableBlockTypes: [
    {
      type: 'text',
      label: 'Текст',
      render: {
        kind: 'component',
        framework: 'vue',
        component: YourTextBlock  // Ваш Vue SFC компонент!
      },
      fields: [
        {
          field: 'content',
          label: 'Содержимое',
          type: 'textarea',
          defaultValue: 'Hello'
        }
      ],
      defaultProps: { content: 'Hello' }
    }
  ]
}
</script>
```

---

## 🌐 Локализация и UI-строки
Все пользовательские тексты/сообщения централизованы в `src/utils/constants.ts` (`UI_STRINGS`). Для поддержки мультиязычности расширьте этот объект и реализуйте механизм подстановки по локали.

Пример:
```js
import { UI_STRINGS } from 'src/utils/constants';
console.log(UI_STRINGS.create); // 'Создать'
```

---

## ⚡ Два способа использования

### 1️⃣ BlockBuilder (Pure JS) - Автоматический UI

Для Pure JavaScript проектов или когда нужен готовый UI из коробки:

```javascript
import { BlockBuilder } from '@mushket-co/block-builder'
import { blockConfigs } from './block-config.js'

// Автоматически рендерит готовый UI с кнопками, формами, валидацией
const blockBuilder = new BlockBuilder({
  containerId: 'my-app', // Передаем containerId - UI инициализируется автоматически
  blockConfigs: blockConfigs,
  isEdit: true // Режим редактирования (по умолчанию true, можно установить false для режима только просмотра)
})

// Динамическое переключение режима
blockBuilder.setIsEdit(false) // Переключить в режим просмотра
blockBuilder.setIsEdit(true)  // Переключить обратно в режим редактирования
console.log(blockBuilder.getIsEdit()) // Получить текущий режим
```

### 2️⃣ BlockBuilderComponent (Vue3) - Vue компонент

Для Vue3 проектов используйте компонент:

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
      />
</template>

<script setup>
import { ref } from 'vue'
import {
  BlockBuilderComponent,
  createBlockManagementUseCase,
  ApiSelectUseCase,
  FetchHttpClient,
  CustomFieldRendererRegistry
} from '@mushket-co/block-builder/vue'
import { blockConfigs } from './block-config'
import { WysiwygFieldRenderer } from './customFieldRenderers/WysiwygFieldRenderer'

const blockManagementUseCase = createBlockManagementUseCase()
// Repository хранит блоки только в памяти (для работы во время сессии)

const httpClient = new FetchHttpClient()
const apiSelectUseCase = new ApiSelectUseCase(httpClient)

const customFieldRendererRegistry = new CustomFieldRendererRegistry()
customFieldRendererRegistry.register(new WysiwygFieldRenderer())

const componentRegistry = blockManagementUseCase.getComponentRegistry()
Object.entries(blockConfigs).forEach(([type, config]) => {
  if (config.render?.component) {
    componentRegistry.register(type, config.render.component)
  }
})

const availableBlockTypes = ref(
  Object.entries(blockConfigs).map(([type, cfg]) => ({
    type,
    label: cfg.title,
    icon: cfg.icon,
    render: cfg.render,
    fields: cfg.fields,
    spacingOptions: cfg.spacingOptions
  }))
)

const isEdit = ref(true) // Режим редактирования (можно установить false для режима только просмотра)

// Загрузка сохраненных блоков при инициализации
const loadSavedBlocks = () => {
  try {
    const savedData = localStorage.getItem('saved-blocks')
    if (savedData) {
      return JSON.parse(savedData)
    }
  } catch (error) {
    console.error('Ошибка загрузки блоков:', error)
  }
  return []
}

const initialBlocks = ref(loadSavedBlocks())

const handleSave = async (blocks) => {
  try {
    // В реальном приложении здесь будет POST на ваш API:
    // await fetch('/api/blocks', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(blocks)
    // })

    // Для демо сохраняем в localStorage
    localStorage.setItem('saved-blocks', JSON.stringify(blocks))
    return true
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    return false
  }
}
</script>
```

**Важно:**
- Для Vue3 используйте `BlockBuilderComponent`, а не `BlockBuilder`!
- Обязательно передавайте `block-management-use-case` - это главный объект для работы с блоками согласно чистой архитектуре
- Repository хранит блоки только в памяти (для работы во время сессии)
- Сохранение и загрузка блоков полностью под вашим контролем через `onSave` callback

Используйте helper функцию `createBlockManagementUseCase` - всё создается автоматически:

```javascript
const useCase = createBlockManagementUseCase()
```

Для продвинутого использования с полным контролем смотрите примеры в docs.

## 🏗️ Архитектура

### Core (Ядро)
- **Entities** - бизнес-правила
- **Use Cases** - сценарии приложения
- **Ports** - интерфейсы для внешнего мира
- **DTO** - объекты передачи данных

### Infrastructure
- **Repositories** - реализации портов
- **MemoryBlockRepositoryImpl** - хранение в памяти (работа во время сессии)

### UI
- **Vue3 компоненты** - только вызывают Use Cases
- **BlockBuilder** - основной конструктор
- **BlockComponent** - компонент блока
- **BlockProperties** - панель свойств

## 📋 API

### BlockBuilder - Основной класс

```javascript
const blockBuilder = new BlockBuilder({
  containerId: 'block-builder-container',
  blockConfigs: blockConfigs,
  theme: 'light',                      // Тема (light/dark)
  locale: 'ru',                        // Локализация
  autoInit: true,                      // Автоматическая инициализация (по умолчанию true)
  controlsContainerClass: 'container', // CSS класс для контейнера контролов
  controlsFixedPosition: 'bottom',     // Фиксированная позиция: 'top' | 'bottom'
  controlsOffset: 20,                  // Отступ от края в пикселях (опционально)
  controlsOffsetVar: '--header-height', // CSS переменная для учета высоты шапки (опционально)
  isEdit: true,                        // Режим редактирования (по умолчанию true)
  onSave: async (blocks) => {},       // Callback при сохранении
  initialBlocks: []                    // Начальные блоки
})
```

**🔑 Логика инициализации UI:**
- Если передан `containerId` - UI инициализируется автоматически (в блок с `containerId`)
- Если `containerId` не передан - используется только API (подходит для `@mushket-co/block-builder/core`)
- **Для `@mushket-co/block-builder/core` `containerId` НЕ нужен** - используйте только программный API
- Для полного контроля передайте `autoInit: false` и инициализируйте вручную

**🎨 Кастомизация UI контролов:**
- `controlsContainerClass` - CSS класс, который применяется к контейнеру контролов (включает кнопки и статистику)
- `controlsFixedPosition` - фиксирует панель управления (кнопки + статистика): `'top'` (сверху) или `'bottom'` (снизу)
- `controlsOffset` - отступ от края в пикселях (по умолчанию 0)
- `controlsOffsetVar` - CSS переменная для учета высоты шапки/футера (например: `'--header-height'`)
- Панель управления включает кнопки (Сохранить, Очистить) и статистику (количество блоков) в одном блоке
- При фиксации панель остается видимой при прокрутке для удобного доступа
- Пример с учетом высоты шапки: `controlsOffsetVar: '--header-height'` и `controlsFixedPosition: 'top'`

**👁️ Режим редактирования/просмотра:**
- `isEdit` - переключает между режимом редактирования (`true`, по умолчанию) и режимом только просмотра (`false`)
- В режиме просмотра (`isEdit: false`) все контролы редактирования скрываются, остаётся только пользовательская верстка блоков в обёртке BlockBuilder
- Можно динамически переключать режим через методы `setIsEdit(isEdit: boolean)` и `getIsEdit(): boolean`
- Автоматически добавляется CSS класс `bb-is-edit-mode` на элемент `body` для кастомизации стилей

### 🔧 Методы работы с блоками

```javascript
// CRUD операции
await blockBuilder.createBlock(blockData)
await blockBuilder.getBlock(blockId)
await blockBuilder.getAllBlocks()
await blockBuilder.updateBlock(blockId, updates)
await blockBuilder.deleteBlock(blockId)
await blockBuilder.duplicateBlock(blockId)

// Видимость и блокировка
await blockBuilder.setBlockVisible(blockId, visible)
await blockBuilder.setBlockLocked(blockId, locked)

// Операции с множеством блоков
await blockBuilder.getBlocksByType(type)
await blockBuilder.reorderBlocks(blockIds)
await blockBuilder.clearAllBlocks()
await blockBuilder.getBlocksCount()

// Экспорт/Импорт
await blockBuilder.exportBlocks()
await blockBuilder.importBlocks(jsonData)
```

### 🎨 Методы работы с UI

```javascript
// Модальные окна
blockBuilder.showBlockTypeSelectionModal(position?)
blockBuilder.showAddBlockForm(type)
blockBuilder.showAddBlockFormAtPosition(type, position?)
blockBuilder.editBlock(blockId)
blockBuilder.closeModal()
blockBuilder.submitModal()

// Управление блоками (с UI)
await blockBuilder.toggleBlockLock(blockId)
await blockBuilder.toggleBlockVisibility(blockId)
await blockBuilder.deleteBlockUI(blockId)
await blockBuilder.duplicateBlockUI(blockId)
await blockBuilder.moveBlockUp(blockId)
await blockBuilder.moveBlockDown(blockId)
blockBuilder.copyBlockId(blockId)

// Массовые операции
await blockBuilder.clearAllBlocksUI()
await blockBuilder.saveAllBlocksUI()
```

### 🧩 Методы работы с компонентами

```javascript
blockBuilder.registerComponent(name, component)
blockBuilder.getComponent(name)
blockBuilder.hasComponent(name)
blockBuilder.getAllComponents()
blockBuilder.unregisterComponent(name)
blockBuilder.registerComponents(components)
```

### 🎨 Методы работы с кастомными полями

```javascript
blockBuilder.registerCustomFieldRenderer(renderer)
blockBuilder.registerCustomFieldRenderers([renderer1, renderer2])
blockBuilder.getCustomFieldRenderer(id)
blockBuilder.hasCustomFieldRenderer(id)
blockBuilder.unregisterCustomFieldRenderer(id)
blockBuilder.getAllCustomFieldRenderers()
```

### 📊 Утилиты

```javascript
blockBuilder.getBlockConfigs()
blockBuilder.getBlockConfig(type)
blockBuilder.hasBlockType(type)
blockBuilder.getAvailableBlockTypes()
blockBuilder.destroy() // Очистка ресурсов

// Режим редактирования
blockBuilder.setIsEdit(isEdit) // Переключить режим редактирования/просмотра
blockBuilder.getIsEdit()       // Получить текущий режим (true/false)
```

### Конфигурация блоков
```javascript
const blockConfig = {
  title: 'Название блока',
  description: 'Описание блока',
  component: MyVueComponent,        // Vue компонент (для Vue3)
  template: '<div>{{ content }}</div>', // HTML шаблон (для Pure JS)
  fields: [
    {
      field: 'fieldName',
      label: 'Название поля',
      type: 'text' | 'textarea' | 'number' | 'color' | 'select' | 'checkbox' | 'url' | 'image' | 'custom',
      placeholder: 'Подсказка',
      rules: [
        {
          type: 'required' | 'email' | 'url' | 'min' | 'max' | 'minLength' | 'maxLength',
          value?: number,
          message: 'Сообщение об ошибке'
        }
      ],
      defaultValue: 'Значение по умолчанию',
      options?: [
        { value: 'value', label: 'Label' }
      ]
    }
  ]
}
```

### 🖼️ Работа с полем типа 'image'

Поле типа `image` предназначено для загрузки изображений с поддержкой двух режимов хранения данных.

#### Конфигурация поля

```javascript
{
  field: 'image',
  label: 'Изображение',
  type: 'image',
  rules: [
    { type: 'required', message: 'Изображение обязательно' }
  ],
  defaultValue: '',
  imageUploadConfig: {
    uploadUrl: '/api/upload',           // URL для загрузки на сервер
    fileParamName: 'file',              // Имя поля в FormData (по умолчанию 'file')
    maxFileSize: 5 * 1024 * 1024,       // Максимальный размер файла в байтах (5MB)
    accept: 'image/*',                  // Разрешенные типы файлов
    uploadHeaders: {                    // Заголовки для запроса загрузки
      'Authorization': 'Bearer token'
    },
    responseMapper: (response) => {     // Преобразование ответа сервера
      // ОБЯЗАТЕЛЬНО вернуть объект с полем src!
      return {
        src: response.url,              // ОБЯЗАТЕЛЬНОЕ поле с URL изображения
        width: response.width,          // Дополнительные поля (опционально)
        height: response.height,
        size: response.size
      };
    },
    onUploadError: (error) => {         // Обработка ошибок загрузки
      console.error('Ошибка загрузки:', error);
    }
  }
}
```

#### Формат хранения данных

**1. Base64 изображения (без `uploadUrl`)**

Если `imageUploadConfig.uploadUrl` не указан, изображение сохраняется как строка base64:

```javascript
image: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
```

**2. Серверная загрузка (с `uploadUrl`)**

Если указан `uploadUrl`, изображение загружается на сервер. **ОБЯЗАТЕЛЬНО** через `responseMapper` вернуть объект с полем `src`:

```javascript
image: {
  src: "https://example.com/uploads/image.jpg",  // ОБЯЗАТЕЛЬНО!
  width: 1920,                                   // Опционально
  height: 1080,                                  // Опционально
  size: 245678                                   // Опционально
}
```

#### 💡 Рекомендация: используйте серверную загрузку

Хотя BlockBuilder поддерживает сохранение изображений в base64, **рекомендуется использовать собственный загрузчик через backend метод** (`imageUploadConfig.uploadUrl`).

**Преимущества серверной загрузки:**

1. **Оптимизация размера данных**
   - Base64 увеличивает размер изображения на ~33%
   - При серверной загрузке сохраняется только URL (~100-200 байт вместо нескольких мегабайт)
   - Значительно уменьшается размер JSON с блоками
   - Быстрее сохранение и загрузка данных из localStorage/API

2. **Производительность**
   - Изображения загружаются по требованию через CDN/оптимизированный сервер
   - Возможность использовать lazy loading и адаптивные изображения
   - Более быстрое отображение страницы (не нужно декодировать base64)

3. **Метаданные изображения**
   - Возможность хранить дополнительную информацию (ширина, высота, размер)
   - Проще управлять версиями и вариантами изображений (thumbnails, responsive)
   - Можно добавить оптимизацию на сервере (сжатие, конвертация форматов)

4. **Масштабируемость**
   - Изображения хранятся отдельно от контента
   - Легче управлять хранилищем (S3, Cloud Storage и т.д.)
   - Возможность кеширования на уровне CDN
   - Удобнее очищать неиспользуемые файлы

5. **Безопасность**
   - Контроль доступа к файлам на уровне сервера
   - Возможность валидации файлов перед сохранением
   - Защита от переполнения localStorage/бд

**Пример рекомендуемой конфигурации:**

```javascript
{
  field: 'image',
  label: 'Изображение',
  type: 'image',
  imageUploadConfig: {
    uploadUrl: '/api/upload',
    maxFileSize: 5 * 1024 * 1024,
    responseMapper: (response) => ({
      src: response.url  // ОБЯЗАТЕЛЬНО!
    })
  }
}
```

**Когда использовать base64:**
- Прототипирование и разработка
- Небольшие иконки (< 50KB)
- Временные данные, которые не нужно хранить долго
- Когда нет возможности настроить backend загрузчик

#### ⚠️ Важные требования

1. **Обязательное поле `src`**: При использовании собственного загрузчика (`uploadUrl`) через `responseMapper` **ОБЯЗАТЕЛЬНО** верните объект с полем `src`, содержащим URL изображения.

2. **Без `responseMapper`**: Если `responseMapper` не указан, сохраняется весь ответ сервера как есть. Если ответ - объект, он должен содержать поле `src` или другой ключ с URL (компоненты автоматически извлекут URL для отображения).

3. **Пример правильной настройки:**

```javascript
imageUploadConfig: {
  uploadUrl: '/api/upload',
  responseMapper: (response) => ({
    src: response.data.file.url,    // ОБЯЗАТЕЛЬНО!
    width: response.data.file.width,
    height: response.data.file.height
  })
}
```

#### Использование в компонентах

**Vue компонент:**

```vue
<template>
  <img :src="imageUrl" :alt="alt" />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  image: [String, Object],  // Может быть строка (base64) или объект
  alt: String
});

// Преобразуем image в URL для img тега
const imageUrl = computed(() => {
  if (typeof props.image === 'string') return props.image;
  if (typeof props.image === 'object' && props.image !== null) {
    return props.image.src || '';
  }
  return '';
});
</script>
```

**HTML шаблон (Pure JS):**

```javascript
template: (props) => {
  // Преобразуем image в URL
  const getImageUrl = (img) => {
    if (typeof img === 'string') return img;
    if (typeof img === 'object' && img !== null) return img.src || '';
    return '';
  };

  return `<img src="${getImageUrl(props.image)}" alt="${props.alt || ''}" />`;
}
```

#### Пример конфигурации блока с изображением

```javascript
export const blockConfigs = {
  image: {
    title: 'Блок изображения',
    icon: '🖼️',
    description: 'Добавьте изображение',
    render: {
      kind: 'component',
      framework: 'vue',
      component: ImageBlock
    },
    fields: [
      {
        field: 'image',
        label: 'Изображение',
        type: 'image',
        rules: [
          { type: 'required', message: 'Изображение обязательно' }
        ],
        defaultValue: '',
        imageUploadConfig: {
          uploadUrl: '/api/upload',
          fileParamName: 'file',
          maxFileSize: 5 * 1024 * 1024,
          responseMapper: (response) => ({
            src: response.url  // ОБЯЗАТЕЛЬНО!
          })
        }
      },
      {
        field: 'alt',
        label: 'Описание',
        type: 'text',
        defaultValue: ''
      }
    ]
  }
};
```

## 🔧 Детальное описание Core API (без UI)

Если вы хотите использовать только API без готового UI, импортируйте из `@mushket-co/block-builder/core`:

```javascript
import { BlockBuilder } from '@mushket-co/block-builder/core'
```

### Инициализация

```javascript
const blockBuilder = new BlockBuilder({
  blockConfigs: blockConfigs,
  // containerId НЕ передаем - для core версии он не нужен!
  onSave: async (blocks) => {
    // Ваш код сохранения
    return true
  }
})

// Доступные публичные свойства
console.log(blockBuilder.theme)    // 'light' | 'dark'
console.log(blockBuilder.locale)   // 'ru' | 'en' и т.д.
```

**💡 Важно:** При использовании `@mushket-co/block-builder/core` **НЕ передавайте `containerId`** - он не нужен для core версии. Без `containerId` UI не будет инициализирован, используется только программный API.

### 📦 Типы данных

#### IBlockDto - Полное представление блока
```typescript
interface IBlockDto {
  id: string                        // Уникальный ID блока
  type: string                      // Тип блока (из конфигурации)
  props: Record<string, any>        // Свойства блока (контент)
  settings: Record<string, any>     // Настройки блока
  style?: Record<string, any>      // Стили блока
  visible?: boolean                 // Видимость блока
  locked?: boolean                  // Блокировка блока
  order?: number                     // Порядок в списке
  parent?: string                   // ID родительского блока
  children?: string[]               // IDs дочерних блоков
  metadata?: {                      // Метаданные
    createdAt: Date
    updatedAt: Date
    version: number
    author?: string
  }
  render?: TRenderRef               // Реф для рендеринга
  formConfig?: IFormGenerationConfig // Конфигурация формы
}
```

#### ICreateBlockDto - Данные для создания блока
```typescript
interface ICreateBlockDto {
  type: string                      // Тип блока (обязательно)
  props: Record<string, any>        // Свойства
  settings: Record<string, any>     // Настройки
  style?: Record<string, any>      // Стили
  visible?: boolean                 // Видимость
  locked?: boolean                  // Блокировка
  order?: number                     // Порядок
  parent?: string                   // ID родителя
  metadata?: IBlockMetadata         // Метаданные
  render?: TRenderRef               // Реф для рендеринга
  formConfig?: IFormGenerationConfig // Конфигурация формы
}
```

#### IUpdateBlockDto - Данные для обновления блока
```typescript
interface IUpdateBlockDto {
  props?: Partial<Record<string, any>>      // Обновление props
  settings?: Partial<Record<string, any>>    // Обновление settings
  style?: Partial<Record<string, any>>       // Обновление стилей
  order?: number                              // Изменение порядка
  visible?: boolean                           // Изменение видимости
  locked?: boolean                            // Изменение блокировки
  render?: TRenderRef                         // Изменение рендера
  formConfig?: IFormGenerationConfig         // Изменение формы
}
```

### 🔨 CRUD операции с блоками

#### Создание блока
```javascript
const newBlock = await blockBuilder.createBlock({
  type: 'text',
  props: {
    content: 'Hello World',
    color: '#333333'
  },
  settings: {
    fontSize: 16,
    alignment: 'left'
  },
  visible: true,
  locked: false,
  order: 0
})

console.log('Создан блок:', newBlock.id)
console.log('Произвольный ID:', newBlock.id) // Уникальный ID
// Возвращает: Promise<IBlockDto>
```

#### Получение блока
```javascript
// Получить один блок
// Возвращает: Promise<IBlockDto | null>
const block = await blockBuilder.getBlock('block-id-123')
if (block) {
  console.log('Блок:', block)
} else {
  console.log('Блок не найден')
}

// Получить все блоки
// Возвращает: Promise<IBlockDto[]>
const allBlocks = await blockBuilder.getAllBlocks()
console.log(`Всего блоков: ${allBlocks.length}`)

// Получить блоки по типу
// Возвращает: Promise<IBlockDto[]>
const textBlocks = await blockBuilder.getBlocksByType('text')
console.log(`Текстовых блоков: ${textBlocks.length}`)
```

#### Обновление блока
```javascript
// Частичное обновление
// Возвращает: Promise<IBlockDto | null>
const updated = await blockBuilder.updateBlock('block-id-123', {
  props: { content: 'Updated text' },
  settings: { fontSize: 18 }
})

if (updated) {
  console.log('Блок обновлён:', updated.id)
} else {
  console.log('Блок не найден для обновления')
}

// Полное обновление
const updated2 = await blockBuilder.updateBlock('block-id-123', {
  props: { content: 'New content', color: '#666' },
  settings: { fontSize: 20, alignment: 'center' },
  visible: false
})
```

#### Удаление блока
```javascript
// Возвращает: Promise<boolean>
const deleted = await blockBuilder.deleteBlock('block-id-123')
if (deleted) {
  console.log('Блок успешно удалён')
} else {
  console.log('Блок не найден или не удалён')
}
```

#### Дублирование блока
```javascript
// Возвращает: Promise<IBlockDto | null>
const duplicated = await blockBuilder.duplicateBlock('block-id-123')
if (duplicated) {
  console.log('Дублированный блок:', duplicated.id)
  console.log('Исходный ID:', 'block-id-123')
} else {
  console.log('Оригинальный блок не найден')
}
```

### 👁️ Управление видимостью и блокировкой

```javascript
// Скрыть блок
await blockBuilder.setBlockVisible('block-id-123', false)

// Показать блок
await blockBuilder.setBlockVisible('block-id-123', true)

// Заблокировать блок
await blockBuilder.setBlockLocked('block-id-123', true)

// Разблокировать блок
await blockBuilder.setBlockLocked('block-id-123', false)
```

### 📊 Управление порядком блоков

```javascript
// Переупорядочить блоки
// Возвращает: Promise<boolean>
const blockIds = ['block-1', 'block-2', 'block-3']
const reordered = await blockBuilder.reorderBlocks(blockIds)
if (reordered) {
  console.log('Блоки переупорядочены')
}
```

### 🧹 Операции с множеством блоков

```javascript
// Получить количество блоков
// Возвращает: Promise<number>
const count = await blockBuilder.getBlocksCount()
console.log(`Всего блоков: ${count}`)

// Очистить все блоки
// Возвращает: Promise<void>
await blockBuilder.clearAllBlocks()
console.log('Все блоки очищены')
```

### 💾 Экспорт и импорт

```javascript
// Экспорт всех блоков в JSON
// Возвращает: Promise<string> (JSON строка)
const jsonData = await blockBuilder.exportBlocks()
console.log('JSON:', jsonData)

// Сохранить в localStorage
localStorage.setItem('blocks', jsonData)

// Импорт блоков из JSON
// Возвращает: Promise<boolean> (успех/неудача)
const savedData = localStorage.getItem('blocks')
if (savedData) {
  const imported = await blockBuilder.importBlocks(savedData)
  if (imported) {
    console.log('Блоки успешно импортированы')
  } else {
    console.error('Ошибка импорта блоков')
  }
}
```

### 🧩 Работа с компонентами

```javascript
// Регистрация одного компонента
blockBuilder.registerComponent('MyTextBlock', MyTextComponent)

// Регистрация нескольких компонентов
blockBuilder.registerComponents({
  'TextBlock': TextBlockComponent,
  'Button': ButtonComponent,
  'Image': ImageComponent
})

// Получить компонент
const component = blockBuilder.getComponent('TextBlock')

// Проверить наличие компонента
if (blockBuilder.hasComponent('TextBlock')) {
  // Компонент зарегистрирован
}

// Получить все компоненты
const allComponents = blockBuilder.getAllComponents()

// Удалить компонент
blockBuilder.unregisterComponent('TextBlock')
```

### 🎨 Работа с кастомными полями

```javascript
class MyCustomFieldRenderer {
  id = 'my-custom-field'
  name = 'My Custom Field'

  render(container, context) {
    // Ваша логика рендеринга
  }
}

// Регистрация одного рендерера
blockBuilder.registerCustomFieldRenderer(new MyCustomFieldRenderer())

// Регистрация нескольких рендереров
blockBuilder.registerCustomFieldRenderers([
  new MyCustomFieldRenderer(),
  new AnotherCustomFieldRenderer()
])

// Проверить наличие рендерера
if (blockBuilder.hasCustomFieldRenderer('my-custom-field')) {
  // Рендерер зарегистрирован
}

// Получить рендерер
const renderer = blockBuilder.getCustomFieldRenderer('my-custom-field')

// Получить все рендереры
const allRenderers = blockBuilder.getAllCustomFieldRenderers()

// Удалить рендерер
blockBuilder.unregisterCustomFieldRenderer('my-custom-field')
```

### 📋 Работа с конфигурацией

```javascript
// Получить все конфигурации блоков
const configs = blockBuilder.getBlockConfigs()

// Получить конфигурацию конкретного блока
const textBlockConfig = blockBuilder.getBlockConfig('text')

// Проверить наличие типа блока
if (blockBuilder.hasBlockType('text')) {
  // Тип блока доступен
}

// Получить список доступных типов
const availableTypes = blockBuilder.getAvailableBlockTypes()
console.log('Доступные типы:', availableTypes)
```

### 🎨 Работа с Vue3 компонентами

Если вы используете Vue3 компоненты, доступны специальные методы:

```javascript
// Создать блок с Vue компонентом
const vueBlock = await blockBuilder.createVueBlock(
  'hero',                              // тип блока
  'HeroComponent',                     // имя компонента
  { title: 'Welcome', subtitle: 'Hello' }, // props компонента
  { fullWidth: true }                   // settings блока
)

// Обновить Vue компонент блока
const updated = await blockBuilder.updateVueComponent(
  'block-id-123',                      // ID блока
  'HeroComponent',                     // новое имя компонента
  { title: 'Updated', subtitle: 'Changed' } // новые props
)
```

### 🎯 Пример полного использования

```javascript
import { BlockBuilder } from '@mushket-co/block-builder/core'

const blockConfigs = {
  text: {
    title: 'Текст',
    fields: [
      {
        field: 'content',
        label: 'Содержимое',
        type: 'textarea',
        rules: [{ type: 'required' }]
      }
    ]
  },
  button: {
    title: 'Кнопка',
    fields: [
      { field: 'text', label: 'Текст', type: 'text' },
      { field: 'url', label: 'Ссылка', type: 'url' }
    ]
  }
}

// Создаём экземпляр BlockBuilder
const blockBuilder = new BlockBuilder({
  blockConfigs: blockConfigs
  // containerId НЕ передаем - для core версии он не нужен!
})

// Создаём блоки программно
await blockBuilder.createBlock({
  type: 'text',
  props: { content: 'Первый блок' },
  settings: {}
})

await blockBuilder.createBlock({
  type: 'button',
  props: { text: 'Нажми меня', url: 'https://example.com' },
  settings: {}
})

// Получаем все блоки
const blocks = await blockBuilder.getAllBlocks()
console.log('Создано блоков:', blocks.length)

// Экспортируем
const json = await blockBuilder.exportBlocks()
console.log('JSON:', json)

// Очищаем
await blockBuilder.clearAllBlocks()

// Импортируем обратно
await blockBuilder.importBlocks(json)
```

## 🔐 Лицензирование

BlockBuilder поддерживает систему лицензирования с двумя уровнями: **FREE** и **PRO**. Система реализована через расширяемый механизм `LicenseFeatureChecker`, что позволяет легко добавлять новые ограничения.

### Типы лицензий

#### FREE версия
- ✅ До 5 типов блоков
- ✅ Базовые типы полей (text, textarea, number, select, checkbox, etc.)
- ✅ Базовые настройки spacing с дефолтными брекпоинтами (desktop, tablet, mobile)
- ❌ Кастомные поля (custom fields)
- ❌ API Select поля
- ❌ Кастомные брекпоинты для spacing

#### PRO версия
- ✅ Неограниченное количество типов блоков
- ✅ Все функции FREE версии
- ✅ Кастомные поля (custom fields)
- ✅ API Select поля
- ✅ Продвинутые настройки spacing с кастомными брекпоинтами

### Активация PRO лицензии

> 💡 **Тестовый ключ для localhost:** Для разработки на `localhost` доступен тестовый ключ PRO лицензии:
>
> ```
> BB-PRO-1234-5678-ABCD
> ```
>
> ⚠️ **Важно:** Этот ключ работает **только на localhost**. Для production используйте ключ, полученный при покупке.

#### 1. Через ключ лицензии

```javascript
import { BlockBuilder } from '@mushket-co/block-builder'

const blockBuilder = new BlockBuilder({
  containerId: 'my-app',
  blockConfigs: blockConfigs,
  license: {
    key: 'BB-PRO-1234-5678-ABCD' // Тестовый ключ для localhost или ваш PRO ключ
  }
})

// Ключ автоматически проверяется при инициализации
// После успешной проверки лицензия становится PRO
```

#### 2. Через Vue компонент

```vue
<template>
  <BlockBuilderComponent
    :config="{ availableBlockTypes }"
    :license-key="licenseKey"
    @license-change="handleLicenseChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import { BlockBuilderComponent } from '@mushket-co/block-builder/vue'

const licenseKey = ref('BB-PRO-1234-5678-ABCD') // Тестовый ключ для localhost

const handleLicenseChange = (licenseInfo) => {
  console.log('Лицензия обновлена:', licenseInfo)
  // licenseInfo: { isPro: boolean, maxBlockTypes: number, currentTypesCount: number }
}
</script>
```

#### 3. Программно через LicenseService

```javascript
import { BlockBuilder } from '@mushket-co/block-builder/core'
import { LicenseService } from '@mushket-co/block-builder'

const licenseService = new LicenseService()
const blockBuilder = new BlockBuilder({
  blockConfigs: blockConfigs,
  // containerId НЕ передаем - для core версии он не нужен!
  license: {
    key: 'BB-PRO-1234-5678-ABCD' // Тестовый ключ для localhost
  }
})

// Проверка ключа лицензии
await licenseService.verifyKey('BB-PRO-1234-5678-ABCD') // Тестовый ключ для localhost

// Подписка на изменения лицензии
licenseService.onLicenseChange((licenseInfo) => {
  console.log('Лицензия обновлена:', licenseInfo)
  // licenseInfo: { isPro: boolean, maxBlockTypes: number, currentTypesCount: number }
})
```

### Проверка доступности функций

BlockBuilder использует систему `LicenseFeatureChecker` для проверки доступности функций:

```javascript
import { LicenseFeatureChecker, LicenseFeature } from '@mushket-co/block-builder'

// Получить checker из LicenseService
const featureChecker = licenseService.getFeatureChecker()

// Проверить доступность функции
if (featureChecker.isFeatureAvailable(LicenseFeature.CUSTOM_FIELDS)) {
  // Использовать кастомные поля
}

// Вспомогательные методы
featureChecker.canUseCustomFields()     // true в PRO
featureChecker.canUseApiSelect()        // true в PRO
featureChecker.hasAdvancedSpacing()    // true в PRO (кастомные брекпоинты)
featureChecker.hasUnlimitedBlockTypes() // true в PRO

// Получить сообщение об ограничении
const message = featureChecker.getFeatureRestrictionMessage(LicenseFeature.CUSTOM_FIELDS)
// "Кастомные поля доступны только в PRO версии. Для снятия ограничений приобретите PRO версию."
```

### Расширяемая система ограничений

Вы можете легко добавить новые ограничения:

```typescript
// 1. Добавьте новую функцию в enum
export enum LicenseFeature {
  // ... существующие функции
  NEW_FEATURE = 'newFeature'
}

// 2. Настройте доступность в конфигурациях
const FREE_FEATURES: IFeatureAvailability = {
  // ...
  [LicenseFeature.NEW_FEATURE]: false
}

const PRO_FEATURES: IFeatureAvailability = {
  // ...
  [LicenseFeature.NEW_FEATURE]: true
}

// 3. Используйте в коде
if (featureChecker.isFeatureAvailable(LicenseFeature.NEW_FEATURE)) {
  // Использовать новую функцию
}
```

### Автоматическая фильтрация

BlockBuilder автоматически фильтрует недоступные функции:

- **Типы блоков**: В FREE версии ограничено до 5 типов
- **Поля форм**: Кастомные поля и API Select поля автоматически скрываются в FREE версии
- **Spacing брекпоинты**: Кастомные брекпоинты игнорируются в FREE версии, используются только дефолтные

### Реактивное обновление UI

При переходе с FREE на PRO лицензию, UI автоматически обновляется:

- Баннеры и бейджи лицензии
- Доступные типы блоков в форме добавления
- Отображаемые блоки на странице
- Доступные поля в формах редактирования

## 🎨 Кастомные типы полей

BlockBuilder поддерживает плагинную систему для создания собственных типов полей. Это позволяет внедрять сторонние библиотеки (например, WYSIWYG редакторы, date pickers, color pickers) в формы редактирования блоков.

### Основные понятия

**Custom Field Renderer** - это объект, который реализует интерфейс `ICustomFieldRenderer` и отвечает за рендеринг и управление кастомным полем.

### Быстрый старт

#### 1. Создайте Custom Field Renderer

**Vue 3:**
```javascript
// customFieldRenderers/WysiwygFieldRenderer.js
import { createApp } from 'vue'
import WysiwygEditor from './components/WysiwygEditor.vue'

export class WysiwygFieldRenderer {
  id = 'wysiwyg-editor'
  name = 'WYSIWYG Editor'

  render(container, context) {
    const { value, onChange, onError } = context

    const app = createApp(WysiwygEditor, {
      modelValue: value || '<p></p>',
      'onUpdate:modelValue': onChange
    })

    const instance = app.mount(container)

    return {
      element: container,
      getValue: () => instance.modelValue,
      setValue: (newValue) => { instance.modelValue = newValue },
      destroy: () => app.unmount()
    }
  }
}
```

**Pure JavaScript:**
```javascript
// customFieldRenderers/WysiwygFieldRenderer.js
import { createWysiwygEditor } from './components/WysiwygEditor.js'

export class WysiwygFieldRenderer {
  id = 'wysiwyg-editor'
  name = 'WYSIWYG Editor'

  render(container, context) {
    const { value, onChange } = context

    // Создаём новый wrapper для редактора
    const wrapper = document.createElement('div')
    wrapper.className = 'wysiwyg-field-wrapper'

    // Инициализируем редактор
    const editorAPI = createWysiwygEditor(wrapper, {
      value: value || '<p></p>',
      onChange: (newValue) => onChange(newValue)
    })

    return {
      element: wrapper,  // Возвращаем новый элемент!
      getValue: () => editorAPI.getValue(),
      setValue: (newValue) => editorAPI.setValue(newValue),
      destroy: () => editorAPI.destroy()
    }
  }
}
```

#### 2. Зарегистрируйте renderer

**Vue 3:**
```javascript
import { CustomFieldRendererRegistry } from '@mushket-co/block-builder/vue'
import { WysiwygFieldRenderer } from './customFieldRenderers/WysiwygFieldRenderer.js'

// В setup()
const customFieldRendererRegistry = new CustomFieldRendererRegistry()
const wysiwygRenderer = new WysiwygFieldRenderer()

// Регистрируем renderer
customFieldRendererRegistry.register(wysiwygRenderer)

// Передавайте customFieldRendererRegistry в BlockBuilderComponent как пропс
// :custom-field-renderer-registry="customFieldRendererRegistry"
```

**Pure JavaScript:**
```javascript
import { BlockBuilder } from '@mushket-co/block-builder'
import { WysiwygFieldRenderer } from './customFieldRenderers/WysiwygFieldRenderer.js'

const blockBuilder = new BlockBuilder({
  containerId: 'block-builder-app',
  blockConfigs: blockConfigs
})

// Регистрируем renderer
const wysiwygRenderer = new WysiwygFieldRenderer()
blockBuilder.registerCustomFieldRenderer(wysiwygRenderer)
```

#### 3. Используйте в конфигурации блока

```javascript
const blockConfigs = {
  richText: {
    title: 'Текстовый блок с визуальным редактором',
    icon: '📝',
    fields: [
      {
        field: 'content',
        label: 'Содержимое',
        type: 'custom',  // Указываем тип 'custom'
        customFieldConfig: {
          rendererId: 'wysiwyg-editor',  // ID вашего renderer'а
          options: {
            mode: 'default',
            placeholder: 'Введите текст...'
          }
        },
        rules: [
          { type: 'required', message: 'Содержимое обязательно' }
        ],
        defaultValue: '<p></p>'
      }
    ]
  }
}
```

### Интерфейс ICustomFieldRenderer

```typescript
interface ICustomFieldRenderer {
  id: string                    // Уникальный идентификатор
  name: string                  // Человекочитаемое название

  render(
    container: HTMLElement,     // Контейнер для рендеринга
    context: ICustomFieldContext // Контекст поля
  ): ICustomFieldRenderResult
}

interface ICustomFieldContext {
  fieldName: string             // Имя поля
  label: string                 // Лейбл поля
  value: any                    // Текущее значение
  required: boolean             // Обязательно ли поле
  rendererId: string            // ID renderer'а
  options?: Record<string, any> // Дополнительные опции
  onChange: (value: any) => void    // Callback при изменении
  onError?: (error: string | null) => void  // Callback для ошибок
}

interface ICustomFieldRenderResult {
  element: HTMLElement | string // DOM элемент или HTML строка
  getValue?: () => any          // Получить текущее значение
  setValue?: (value: any) => void   // Установить значение
  validate?: () => string | null    // Валидация (вернуть ошибку или null)
  destroy?: () => void          // Очистка ресурсов
}
```

### API для работы с Custom Fields

```javascript
// Регистрация одного renderer'а
blockBuilder.registerCustomFieldRenderer(renderer)

// Регистрация нескольких renderer'ов
blockBuilder.registerCustomFieldRenderers([renderer1, renderer2])

// Проверка наличия renderer'а
blockBuilder.hasCustomFieldRenderer('wysiwyg-editor') // true/false

// Получение renderer'а
const renderer = blockBuilder.getCustomFieldRenderer('wysiwyg-editor')

// Получение всех renderer'ов
const allRenderers = blockBuilder.getAllCustomFieldRenderers() // Map<string, ICustomFieldRenderer>

// Удаление renderer'а
blockBuilder.unregisterCustomFieldRenderer('wysiwyg-editor')
```

### Важные моменты

1. **Возвращайте новый элемент**: В `render()` метод получает `container`, но в `result.element` нужно вернуть **новый** HTMLElement, который будет добавлен в `container`.

2. **Управление lifecycle**: Используйте метод `destroy()` для очистки ресурсов (event listeners, mounted компонентов и т.д.).

3. **Не создавайте label вручную**: BlockBuilder автоматически создаёт label для поля, не нужно добавлять его в кастомном renderer'е.

4. **Изоляция**: Каждый экземпляр BlockBuilder имеет свой собственный реестр renderer'ов.

### Примеры

Полные рабочие примеры доступны в:
- **Vue 3**: `examples/vue3/src/customFieldRenderers/`
- **Pure JS**: `examples/pure-js-vite/src/customFieldRenderers/`


## 🧪 Тестирование

### 🚀 Команды тестирования

```bash
# Запуск всех тестов
npm test

# Тесты с отчетом покрытия кода
npm run test:coverage

# Тесты в watch режиме (автоматический перезапуск)
npm run test:watch

# Только unit тесты
npm run test:unit

# Только интеграционные тесты
npm run test:integration

# Для CI/CD
npm run test:ci

# С подробным выводом
npm run test:verbose

# Проверка типов
npm run type-check

# Линтинг
npm run lint
```

### 📁 Структура тестов

```
src/
├── __tests__/                      # Интеграционные тесты
│   └── BlockBuilderFacade.integration.test.ts
├── core/
│   ├── entities/__tests__/         # Тесты доменных сущностей
│   └── use-cases/__tests__/        # Тесты use cases
├── infrastructure/
│   ├── repositories/__tests__/     # Тесты репозиториев
│   ├── registries/__tests__/       # Тесты реестров
│   └── http/__tests__/             # Тесты HTTP клиента
└── utils/__tests__/                # Тесты утилит
```

## 🛠️ Разработка

```bash
# Установка зависимостей
npm install

# Сборка проекта
npm run build

# Разработка с watch
npm run dev

# Запуск сервера разработки
npm run start
```

## 📚 Примеры

Смотрите папку `examples/` для полноценных примеров использования:

### 🚀 Запуск примеров

```bash
# Vue3 пример (http://localhost:3001)
npm run example:vue3

# Pure JS + Vite (http://localhost:3002)
npm run example:pure-js

# API Usage (http://localhost:3003)
npm run example:api-usage

# CDN версия (http://localhost:3004)
npm run example:cdn
```

### 🎯 Доступные примеры

| Компонент | Порт | Описание |
|-----------|------|----------|
| **Основной dev-сервер** | 3000 | Разработка основного пакета (`npm run dev`) |
| **Vue3** | 3001 | Полноценное Vue3 приложение с SFC компонентами |
| **Pure JS (Vite)** | 3002 | Чистый JavaScript с современной сборкой |
| **API Usage** | 3003 | Использование только API без готового UI |
| **Pure JS (CDN)** | 3004 | Без сборки, для легаси проектов |

📖 **[Подробная документация примеров →](./examples/README.md)**

## 🎯 Преимущества чистой архитектуры

- **Тестируемость** - легко мокать порты
- **Независимость** - core не зависит от infrastructure
- **Гибкость** - легко менять реализации
- **Чистота** - четкое разделение ответственности

## 📄 Лицензия

MIT
