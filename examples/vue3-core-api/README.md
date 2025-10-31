# BlockBuilder - Vue3 Core API Example (Полный демо)

Пример использования **только Core API** пакета `block-builder` в Vue3 приложении. Демонстрирует все доступные методы API пакета.

## ✅ Что демонстрирует этот пример

### 🎨 Создание блоков
- Создание различных типов блоков (текст, изображения, карточки, hero секции)
- Настройка свойств блоков
- Автоматическая генерация метаданных

### 📊 Получение данных
- `getAllBlocks()` - получить все блоки
- `getBlocksCount()` - подсчет количества
- `getBlocksByType(type)` - фильтрация по типу
- `getBlock(id)` - получение конкретного блока

### 🔒 Управление блокировкой и видимостью
- `setBlockLocked(id, locked)` - блокировка/разблокировка
- `setBlockVisible(id, visible)` - показ/скрытие
- Визуальная индикация состояния блоков

### ✏️ Редактирование
- `updateBlock(id, updates)` - обновление свойств
- Редактирование через формы
- Живое обновление отображения

### 📄 Дублирование и удаление
- `duplicateBlock(id)` - дублирование блоков
- `deleteBlock(id)` - удаление
- `clearAllBlocks()` - очистка всех

### 🔄 Реорганизация
- `reorderBlocks(blockIds[])` - изменение порядка
- Движение блоков вверх/вниз
- Сохранение порядка

### 💾 Экспорт / Импорт
- `exportBlocks()` - экспорт в JSON
- `importBlocks(json)` - импорт из JSON
- Скачивание файлов
- Загрузка файлов
- Валидация импорта

### 🧩 Работа с компонентами
- `registerComponent(name, component)` - регистрация
- `getAllComponents()` - получение всех
- `hasComponent(name)` - проверка существования
- `unregisterComponent(name)` - удаление

### 🎨 Кастомные поля
- `registerCustomFieldRenderer(renderer)` - регистрация рендерера
- `getAllCustomFieldRenderers()` - получение всех
- `hasCustomFieldRenderer(id)` - проверка
- `unregisterCustomFieldRenderer(id)` - удаление

### ⚙️ Конфигурации
- `getBlockConfigs()` - все конфигурации
- `getBlockConfig(type)` - конфигурация типа
- `hasBlockType(type)` - проверка типа
- `getAvailableBlockTypes()` - список типов

## Установка

```bash
# Из корня проекта
npm install

# Или только для этого примера
cd examples/vue3-core-api
npm install
```

## Запуск

```bash
# Из корня проекта
npm run example:vue3-core-api

# Или из директории примера
cd examples/vue3-core-api
npm run dev
```

Приложение откроется на `http://localhost:5173`

## Отличия от обычного Vue3 примера

- ✅ Используется только `block-builder/core` - без UI компонентов пакета
- ✅ Все UI компоненты для редактирования и управления блоками создаются самостоятельно
- ✅ Полный контроль над UI/UX вашего приложения
- ✅ Демонстрация работы с чистым API пакета
- ✅ Панель логов для отслеживания всех операций
- ✅ Полный набор инструментов для тестирования API

## Структура

```
vue3-core-api/
├── src/
│   ├── App.vue                    # Главный компонент с логикой
│   ├── components/
│   │   ├── BlockList.vue          # Список блоков
│   │   ├── BlockFormModal.vue     # Модальное окно формы
│   │   ├── BlockTypeModal.vue     # Выбор типа блока
│   │   ├── BlockRenderer.vue      # Рендеринг блоков
│   │   └── blocks/                # Vue компоненты блоков
│   │       ├── TextBlock.vue
│   │       ├── ImageBlock.vue
│   │       ├── CardBlock.vue
│   │       └── HeroBlock.vue
│   ├── configs/
│   │   └── block-config.js        # Конфигурация блоков
│   ├── main.js
│   └── style.css
├── index.html
├── vite.config.js
└── package.json
```

## Полный список методов API

### Работа с блоками

| Метод | Описание | Параметры | Возвращает |
|-------|----------|-----------|------------|
| `createBlock(config)` | Создать блок | ICreateBlockDto | IBlockDto |
| `getBlock(id)` | Получить блок | string | IBlockDto \| null |
| `getAllBlocks()` | Все блоки | - | IBlockDto[] |
| `updateBlock(id, updates)` | Обновить | string, IUpdateBlockDto | IBlockDto \| null |
| `deleteBlock(id)` | Удалить | string | boolean |
| `duplicateBlock(id)` | Дублировать | string | IBlockDto \| null |
| `setBlockLocked(id, locked)` | Заблокировать | string, boolean | IBlockDto \| null |
| `setBlockVisible(id, visible)` | Показать/скрыть | string, boolean | IBlockDto \| null |
| `getBlocksByType(type)` | По типу | string | IBlockDto[] |
| `reorderBlocks(blockIds)` | Изменить порядок | string[] | boolean |
| `clearAllBlocks()` | Очистить все | - | void |
| `getBlocksCount()` | Подсчет | - | number |

### Работа с компонентами

| Метод | Описание | Параметры | Возвращает |
|-------|----------|-----------|------------|
| `registerComponent(name, component)` | Зарегистрировать | string, any | void |
| `registerComponents(components)` | Массовая регистрация | Record<string, any> | void |
| `getComponent(name)` | Получить | string | any \| null |
| `getAllComponents()` | Все компоненты | - | Record<string, any> |
| `hasComponent(name)` | Проверить | string | boolean |
| `unregisterComponent(name)` | Удалить | string | boolean |

### Работа с кастомными полями

| Метод | Описание | Параметры | Возвращает |
|-------|----------|-----------|------------|
| `registerCustomFieldRenderer(renderer)` | Зарегистрировать | ICustomFieldRenderer | void |
| `registerCustomFieldRenderers(renderers)` | Массовая регистрация | ICustomFieldRenderer[] | void |
| `getCustomFieldRenderer(id)` | Получить | string | ICustomFieldRenderer \| null |
| `getAllCustomFieldRenderers()` | Все рендереры | - | Map<string, ICustomFieldRenderer> |
| `hasCustomFieldRenderer(id)` | Проверить | string | boolean |
| `unregisterCustomFieldRenderer(id)` | Удалить | string | boolean |

### Утилиты

| Метод | Описание | Параметры | Возвращает |
|-------|----------|-----------|------------|
| `exportBlocks()` | Экспорт в JSON | - | string |
| `importBlocks(json)` | Импорт из JSON | string | boolean |
| `getBlockConfigs()` | Все конфигурации | - | Record<string, any> |
| `getBlockConfig(type)` | Конфигурация типа | string | any |
| `hasBlockType(type)` | Проверить тип | string | boolean |
| `getAvailableBlockTypes()` | Список типов | - | string[] |
| `destroy()` | Очистка ресурсов | - | void |

## Примеры использования

### Инициализация

```javascript
import { BlockBuilder } from '@mushket-co/block-builder/core'
import { blockConfigs } from './configs/block-config'

// Создаем BlockBuilder БЕЗ UI
const blockBuilder = new BlockBuilder({
  blockConfigs: blockConfigs,
  autoInit: false // Ручная инициализация
})
```

### CRUD операции

```javascript
// Создание
const block = await blockBuilder.createBlock({
  type: 'text',
  settings: {},
  props: { content: 'Мой текст' }
})

// Чтение
const block = await blockBuilder.getBlock(blockId)
const allBlocks = await blockBuilder.getAllBlocks()
const count = await blockBuilder.getBlocksCount()
const textBlocks = await blockBuilder.getBlocksByType('text')

// Обновление
await blockBuilder.updateBlock(blockId, {
  props: { content: 'Новый текст' }
})

// Удаление
await blockBuilder.deleteBlock(blockId)

// Дублирование
const duplicate = await blockBuilder.duplicateBlock(blockId)

// Очистка
await blockBuilder.clearAllBlocks()
```

### Блокировка и видимость

```javascript
// Блокировка
await blockBuilder.setBlockLocked(blockId, true)

// Разблокировка
await blockBuilder.setBlockLocked(blockId, false)

// Скрыть блок
await blockBuilder.setBlockVisible(blockId, false)

// Показать блок
await blockBuilder.setBlockVisible(blockId, true)
```

### Реорганизация

```javascript
// Изменить порядок блоков
const blocks = await blockBuilder.getAllBlocks()
const reversedIds = [...blocks].reverse().map(b => b.id)
await blockBuilder.reorderBlocks(reversedIds)
```

### Экспорт/импорт

```javascript
// Экспорт
const json = await blockBuilder.exportBlocks()

// Скачивание
const blob = new Blob([json], { type: 'application/json' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'blocks.json'
a.click()

// Импорт
const json = await fetch('blocks.json').then(r => r.text())
await blockBuilder.importBlocks(json)
```

### Работа с компонентами

```javascript
// Регистрация
blockBuilder.registerComponent('myComponent', {
  name: 'myComponent',
  template: '<div>Мой компонент</div>',
  props: {}
})

// Получение
const component = blockBuilder.getComponent('myComponent')

// Проверка
if (blockBuilder.hasComponent('myComponent')) {
  console.log('Компонент существует')
}

// Все компоненты
const allComponents = blockBuilder.getAllComponents()

// Удаление
blockBuilder.unregisterComponent('myComponent')
```

## Панель логов

Приложение включает панель логов, которая автоматически отображает:
- Создание блоков
- Обновления
- Удаления
- Дублирование
- Блокировку/разблокировку
- Изменение видимости
- Все API вызовы
- Экспорт/импорт
- Работу с компонентами
- Работу с кастомными полями

## Когда использовать

✅ **Используйте Core API в Vue3 когда:**
- Нужен полностью кастомный UI
- Интеграция в существующий Vue3 проект
- Специфичный UX
- Полный контроль над интерфейсом
- Интеграция с другими системами

❌ **НЕ используйте когда:**
- Подходит готовый UI пакета
- Нужно быстро прототипировать
- Нет требований к интерфейсу

## Технические детали

- **Фреймворк**: Vue3
- **Сборщик**: Vite
- **API**: Только core версия (без UI компонентов)
- **Хранение**: localStorage (можно настроить)
- **Типы**: TypeScript типы доступны

## Примечания

- Пример не попадает в npm публикацию
- Используется для демонстрации API
- Показывает все возможности пакета
- Готов к использованию в продакшене

