# BlockBuilder - Pure JS + Vite Example

Пример использования BlockBuilder с чистым JavaScript и современной Vite сборкой.

## ✅ Преимущества этого примера

1. **Без фреймворков** - чистый JavaScript, никаких зависимостей от Vue/React
2. **Современные ES модули** - импорты вместо глобальных переменных
3. **Настоящий Swiper из npm** - полноценный пакет вместо CDN
4. **Vite сборка** - быстрая разработка и оптимизированный продакшн
5. **Hot Module Replacement** - мгновенное обновление
6. **Tree-shaking** - только используемый код в финальной сборке

## Установка

```bash
# Из корня проекта
npm install

# Или только для этого примера
cd examples/pure-js-app
npm install
```

## Запуск

```bash
# Из корня проекта
npm run example:pure-js

# Или из директории примера
cd examples/pure-js-app
npm run dev
```

Приложение откроется на `http://localhost:3001`

## Структура

```
pure-js-vite/
├── src/
│   ├── components/
│   │   ├── WysiwygEditor.js   # WYSIWYG редактор (Jodit)
│   │   └── WysiwygEditor.css  # Стили редактора
│   ├── customFieldRenderers/
│   │   └── WysiwygFieldRenderer.js  # Renderer для кастомного поля
│   ├── block-config.js        # Конфигурация блоков
│   ├── main.js                # Точка входа
│   └── style.css              # Стили
├── public/
│   └── static-files/          # Статические файлы
├── index.html
├── vite.config.js
├── package.json
├── README.md                  # Этот файл
└── CUSTOM_FIELDS_README.md    # 📚 Руководство по кастомным полям
```

## Как это работает

### HTML Блоки

Простые блоки используют HTML templates:

```javascript
{
  render: {
    kind: 'html',
    template: (props) => `
      <div style="color: ${props.color}">
        ${props.content}
      </div>
    `
  }
}
```

### Custom Блоки (Swiper)

Сложные блоки используют императивный API:

```javascript
{
  render: {
    kind: 'custom',
    mount: (container, props) => {
      // Создаем HTML
      container.innerHTML = `...`
      
      // Инициализируем Swiper из npm пакета
      new Swiper(container.querySelector('.swiper'), {
        modules: [Navigation, Pagination, Autoplay],
        // ...конфигурация
      })
    }
  }
}
```

## Пример с Swiper

Этот пример показывает главное преимущество полноценной сборки:

```javascript
import Swiper from 'swiper'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Используем настоящий Swiper из npm!
new Swiper('.swiper', {
  modules: [Navigation, Pagination, Autoplay],
  // ...
})
```

В CDN версии нельзя импортировать модули так, потому что все работает через глобальные переменные.

## 🎨 Кастомные поля (Custom Fields)

Этот пример включает поддержку **кастомных полей** — мощного механизма для интеграции сложных компонентов в формы Block Builder.

### ✨ Что реализовано

- **WYSIWYG редактор Jodit** — полнофункциональный визуальный редактор
- **Типограф** — автоматическая типографская обработка текста
- **Защита от закрытия модалки** — popup'ы редактора не закрывают форму
- **Валидация** — проверка обязательности заполнения
- **Полный lifecycle** — правильная инициализация и очистка

### 📖 Подробная документация

Полное руководство по созданию своих кастомных полей см. в:
👉 **[CUSTOM_FIELDS_README.md](./CUSTOM_FIELDS_README.md)**

### Быстрый старт

```javascript
// 1. Импортируйте renderer
import { WysiwygFieldRenderer } from './customFieldRenderers/WysiwygFieldRenderer.js'

// 2. Зарегистрируйте его
blockBuilder.registerCustomFieldRenderer(new WysiwygFieldRenderer())

// 3. Используйте в конфиге блока
{
  field: 'content',
  label: 'Содержимое',
  type: 'custom',  // ← Тип 'custom'
  customFieldConfig: {
    rendererId: 'wysiwyg-editor',  // ← ID renderer'а
    options: { mode: 'default' }
  }
}
```

### Примеры блоков с кастомными полями

- **Rich Text** (`richText`) — блок с WYSIWYG редактором для форматированного текста

## Сборка для продакшн

```bash
npm run build
npm run preview
```

## Разница с CDN версией

| Функция | CDN версия | Vite версия |
|---------|------------|-------------|
| Импорты | `<script src="cdn">` | `import from 'package'` |
| Модули | Глобальные переменные | ES Modules |
| Сборка | Нет | Vite |
| HMR | Нет | Да |
| Tree-shaking | Нет | Да |
| npm пакеты | Очень ограничено | Любые |
| Размер бандла | Весь код загружается | Только используемый |

## Когда использовать этот подход

✅ **Используйте Pure JS + Vite когда:**
- Не нужен фреймворк
- Нужны современные возможности (ES modules, async/await и т.д.)
- Нужна оптимизация для продакшн
- Нужны npm пакеты

❌ **НЕ используйте когда:**
- Нужна реактивность компонентов (используйте Vue3 пример)
- Проект очень простой (используйте CDN версию)

## Примечания

- Этот пример не попадает в npm публикацию пакета
- Используется для локальной разработки и демонстрации
- Показывает использование в современных JS приложениях без фреймворков

