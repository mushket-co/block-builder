# BlockBuilder — React + Vite Example

Пример интеграции `@mushket-co/block-builder` в React-приложение с Vite.

## Что нужно для работы

1. **Алиас на исходники** — entry `@mushket-co/block-builder/react` отдаёт `.ts`/`.tsx`, поэтому в `vite.config.js` нужен alias на `src/react.ts` (как в `vue3`).

2. **Стили** — подключить CSS в `main.tsx`:
   ```ts
   import '@mushket-co/block-builder/index.esm.css'
   ```

3. **Регистрация блоков** — в `block-config.js` укажите `framework: 'react'` и передайте React-компоненты в `render.component`. Зарегистрируйте их в `componentRegistry`.

4. **Сохранение** — в demo используется `localStorage` через `examples/shared/blockStorage.js`. В production — ваш API/БД.

## Установка

```bash
# Из корня block-builder
npm run build
npm install
```

## Запуск

```bash
# Из корня
npm run example:react

# Или из папки примера
cd examples/react
npm run dev
```

Приложение: `http://localhost:3004`

## Структура

```
react/
├── src/
│   ├── App.tsx
│   ├── block-config.js
│   ├── components/blocks/     # React-компоненты блоков
│   └── customFieldRenderers/  # WYSIWYG и др.
├── mock-api-server.js
└── vite.config.js
```
