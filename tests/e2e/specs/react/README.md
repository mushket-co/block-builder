# React E2E (отложено)

Спеки зеркалят `vue3/`, но **не запускаются** в CI и `npm run test:e2e`:

- проект `react` закомментирован в `playwright.config.ts`
- preview `examples/react` не поднимается в `scripts/start-e2e-previews.mjs`

Включить после стабилизации React BlockBuilder:

1. Раскомментировать проект `react` в `playwright.config.ts`
2. Добавить сборку/preview react в `start-e2e-previews.mjs`
3. `npx playwright test --project=react`
