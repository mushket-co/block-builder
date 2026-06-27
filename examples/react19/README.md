# BlockBuilder — React 19 + Vite Example

Пример интеграции `@mushket-co/block-builder` в React-приложение с Vite (**React 19**, порт **3004**).

Для **React 18** — [`examples/react18`](../react18): тот же `src/`, порт **3005**.

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
npm run example:react19

# Или из папки примера
cd examples/react19
npm run dev
```

Приложение: `http://localhost:3004`

## Структура

```
react19/
├── src/
│   ├── App.tsx
│   ├── block-config.js
│   ├── components/blocks/     # React-компоненты блоков
│   └── customFieldRenderers/  # WYSIWYG и др.
├── mock-api-server.js
└── vite.config.js
```
