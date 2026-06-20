# Changelog

Все важные изменения в проекте будут документироваться в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/),
и проект следует [Semantic Versioning](https://semver.org/lang/ru/).


## [1.6.0] - 2026-06-20

### Добавлено

#### Поле `matrix-table`

- Тип поля `matrix-table` — редактор таблицы: колонки (тип ячейки, заголовок, nowrap, размер текста), строки с ячейками текста/HTML и изображений
- Vue: `MatrixTableControl`; React: `MatrixTableControl`
- Утилиты `matrixTableHelpers` (`createDefaultMatrixTableValue`, `normalizeMatrixTableValue`, `isMatrixTableStoredValue` и др.), валидация в `universalValidation`
- `resolveFormFieldDefaultValue` — дефолт `{ tableHead, tableBody }` для `matrix-table`
- Примеры: блок **Таблица** (`table`) в vue3, react, nuxt3, nuxt4 — `TableBlock`, `examples/shared/tableBlockDefaults.js`, иконка `examples/static/icons/table.svg`

#### SVG-спрайт иконок

- Обновлён единый спрайт: `arrowUp`, `arrowDown`, `delete`, `chevronDown`, `id`, `check`, `loader`, `close`
- Per-icon `viewBox`, классы `bb-icon--filled` / `bb-icon--stroke`; анимация `bb-icon--spin` для индикатора загрузки
- Хелперы `iconHelpers` для pure-js (`chevronDownIconHTML`, `checkIconHTML`, `loaderIconHTML` и др.)

### Изменено

#### Панель управления блоками (Vue, React, Pure JS, `BlockComponent`)

- Порядок кнопок: **Редактировать → Вверх → Вниз → ID → Дублировать → Видимость → Удалить**

#### Repeater (Vue, React, Pure JS)

- Сворачивание элемента: иконка `chevronDown` (поворот при раскрытии) вместо текстовых `▼`/`▲`
- Кнопка collapse — последняя в ряду действий; вертикальный разделитель перед ней
- Pure JS: `RepeaterControlRenderer` использует SVG из спрайта

#### Dropdown, api-select, загрузка файлов

- `CustomDropdown`, `ApiSelectField`, `SelectControlRenderer`, `ApiSelectControlRenderer`: `chevronDown` вместо `▼`, `check` вместо `✓`
- `ImageUploadField` (Vue/React) и pure-js renderers: `loader` вместо `⏳` при загрузке и инициализации полей

#### Matrix-table UX

- Поле «Размер текстовой ячейки» — `CustomDropdown` вместо нативного `<select>`
- Действия строк/колонок переиспользуют классы и стили repeater (без дублирования SCSS)

### Исправлено

- **Сохранение блока с `matrix-table`**: `UpdateBlockUseCase` принимает объект `{ tableHead, tableBody }` — устранена ошибка `Invalid prop value for key 'tableMatrix': must be primitive type` при изменении заголовков колонок
- **Fill-иконки в `.bb-control-btn`**: SVG с `fill` больше не получают лишний `stroke`, из‑за которого иконки выглядели жирнее

## [1.5.5] - 2026-06-20

### Добавлено

#### Поле `select` с `multiple: true`

- Множественный выбор для `type: 'select'` + `multiple: true` в Vue, React и Pure JS
- Утилита `resolveFormFieldDefaultValue` — дефолт `[]` для `select`/`api-select`/`image`/`file` с `multiple`; используется в `BlockBuilder`, `useBlockForm`, `RepeaterControl` (Vue/React/Pure JS)
- Vue/React: `SelectField` передаёт `multiple` в `CustomDropdown`, значение — массив
- Pure JS: `SelectFieldRenderer`, `SelectControlInitializer`, `SelectControlRenderer` — toggle-выбор, теги, JSON в hidden input
- Примеры: поле **«Темы (select, множественный выбор)»** в блоке **text** (vue3, react, nuxt3, nuxt4, pure-js-vite); отображение бейджей тем в `TextBlock`

#### UX множественного выбора (Vue/React)

- `CustomDropdown`: сводка выбранных значений через запятую в поле (до 3 + `+N`), теги с кнопкой удаления под полем
- Стили тегов через классы `bb-api-select__tag` (общие с api-select)

### Исправлено

#### Pure JS

- **Multi-select при редактировании блока**: выбранные значения не восстанавливались в форме — JSON в атрибуте `value` hidden input ломал разметку; исправлено кодирование `&quot;`, убран дублирующий hidden input, `updateHiddenInput` ищет поле в `bb-form-group`
- Тест: `generateEditFormHTML` сохраняет массив значений multi-select

## [1.5.1] - 2026-06-14
fix bug; repeater into depends

## [1.5.0] - 2026-06-14

### Добавлено

#### Поле `block-anchor`

- Тип поля `block-anchor` и конфиг `blockAnchorConfig` (`placeholder`, `allowCustomUrl`)
- Выбор якоря на блок страницы (`#block-id`) или произвольного URL
- Подписи опций: `props.title` / `props.name` через ` | ` + тип блока
- Vue: `BlockAnchorField`, контекст в `BlockBuilder`
- React: `BlockAnchorField`, `BlockAnchorContext`
- Pure JS: `BlockAnchorFieldRenderer`, `BlockAnchorControlInitializer`
- Утилиты `blockAnchorHelpers` и тесты
- Примеры: поле `url` в блоке **link** (vue3, react, pure-js-vite, nuxt3, nuxt4)

#### Загрузка файлов и изображений

- Отдельный UI для `type: 'file'` / `files`: `bb-file-upload-field` (список с бейджем расширения, именем и кнопкой удаления) — без галереи изображений
- Стили `_file-upload-field.scss`; кнопка выбора на `bb-btn bb-btn--outline`
- Pure JS: `FileUploadControlInitializer`, раздельная разметка в `ImageFieldRenderer.renderFileUploadField`
- Примеры **Текстовый блок**: поля `image`, `images`, `file`, `files` (одиночные и множественные)

#### Кнопки

- Темы `bb-btn--outline`, `bb-btn--dashed`, `bb-btn--block`, `bb-btn--loading` в `_buttons.scss`

#### Загрузка с лимитом

- `partitionFilesForUpload`, `getMaxUploadCountErrorMessage` в `uploadFieldUtils` — при превышении `maxCount` загружается только допустимое число файлов и показывается ошибка (Vue/React)

### Изменено

- Лимиты `check:bundle-size`: JS 180 KB, CSS 46 KB (рост из‑за `block-anchor`, file-upload UI и pure-js initializers)
- Кнопка «Добавить» в repeater: визуал через `bb-btn bb-btn--success bb-btn--block`; `bb-repeater-control__add-btn` оставлен только как служебный хук (Vue, React, Pure JS)
- Для file-полей превью-картинки отключено (`shouldShowUploadImagePreview` при `variant: 'file'`)

### Исправлено

#### Pure JS

- **Изображения в форме**: превью после загрузки для одиночного и множественного режима; галерея и динамическое создание DOM
- **Множественные файлы**: загрузка всех выбранных файлов (не только первого), с учётом `maxCount`
- **Сохранение file/image полей**: `ControlManager` регистрирует `FILE_UPLOAD_FIELD`; `FormController` читает hidden-значения (`data-file-value` / `data-image-value`); у `input[type=file]` убран `name`, чтобы не перетирать hidden при submit
- **`block-anchor`**: инициализация `.bb-block-anchor-placeholder` в `ControlManager`
- **Контекст якоря**: `getBlockAnchorContext` в `BlockUIController` (список блоков, `editingBlockId`, подписи типов)

### Удалено

- Vue-компонент `BlockProperties` и константы `BLOCK_PROPERTIES_*` из публичного API `@mushket-co/block-builder/vue` (не использовались в пакете и примерах)
- Мёртвый код react/pure-js: `FormField.tsx` (шим), `hooks/index.ts`, `FieldControlRegistry`, `control-initializers/index.ts` (нигде не импортировались)
- Кастомные стили `bb-repeater-control__add-btn` и `bb-file-upload-field__picker-btn` (визуал перенесён на `bb-btn`)

## [1.4.0] - 2026-06-13

### Добавлено

#### Индикатор ошибок валидации в футере модалки

- Кнопка с количеством ошибок валидации в форме создания/редактирования блоков
- Клик по индикатору скроллит к первому полю с ошибкой (тот же UX, что при «Сохранить» с ошибками)
- Работает в Pure JS (`ModalManager` + `FormController`), Vue (`BlockBuilder`) и React (`BlockFormModal`)
- Утилиты `countValidationErrors`, `getSortedErrorKeys`; метод `ValidationErrorHandler.navigateToValidationError`
- CSS-класс `VALIDATION_ERROR_INDICATOR` (`.bb-validation-error-indicator`)

#### Реактивная валидация формы

- После неуспешного submit форма переходит в режим «touched»: ошибки обновляются на каждом изменении поля
- Общий трекер `ReactiveFormValidationTracker` и хелпер `applyFormErrors` — экспорт из `@mushket-co/block-builder/core`
- Pure JS (`FormController`), Vue (`BlockBuilder`, composable `useBlockForm`), React (`useBlockForm`)

### Изменено

- Pure-JS контролы (spacing, repeater, select, api-select, custom) триггерят перевалидацию через `onFieldChange` в `ControlInitializerFactory`

### Исправлено

- **CustomField (Vue/React)**: `setError` у кастомного рендерера вызывается только при изменении текста ошибки — WYSIWYG-редактор не теряет фокус при реактивной валидации

## [1.3.2] - 2026-06-10
minors

## [1.3.1] - 2026-06-10

### Добавлено

#### Предупреждение при уходе со страницы с несохранёнными блоками

- Опция `warnOnPageLeave` для Vue (`BlockBuilder`), React (`BlockBuilder`), Pure JS (`BlockBuilder` facade)
- При включённом флаге и отличии текущих блоков от `initialBlocks` браузер показывает нативное предупреждение перед перезагрузкой/закрытием вкладки
- В режиме просмотра (`isEdit: false`) предупреждение не показывается, в том числе при переключении через `setIsEdit(false)`
- После успешного `onSave` базовая линия сбрасывается — предупреждение не показывается
- Core-утилиты: `haveBlocksChanged`, `attachPageLeaveWarning`, `createUnsavedChangesTracker`, `shouldActivatePageLeaveWarning` (экспорт из `@mushket-co/block-builder/core`)
- Хуки `usePageLeaveWarning` для Vue и React (кастомный UI без готового `BlockBuilder`)

### Изменено

#### Единый источник CSS-классов

- Полный аудит Vue/React/Pure JS/core и тестов (component, e2e): классы `bb-*` только через `CSS_CLASSES` из `src/utils/constants.ts`
- Расширены константы: `TOGGLE_CONTROL_*`, `API_SELECT`, `IMAGE_UPLOAD_*`, `BLOCK_BUILDER_ROOT`, `BLOCK_PROPERTIES_*`, `CUSTOM_FIELD_CONTAINER`, `getControlsFixedClass()` и др.
- Счётчик блоков в панели управления: внутри `.bb-stats` используется `<span>`, не `<p>`
- SSR/component-тесты на отсутствие скрытого контента в view HTML

#### Api-select (Vue, React, Pure JS)

- **Поиск и выбранное значение разделены**: при закрытом дропдауне показывается только label выбранного элемента или placeholder; поле поиска видно только при открытом дропдауне (переключение через CSS-модификаторы `--hidden`, инпут всегда в DOM для фокуса)
- **`debounceMs` в `apiSelectConfig`**: по умолчанию `0` (запрос сразу); при `> 0` — debounce поискового запроса. Общая утилита `scheduleApiSelectSearch` в `src/utils/apiSelectSearchDebounce.ts`
- **Кнопка «Загрузить ещё»** отображается только при `hasMore: true` в ответе API (убрано условие `items.length === 0`)
- **Примеры** (`examples/*/block-config.js`): `debounceMs: 1500` для демонстрации отложенного поиска
- **CustomDropdown**: убрана обработка клавиши пробел (остался Enter для выбора с клавиатуры)

### Удалено

- Мёртвый и deprecated-код: `logger.ts`, `safeDOM.ts`, `BlockFormConfigs` / `FormUtils` в `universalValidation.ts`, неиспользуемые хелперы в `renderHelpers.ts`, `blockSpacingHelpers.ts`, `domSafe.ts` (кроме `parseJSONFromAttribute`), висячий `initializeAllControls` в `BlockUIController`
- Неиспользуемые строки `UI_STRINGS` и `ERROR_MESSAGES`; артефакт `lint-output.txt`

### Исправлено

- **Pure JS: radio в формах** — `FormController.getFormData()` сохраняет выбранное значение группы, а не первый input
- **React component-тесты** — `cleanupReactTestHost()` размонтирует React перед очисткой DOM (устранён `window is not defined` после teardown)
- **Api-select: поиск при открытии** — запрос уходит без `search`, выбранное значение не подставляется в поле поиска
- **Api-select: React** — debounce поиска отставал на символ (stale closure); очистка через ✕ не убирала текст до переоткрытия дропдауна (`modelValueRef` / синхронная гидратация после `clear`)
- **Api-select: Vue** — клик по всему полю снова открывает дропдаун (убран дублирующий handler, конфликтовавший с `CustomDropdown`)
- **Api-select: клавиатура** — пробел в поле поиска больше не выбирает опцию и не закрывает дропдаун (`@keydown.stop` на инпуте)

## [1.3.0] - 2026-06-10

### Изменено

#### Видимость блоков (Vue, React, Pure JS, core API)

- В режиме редактирования скрытые блоки остаются в DOM с классом `bb-opacity-hidden` (флаг `visible: false` только в данных)
- В режиме просмотра скрытые блоки не попадают в DOM (SEO/боты не видят контент)
- Экспорт `filterBlocksForDisplay` из `@mushket-co/block-builder/core` для пользовательского UI
- Все CSS-классы в компонентах и тестах используют `CSS_CLASSES` из `constants.ts` (без захардкоженных строк)

#### Реструктуризация `src/ui` по слоям UI

- **`src/vue/`** — только Vue (`components/`, `composables/`)
- **`src/react/`** — только React (без изменений пути)
- **`src/pure-js/`** — Pure JS (`controllers/`, `EventDelegation`, DOM-рендереры)
- **`src/shared/`** — общий presentation-слой: `icons/`, `styles/`, `ValidationErrorHandler`, `BlockScrollService`, `NotificationService`, `dom/domClassHelpers`
- Entry points и `package.json` `files` обновлены под новые пути
- **`tests/component/vue/`** — Vue component-тесты вынесены из корня `tests/component/` (симметрия с `tests/component/react/`)
- **`tests/component/helpers/`** — общие test-хелперы (`mockUseCases`)

### Добавлено

#### Поддержка React в пакете

- **Entry `@mushket-co/block-builder/react`**: `BlockBuilderComponent`, core API, SSR-хелперы
- **`renderHelpers.isRenderableReactComponent`**: проверка валидного React-компонента после JSON
- **`blockDisplayHelpers`**: `canRenderReactBlock`, `resolveReactComponentForBlock`; `enrichBlockForDisplay` поддерживает `framework: 'react'`
- **React UI** (`src/react/`): декомпозиция как у Vue — `hooks/useBlockBuilder`, `useBlocks`, `useBlockForm`, `useModals`, `components/form-fields/*`, `CustomDropdown`, `SpacingControl`, `RepeaterControl`, `ApiSelectField`, `CustomField`, `ImageUploadField`, модалки и панель блоков

#### Пример React + Vite (`examples/react`)

- Полный набор блоков как в `vue3`, `framework: 'react'`
- `npm run example:react`, порт **3004**

#### Пример Next.js SSR (`examples/next`)

- App Router: Server Component загружает блоки, Client Component — `BlockBuilderComponent`
- `enrichBlocksForSsr`, Route Handlers `/api/blocks`, mock API для api-select
- Блоки переиспользуются из `examples/react` через alias `@react-example`
- `npm run example:next`, порт **3008**

### Исправлено

- **Скролл к новому блоку (Vue, React)**: верх блока иногда обрезался из-за неточного `scrollIntoView` в nested scroll-контейнере; исправлено в общем `BlockScrollService`
- **`NewsListBlock` (React example)**: SSR-данные (`featuredNews`, `newsItems`) не использовались — в view-source отображалась заглушка вместо новостей
- **`WysiwygEditor` (React example)**: правки типов для сборки Next.js

## [1.2.0] - 2026-06-09

### Добавлено

#### SSR-поддержка в пакете (Vue)

- **`src/utils/ssr.ts`**: утилиты `isClient` / `isServer`, флаг `enableViewportBreakpointDetection()` для корректной гидрации spacing
- **`blockDisplayHelpers.ts`**: `prepareBlocksForDisplay`, `enrichBlockForDisplay`, `canRenderVueBlock`, `resolveVueComponentForBlock` — восстановление `render` после JSON и резолв компонентов через registry
- **`blockRepositorySync.ts`**: `seedRepositoryFromBlocks` — синхронизация in-memory репозитория с `initialBlocks` при SSR/гидрации
- **`renderHelpers.isRenderableVueComponent`**: отличие валидного Vue-компонента от «битой» копии после `deepClone` / `JSON.stringify`
- **`breakpointHelpers.getDefaultBreakpoint`**: desktop breakpoint на сервере и до завершения гидрации на клиенте
- **Экспорт из `@mushket-co/block-builder/vue`**: SSR-хелперы, `blockDisplayHelpers`, `seedRepositoryFromBlocks`, `getDefaultBreakpoint`

#### Примеры Nuxt (`examples/nuxt3`, `examples/nuxt4`)

- **Nuxt 3** (`npm run example:nuxt3`, порт **3006**): SSR-страница, `useAsyncData` + Nitro API (`GET/POST /api/blocks` → `data/blocks.json`), composable `useBlockBuilder`, полный набор блоков как в `vue3`
- **Nuxt 4** (`npm run example:nuxt4`, порт **3007**): та же интеграция в структуре Nuxt 4 (`app/`, `shared/`, `server/`), `compatibilityVersion: 4`
- **Серверное обогащение блоков** (`enrichBlocks`): денормализация `newsItems` для блока «Список новостей из API» (SEO в HTML)
- **Клиентское обогащение** (`enrichNewsListClient`): восстановление `newsItems` после редактирования блока
- **`serializeBlocksForStorage`**: безопасная сериализация для API (без `render.component`, strip base64, без рекурсии в Vue-компоненты)
- **`stripEnrichedProps`**: удаление SSR-кэша (`newsItems`) перед `UpdateBlockUseCase` и сохранением
- Mock API: `/api/news`, `/api/articles`, `/api/upload` (multipart через `readMultipartFormData`)
- Workspaces и скрипты: `example:nuxt3`, `example:nuxt4`

#### Тесты

- **Unit (Jest)**: `tests/unit/blockDisplayHelpers.test.ts`, `tests/unit/breakpointHelpers.ssr.test.ts`
- **Component (Vitest)**: `tests/component/BlockBuilder/ssr-render.spec.ts` — рендер `initialBlocks` в SSR HTML (режимы edit/view)

#### Документация

- **`examples/README.md`**: разделы Nuxt 3 / Nuxt 4
- **`examples/nuxt3/README.md`**, **`examples/nuxt4/README.md`**: установка, SSR, структура проекта

### Изменено

- **`BlockBuilder.vue`**: синхронная инициализация `blocks` из `initialBlocks` в `setup`; `syncBlocksWithRepository` вместо слепого `createBlock` для каждого initial-блока; резолв Vue-компонентов через registry; DOM-логика (`initIcons`, scroll lock, breakpoint watchers) только на клиенте; пересчёт spacing после `onMounted`
- **`breakpointHelpers`**: `getCurrentBreakpoint` и `watchBreakpointChanges` учитывают SSR и фазу гидрации
- **`domClassHelpers.updateBodyEditModeClass`**: guard для `document.body` на сервере
- **`ImageUploadField.vue`**: понятное сообщение при `Failed to fetch`
- **`examples/README.md`**: ссылка на Nuxt-примеры

### Примечания

- **SSR**: контент пользовательских Vue-блоков рендерится на сервере при передаче `initialBlocks` и регистрации компонентов в `componentRegistry`
- **Обратная совместимость**: публичный API расширен; поведение `BlockBuilder` при `initialBlocks` изменено осознанно (SSR-first)


## [1.1.0] - 2026-06-06

### Добавлено

#### Функциональность (Vue3)

- **ToggleControl компонент**: Новый Vue компонент для переключаемых групп полей (checkbox + зависимые поля)
- **Поддержка `dependsOn`**: Условное отображение полей на основе значений других полей (только Vue3)
- **Типы `IDependsOnConfig`**: Конфигурация условного отображения с операторами (`equals`, `notEquals`, `in`, `notIn`)
- **Валидация скрытых полей**: Поля, скрытые через `dependsOn`, не участвуют в валидации
- **Пример nested repeater**: Блок «Каталог с вложенными репитерами» в `examples/vue3` и `examples/pure-js-vite`

#### Автотестирование (три слоя)

- **Unit / integration (Jest)**: ~573 теста в `src/**/__tests__/` — use cases, validators, pure-JS renderers, `FormController`, `ValidationErrorHandler`, `formErrorHelpers`
- **Component (Vitest)**: 21 тест в `tests/component/` — Vue-компоненты, BlockBuilder, repeater, `dependsOn`, validation UX
- **E2E (Playwright)**: 19 тестов в `tests/e2e/` — сценарии E01–E05 для **vue3** (port 3001) и **pure-js** (port 3002): smoke, CRUD, form controls, nested repeater, validation UX (раскрытие accordion при ошибках)
- **Fixtures и page objects**: `tests/fixtures/`, `BlockBuilderPage`, `BlockFormPage` (BEM-селекторы, без `data-testid`)
- **Конфиги**: `vitest.config.ts`, `playwright.config.ts`, `tests/e2e/global-setup.ts`
- **npm-скрипты**: `test:component`, `test:e2e`, `test:ci:full`, `test:all`, `check:bundle-size`

#### CI и качество сборки

- **GitHub Actions**: отдельные jobs `test` (Jest + component), `e2e` (Playwright), `quality` (bundle size gate)
- **`scripts/check-bundle-size.mjs`**: лимиты на размер `dist/*.js` и CSS; падение CI при превышении
- **Publish workflow**: полный прогон `test:ci:full` перед npm publish

#### Документация для разработчиков

- **`README_DEV.md`**: локальная разработка, архитектура, тестирование, CI, чеклисты для новых фич
- Ссылка на `README_DEV.md` в корневом `README.md`

### Изменено

- **Лицензирование удалено**: Пакет полностью бесплатный под MIT. Убраны LicenseService, проверка ключей, ограничения FREE/PRO, UI-баннеры и badges
- **Публичный API**: Удалены экспорты `License`, `LicenseService`, `LicenseFeatureChecker`; опции `license`, `licenseKey`, `licenseService` больше не поддерживаются
- **`BlockBuilderFacade` / `BlockBuilder.vue`**: Убрана интеграция с лицензированием; composable `useLicense` удалён
- **`UniversalValidator.validateRepeaterRecursive`**: Валидация полей внутри репитеров с учётом `dependsOn`
- **`BlockBuilder.vue`**: `isFieldVisible`, интеграция ToggleControl и группировка зависимых полей
- **`RepeaterControl.vue`**: ToggleControl и `dependsOn` внутри элементов репитера
- **`core/types/form.ts`**: Опциональное свойство `dependsOn?: IDependsOnConfig` в `IFormFieldConfig` и `IRepeaterItemFieldConfig`
- **Examples**: preview-порты для E2E — vue3 `:3001`, pure-js-vite `:3002`

### Удалено

- **`LICENSE-PRO.md`**, **`ToggleControl-usage.md`** (описание ToggleControl — на [block-builder-doc.vercel.app](https://block-builder-doc.vercel.app/) и в `README_DEV.md`)
- **`src/core/entities/License.ts`**, **`LicenseService`**, **`LicenseFeatureChecker`**
- **`src/ui/composables/useLicense.ts`**
- Экспорт и UI, связанные с PRO/FREE tier

### Исправлено

- **Валидация скрытых полей с `dependsOn`**: Скрытые поля больше не блокируют сохранение формы
- **Валидация в репитерах**: Учитывается видимость полей внутри каждого элемента репитера
- **Validation UX**: Раскрытие accordion репитера и scroll к первой ошибке (Vue `ValidationErrorHandler`, pure-JS `BlockUIController`)
- **E2E page object**: Убрано ложное ожидание repeater при выборе типов блоков без репитера (лишний 10s timeout в отчёте Playwright)

### Примечания

- **ToggleControl и `dependsOn` — только Vue3**. Pure-JS не получает эти возможности (политика версии 1.1.0)
- **Обратная совместимость**: Поля без `dependsOn` работают как раньше; breaking change — только удаление API лицензирования
- **Coverage Jest ~40%** — нормально: Vue (`.vue`) и E2E покрываются Vitest и Playwright, не Jest
- **Полный локальный прогон перед PR**: `npm run test:ci:full` и `npm run check:bundle-size`

### Политика поддержки версий

**Начиная с версии 1.1.0:**

- ✅ **Фреймворки (Vue, React)**: Все новые функции и улучшения — только для версий с поддержкой фреймворков
- 🔒 **Pure-JS версия**: Фиксирована на **1.0.30** — только критические security fixes, без новых фич
- 📈 **Развитие**: Основной фокус — Vue3 (React в планах)


## [1.0.30] - 2025-01-XX

### Добавлено
- **Vue Composables**: Добавлены композаблы для разделения логики компонентов (`useBlockForm`, `useBlocks`, `useModals`, `useLicense`) в `src/ui/composables/`
- **ControlManager**: Новый централизованный менеджер для управления жизненным циклом контролов форм (инициализация, отслеживание активных контролов, корректное удаление)
- **ControlInitializerFactory**: Фабрика для создания и регистрации инициализаторов контролов различных типов (ApiSelect, CustomField, ImageUpload, Repeater, Select, Spacing)
- **Система инициализаторов контролов**: Добавлены отдельные инициализаторы для каждого типа контрола в `src/ui/services/control-initializers/` (ApiSelectControlInitializer, CustomFieldControlInitializer, ImageUploadControlInitializerWrapper, RepeaterControlInitializer, SelectControlInitializer, SpacingControlInitializer)
- **FormController**: Новый контроллер для управления формами создания и редактирования блоков с поддержкой валидации и обработки ошибок
- **NotificationService**: Сервис для отображения уведомлений пользователю (success, error, info) с автоматическим скрытием
- **ValidationErrorHandler**: Обработчик ошибок валидации с автоматическим раскрытием аккордеонов репитеров и скроллом к первому полю с ошибкой
- **FieldControlRegistry**: Реестр для управления контролами полей форм
- **IControlRenderer и IControlInitializer**: Интерфейсы для унификации работы с контролами и их инициализаторами
- **domClassHelpers**: Утилиты для работы с CSS классами DOM элементов
- **Экспорт composables**: Добавлен экспорт всех composables через `src/ui/composables/index.ts`

### Изменено
- **BlockBuilder.vue**: Рефакторинг на использование composables (`useBlockForm`, `useBlocks`, `useModals`, `useLicense`) для улучшения читаемости и переиспользования логики
- **BlockUIController.ts**: Переработан для использования новой системы управления контролами через `ControlManager` и `ControlInitializerFactory`; добавлена интеграция с `FormController`
- **UIRenderer.ts**: Обновлен для работы с новой системой инициализации контролов через `ControlManager`
- **RepeaterControlRenderer.ts**: Адаптирован для работы с новой системой инициализаторов; улучшена интеграция с `ControlManager`
- **CustomFieldControlRenderer.ts**: Обновлен для использования новой архитектуры инициализации контролов
- **ApiSelectControlRenderer.ts**: Интегрирован с новой системой управления контролами
- **EventDelegation.ts**: Улучшена обработка событий и интеграция с новой системой контролов
- **formErrorHelpers.ts**: Расширена функциональность для работы с новой системой валидации и обработки ошибок
- **universalValidation.ts**: Улучшена валидация форм с поддержкой новой архитектуры
- **logger.ts**: Обновлен для лучшей интеграции с системой уведомлений
- **Компоненты форм Vue3**: Обновлены компоненты (`FormField`, `ApiSelectField`, `ImageUploadField`, `CheckboxField`, `ColorField`, `NumberField`, `RadioField`, `SelectField`, `TextField`, `TextareaField`) для работы с новой системой управления контролами
- **Примеры**: Обновлены примеры в `examples/vue3`, `examples/pure-js-vite`, `examples/pure-js-cdn` для демонстрации новой архитектуры
- **Примеры кастомных полей**: Обновлены примеры WYSIWYG редактора (`WysiwygFieldRenderer`) в `examples/vue3` и `examples/pure-js-vite` для корректной работы с новой системой управления контролами через `ControlManager` и `CustomFieldControlInitializer`; улучшена интеграция с валидацией и обработкой ошибок

### Исправлено
- **Утечки памяти контролов**: Исправлены утечки памяти при удалении контролов - теперь контролы корректно удаляются через `ControlManager.destroyControl()` и `destroyControlsInContainer()`
- **Инициализация контролов**: Исправлена проблема повторной инициализации контролов - добавлена проверка флага `data-control-initialized` для предотвращения дублирования
- **Обработка ошибок валидации**: Улучшена обработка и отображение ошибок валидации с автоматическим раскрытием вложенных репитеров и скроллом к первому полю с ошибкой
- **Синхронизация значений контролов**: Исправлена синхронизация значений между контролами и данными формы при валидации и отправке формы


## [1.0.28] - 2025-11-22

### Добавлено
- **Вложенные репитеры (Nested Repeaters)**: Добавлена поддержка репитеров внутри репитеров для создания сложных вложенных структур данных
- **Свойство `maxNestingDepth`**: Добавлено свойство `maxNestingDepth` в `IRepeaterFieldConfig` для ограничения максимальной глубины вложенности (по умолчанию 2)
- **Свойство `repeaterConfig` в полях репитера**: Поля типа `repeater` внутри репитера теперь могут иметь собственную конфигурацию через `repeaterConfig` в `IRepeaterItemFieldConfig`
- **Поддержка вложенных путей полей**: Обновлена система валидации и обработки ошибок для корректной работы с вложенными путями полей вида `categories[0].products[1].name`
- **Автоматическое раскрытие вложенных репитеров**: При наличии ошибок валидации во вложенных репитерах автоматически раскрываются соответствующие аккордеоны для отображения ошибок
- **Пример блока с вложенными репитерами**: Добавлен пример `NestedRepeaterBlock.vue` в `examples/vue3/src/components/` для демонстрации использования вложенных репитеров (категории товаров с продуктами)

### Изменено
- **RepeaterControl.vue**: Добавлена поддержка вложенных репитеров через пропсы `nestingDepth`, `maxNestingDepth` и `parentFieldPath`; рекурсивный рендеринг вложенных репитеров
- **RepeaterControlRenderer.ts**: Реализована поддержка вложенных репитеров с отслеживанием глубины вложенности и управлением вложенными рендерерами; добавлены методы `generateNestedRepeaterHTML()`, `renderNestedRepeaters()`, `getNestedErrors()`
- **BlockUIController.ts**: Обновлена логика поиска и обработки вложенных репитеров; добавлен метод `findNestedRepeaterRenderer()` для навигации по вложенным структурам; улучшена обработка ошибок валидации во вложенных репитерах
- **formErrorHelpers.ts**: Расширена поддержка вложенных путей полей; добавлены поля `nestedFieldName` и `nestedPath` в `IRepeaterErrorInfo`; реализована функция `findNestedRepeaterField()` для поиска полей во вложенных репитерах
- **universalValidation.ts**: Обновлена валидация для корректной обработки путей полей во вложенных репитерах
- **core/types/form.ts**: Добавлено свойство `repeaterConfig?: IRepeaterFieldConfig` в `IRepeaterItemFieldConfig` для поддержки вложенных репитеров
- **Примеры конфигураций**: Обновлены примеры в `examples/vue3` и `examples/pure-js-vite` с демонстрацией вложенных репитеров

### Исправлено
- **Валидация вложенных полей**: Исправлена обработка ошибок валидации для полей во вложенных репитерах - ошибки корректно отображаются и привязываются к соответствующим полям
- **Скролл к ошибкам во вложенных репитерах**: Исправлен скролл к полям с ошибками валидации во вложенных репитерах - автоматически раскрываются все необходимые аккордеоны
- **Обновление значений во вложенных репитерах**: Исправлена синхронизация значений при изменении полей во вложенных репитерах в pure-JS версии


## [1.0.26] - 2025-11-16

### Добавлено
- Новые утилиты: `scrollLock` и `repeaterCountText` для улучшения UX списков и модалок
- Типы: добавлен `src/types/vue-shim.d.ts` для корректной работы деклараций Vue в пакете
- Типы (repeater): добавлено свойство `countLabelVariants` в `IRepeaterFieldConfig` для задания форм слова в счётчике (`one/few/many/zero`)
- Иконки для примеров: добавлены SVG в `examples/static/icons` (accordion, button, card, divider, form, gallery, hero, image, rich-text, slider, spaced-text, spacer, tabs, text, video)
- Scroll Lock API: возможность глобального переопределения поведения через `setScrollLockHandlers({ lock, unlock })`

### Изменено
- Block configs (icon): свойство `icon` унифицировано — ожидается URL (или путь) для `<img>`. Отрисовка и в Vue, и в Pure‑JS приводится к единому виду
- Компоненты форм Vue3 (`FormField` семейство, `ApiSelectField.vue`, `SelectField.vue`, `CheckboxField.vue`, `RadioField.vue`, `TextField.vue`, `TextareaField.vue`, `NumberField.vue`, `ImageUploadField.vue`, `SpacingControl.vue`, `RepeaterControl.vue`) — улучшен UX, единообразие состояний, валидация и управление фокусом
- Кастомный дропдаун (`CustomDropdown.vue`) — стабилизировано позиционирование, управление клавиатурой, сохранение/восстановление скролла, улучшена работа на мобильных с виртуальной клавиатурой
- Рендереры и контроллеры UI (`ApiSelectControlRenderer`, `SelectControlRenderer`, `SpacingControlRenderer`, `RepeaterControlRenderer`, `CustomFieldControlRenderer`, `UIRenderer`, `ModalManager`, `BlockUIController`) — унификация API, корректное снятие обработчиков, улучшение производительности и предсказуемости состояний
- Формы и типы (`src/core/types/form.ts`, `BlockBuilderFacade.ts`) — синхронизация типов и публичного API
- Стили (`_base.scss`, `_utilities.scss`, `_variables.scss`, компоненты в `src/ui/styles/components/*`, `index.scss`) — унификация токенов, состояний и БЭМ-структуры; исправление визуальных артефактов
- Примеры (`examples/*` включая `pure-js-vite`, `vue3`, `vue3-core-api`, `pure-js-cdn`, `api-usage`) — обновлены конфиги блоков и демо для новых возможностей
- `package.json` — обновление версии и экспорта для согласованности c типами/точками входа
- Repeater (счётчик): по умолчанию отображается только число; при наличии `countLabelVariants` — формат “число + слово”. Логика вынесена в общий util `repeaterCountText` и используется в Vue и pure‑js
- Spacing (pure‑js): разметка унифицирована с Vue — добавлен внутренний контейнер `bb-spacing-control` внутри `bb-spacing-control-container`
- CSS классы: повсеместная замена хардкоженных строк на `CSS_CLASSES` в JS/TS частях (поиск, скролл, селекторы)

### Исправлено
- Api Select: корректное позиционирование выпадающего списка в скроллируемых контейнерах, стабильная работа загрузки/дозагрузки и сохранение позиции скролла
- Api Select (pure‑js): исправлен поиск контейнеров по `CSS_CLASSES.API_SELECT_CONTROL_CONTAINER` — устранено зависание “⏳ Инициализация...”
- Select/Checkbox/Radio: корректное отображение активного/disabled/invalid состояний, синхронизация значения и отображения
- Modal/Overlay: устранены утечки обработчиков, улучшено блокирование скролла страницы
- UIRenderer/BlockUIController: предсказуемое удаление/размонтирование UI, корректная инициализация контролов
- Безопасность DOM: улучшена безопасность вспомогательных утилит (`safeDOM`, `domSafe`, `formErrorHelpers`)
- Валидация/скролл: корректный скролл к первому невалидному полю изображения внутри repeater (унификация селекторов и поиска поля)

### Удалено
- `examples/vue3/src/components/*` устаревшие компоненты демо (перенос/замена на актуальные примеры блоков)


## [1.0.24] - 2025-11-13

### Исправлено
- **FetchHttpClient.ts**: Исправлена обработка относительных URL - теперь `fetch()` корректно работает с относительными путями (например, `/api/news`). Используется `new URL(url, base)` для правильной обработки query параметров при сохранении относительного формата URL
- **ApiSelectUseCase.ts**: Улучшена валидация конфигурации - теперь относительные URL (начинающиеся с `/`) считаются валидными наряду с абсолютными URL
- **ApiSelectField.vue**: Исправлена позиция дропдауна при открытии - добавлено обновление позиции при открытии дропдауна, особенно важно для полей в репитере, которые могут быть в скроллируемой области. Позиция также обновляется после загрузки данных и после завершения загрузки
- **SpacingFieldRenderer.ts**: Исправлена структура передачи breakpoints - теперь `spacingConfig` передается как `config`, что позволяет корректно извлекать кастомные breakpoints из `spacingOptions.config.breakpoints` в pure-js версии
- **mock-api-server.js** (vue3 и pure-js-vite): Добавлена обработка эндпоинта `/api/articles` для поддержки api-select полей с относительными URL в блоках "Богатые карточки" и других блоках

### Изменено
- **ApiSelectField.vue**: Улучшено обновление позиции дропдауна - позиция обновляется при открытии, после загрузки данных и после завершения загрузки для корректного отображения в скроллируемых контейнерах

## [1.0.23] - 2025-11-13

### Добавлено
- **CustomDropdown.vue**: Создан универсальный компонент дропдауна для Vue3 с поддержкой одиночного и множественного выбора, клавиатурной навигации, позиционирования с учетом viewport и виртуальной клавиатуры, обнаружения прокручиваемых предков
- **BaseDropdownRenderer.ts**: Базовый класс для рендереров дропдаунов в pure-JS с общей логикой позиционирования, открытия/закрытия, обработки событий
- **SelectControlRenderer.ts**: Реализация кастомного select контрола для pure-JS на основе BaseDropdownRenderer с поддержкой клавиатурной навигации, сохранения позиции скролла при обновлении
- **_dropdown.scss**: Стили для универсального компонента дропдауна с поддержкой всех состояний (открыт, disabled, invalid, multiple)
- **Методы сохранения скролла**: Добавлены методы `saveScrollPosition()` и `restoreScrollPosition()` в CustomDropdown для сохранения позиции скролла при подгрузке данных

### Изменено
- **ApiSelectField.vue**: Рефакторинг на использование CustomDropdown компонента, добавлено сохранение позиции скролла при подгрузке новых элементов через API
- **SelectField.vue**: Рефакторинг на использование CustomDropdown компонента вместо нативного `<select>`
- **SelectFieldRenderer.ts**: Переработан для использования SelectControlRenderer вместо нативного `<select>` в pure-JS версии
- **BlockUIController.ts**: Добавлена инициализация select контролов через метод `initializeSelectControls()` для автоматической инициализации кастомных селектов
- **ApiSelectControlRenderer.ts**: Исправлено сохранение позиции скролла при обновлении списка в multi-select режиме
- **IFormFieldConfig**: Добавлено поле `multiple?: boolean` для поддержки множественного выбора в select полях
- **Опции полей**: Обновлен тип опций - добавлена поддержка `value: string | number` и `disabled?: boolean`
- **IRenderContext**: Добавлен метод `onFieldChange` для callback изменения значений полей
- **Стили api-select**: Исправлен двойной бордер в api-select во Vue3 - убран бордер у `.bb-dropdown__control` внутри `.bb-api-select__search`

### Исправлено
- **UX api-select Vue3**: При подгрузке новых элементов список больше не возвращается в начало, сохраняется текущая позиция скролла
- **UX select pure-JS**: При выборе элемента в multi-select режиме сохраняется позиция скролла, список не возвращается в начало
- **Отображение значения select**: Исправлено обновление отображаемого значения в закрытом состоянии селекта после выбора элемента
- **Двойной лейбл select**: Убран дублирующийся лейбл в select полях (лейбл рендерится только один раз через BaseFieldRenderer)
- **Двойной бордер api-select**: Исправлен двойной бордер в api-select во Vue3 версии

## [1.0.22] - 2025-11-09

### Добавлено
- **Vue form-fields**: Добавлен каталог `src/ui/components/form-fields/` с базовыми Vue-компонентами полей (`TextField`, `TextareaField`, `NumberField`, `ColorField`, `SelectField`, `CheckboxField`, `RadioField`) и универсальным `FormField` для повторного использования UI-логики.
- **IRenderContext**: Новый интерфейс `IRenderContext`, передающий классы, data-атрибуты и состояние ошибок в рендереры форм без постобработки HTML.

### Изменено
- **BlockBuilder.vue и RepeaterControl.vue**: Формы переписаны на `FormField`, устранено дублирование шаблонов, унифицированы ошибки и стили.
- **RepeaterControlRenderer и form-renderers**: Рендереры обновлены для работы с `IRenderContext`; удалены строковые замены, добавлена передача контекста и спец-атрибутов для repeater и image полей.
- **ApiSelectControlRenderer, BlockUIController, EventDelegation**: Адаптированы к новой архитектуре, улучшено управление обработчиками и состояниями UI.
- **Стили repeater**: Унифицированы с общими классами форм, настроена поддержка новых компонентов.
- **package.json, index.ts, core.ts, vue.ts**: Обновлены экспорты и точки входа для новых компонентов и типов.

### Удалено
- **utils/validation.ts**: Удалён устаревший модуль валидации; функциональность перенесена в актуальные сервисы и компоненты.

## [1.0.21] - 2025-11-08

### Добавлено
- **ESLint и Prettier**: Добавлена конфигурация ESLint и Prettier для обеспечения единообразия кода и автоматического форматирования. Добавлены скрипты `lint`, `lint:fix` и `format` в package.json
- **LICENSE-PRO.md**: Добавлен файл с описанием PRO лицензии для коммерческого использования расширенных функций

### Изменено
- **LICENSE**: Обновлен файл лицензии с указанием на PRO версию для коммерческого использования
- **Форматирование кода**: Весь код отформатирован в соответствии с правилами Prettier для единообразия стиля
- **Код-стайл**: Применены правила ESLint для улучшения качества кода и предотвращения потенциальных ошибок

---

## [1.0.20] - 2025-11-08

### Добавлено
- **Система рендереров полей формы**: Реализована новая архитектура рендеринга полей формы с использованием паттерна Factory и базового класса `BaseFieldRenderer`. Все типы полей теперь имеют отдельные классы-рендереры (TextFieldRenderer, TextareaFieldRenderer, NumberFieldRenderer, ColorFieldRenderer, UrlFieldRenderer, EmailFieldRenderer, FileFieldRenderer, CheckboxFieldRenderer, SelectFieldRenderer, RadioFieldRenderer, ImageFieldRenderer, SpacingFieldRenderer, RepeaterFieldRenderer, ApiSelectFieldRenderer, CustomFieldRenderer)
- **FieldRendererFactory**: Добавлен фабричный класс для управления рендерерами полей с поддержкой регистрации кастомных рендереров

### Изменено
- **FormBuilder**: Переработан для использования новой системы рендереров через `FieldRendererFactory`. Улучшена модульность и расширяемость кода
- **Безопасность рендеринга**: Все рендереры полей теперь используют метод `escapeHtml()` для экранирования HTML в лейблах, значениях и плейсхолдерах
- **UIRenderer**: Добавлено корректное удаление Vue приложений через `unmount()` при удалении блоков для предотвращения утечек памяти
- **ModalManager**: Улучшена обработка событий - добавлено корректное удаление обработчиков событий в методе `closeModal()`. Заголовки и тексты кнопок теперь экранируются для безопасности
- **EventDelegation**: Добавлено корректное удаление глобального обработчика событий в методе `destroy()`. Добавлена валидация размера данных в `data-args` (максимум 10000 символов) и обработка ошибок парсинга JSON

### Исправлено
- **Утечки памяти Vue приложений**: Исправлена утечка памяти при использовании Vue компонентов в pure-js версии - теперь Vue приложения корректно удаляются через `app.unmount()` при удалении блоков
- **Утечки памяти в ModalManager**: Исправлена утечка памяти - обработчики событий теперь корректно удаляются при закрытии модального окна
- **Утечки памяти в EventDelegation**: Исправлена утечка памяти - глобальный обработчик событий теперь корректно удаляется в методе `destroy()`
- **XSS уязвимости**: Исправлены XSS уязвимости при отображении ошибок валидации, заголовков модальных окон и текстов кнопок - все пользовательские данные теперь экранируются через `escapeHtml()`
- **Безопасность JSON.parse**: Добавлена валидация размера данных и обработка ошибок при парсинге JSON в `EventDelegation`
- **Безопасность рендеринга полей**: Все рендереры полей теперь безопасно экранируют HTML во всех местах, где отображается пользовательский ввод

### ⚠️ Важные замечания по безопасности
- **Базовая защита от XSS**: В пакете реализована базовая защита от XSS атак через экранирование HTML во всех стандартных рендерерах полей формы. Однако **настоятельно рекомендуется** использовать дополнительную защиту в вашем приложении:
  - Для кастомных полей (`custom` тип поля) и кастомных рендереров (`ICustomFieldRenderer`) пакет **не может гарантировать** безопасность, так как рендеринг полностью контролируется пользователем. Обязательно используйте санитизацию (например, DOMPurify) при рендеринге HTML в кастомных полях
  - Для пользовательских HTML шаблонов в блоках (когда используется `render.kind === 'template'`) рекомендуется использовать санитизацию HTML, если шаблон может содержать пользовательский ввод
  - Для Vue компонентов в блоках используйте безопасные методы рендеринга (`v-text` вместо `v-html`, если не уверены в источнике данных)
  - Рекомендуется настроить Content Security Policy (CSP) в вашем приложении для дополнительной защиты от XSS атак

---

## [1.0.19] - 2025-11-05

### Исправлено
- -fix

---

## [1.0.18] - 2025-11-05

### Исправлено
- -fix

---

## [1.0.17] - 2025-11-05

### Изменено
- **BlockBuilder.vue и UIRenderer.ts**: Добавлен класс `block-builder` к основному контейнеру приложения для улучшения кастомизации стилей
- **_forms.scss**: Удален жестко заданный цвет из `.block-builder-form-label` для лучшей адаптации к темам

---

## [1.0.16] - 2025-11-04

### Исправлено
- **BlockBuilder.vue**: Исправлено отображение ошибок валидации - теперь ошибки показываются для всех типов полей (text, textarea, number, color, url, select, checkbox, radio), а не только для radio полей

---

## [1.0.15] - 2025-11-04

### Удалено
- **Свойство `storageType`**: Удалено свойство `storageType?: 'memory' | 'localStorage'` из `IBlockBuilderOptions` и `BlockBuilderFactory`. Сохранение блоков теперь реализовано исключительно через колбэк `onSave`, который пользователь передаёт в опциях
- **LocalStorageBlockRepositoryImpl**: Удалена реализация репозитория с использованием localStorage. Репозиторий теперь используется только для работы в памяти во время сессии
- **Свойство `collapsible`**: Удалено опциональное свойство `collapsible` из `IRepeaterFieldConfig`. Элементы repeater теперь всегда можно сворачивать/разворачивать (аккордеоны всегда включены)
- **Свойство `locked`**: Удалена функциональность блокировки блоков ("Lock block"). Удалены связанные методы и UI элементы
- **Методы `saveBlocks` и `loadBlocks`**: Удалены из документации как несуществующие публичные методы. Реальное сохранение происходит через колбэк `onSave`, загрузка - через `initialBlocks` prop

### Изменено
- **Валидация `message`**: Поле `message` в правилах валидации (`IValidationRule`, `IBaseValidationRule`) теперь опциональное. Добавлены fallback сообщения по умолчанию для всех типов правил валидации
- **Фильтрация скрытых блоков**: Если блок скрыт (`visible: false`), он автоматически фильтруется и не отображается при `isEdit: false`
- **Замена CSS классов**: Все использования CSS класса `hidden` и `is-hidden` заменены на `CSS_CLASSES.HIDDEN` из `block-builder/src/utils/constants.ts`
- **Унификация стилей**: Все стили из `<style>` секций в `BlockBuilder.vue` и `BlockComponent.vue` перемещены в общие SCSS файлы (`_forms.scss` и `_blocks.scss`)
- **RepeaterControl**: Элементы repeater теперь всегда можно сворачивать/разворачивать (аккордеоны всегда включены). Удалён prop `collapsible` из компонента

### Исправлено
- **RepeaterControl.vue**: Исправлена ошибка `TypeError: Cannot read properties of undefined (reading 'ERROR')` - добавлен `CSS_CLASSES` в возвращаемый объект `setup()` функции
- **Документация**: Исправлена ошибочная информация о `containerId` для core версии - теперь явно указано, что `containerId` НЕ нужен для `@mushket-co/block-builder/core`
- **Документация**: Удалены упоминания устаревших свойств `storage`, `autoRender` из документации. Исправлено на `autoInit`
- **Документация**: Добавлены все пропсы `BlockBuilderComponent` в документацию, удалены расплывчатые формулировки "другие опции..."

### Очистка кода
- Удалены неиспользуемые импорты, комментарии и мусорный код
- Удалена функция `handleCardClick` из `BlockComponent.vue`
- Удалены константы связанные с localStorage (`STORAGE_KEY_BLOCKS`, `STORAGE_QUOTA_EXCEEDED`, `FAILED_TO_LOAD_BLOCKS`, `FAILED_TO_SAVE_BLOCKS`)

---

## [1.0.14] - 2025-11-03

### Добавлено
- **Экспорт `./BlockBuilderFactory` в package.json**: Добавлен новый entry point `./BlockBuilderFactory` для доступа к `ApiSelectUseCase` и связанным типам (`IHttpClient`, `IHttpResponse`, `IHttpRequestOptions`, `IApiRequestParams`) из Pure JS приложений без необходимости импортировать Vue-специфичные модули

### Изменено
- **BlockBuilderFactory.ts**: Добавлены экспорты `ApiSelectUseCase` и связанных типов для использования вне пакета через импорт `@mushket-co/block-builder/BlockBuilderFactory`

---

## [1.0.13] - 2025-11-03

### Добавлено
- **Экспорты CSS в package.json**: Добавлены экспорты `./index.esm.css` и `./index.css` в `package.json`, что позволяет корректно импортировать стили через `import '@mushket-co/block-builder/index.esm.css'` без указания полного пути `dist/index.esm.css`

---

## [1.0.12] - 2025-11-03

### Исправлено
- **Исправлен `.npmignore`**: Убрано исключение всей директории `src/`, которое блокировало включение файлов из `src/ui/` в npm пакет. Теперь все файлы из `src/`, указанные в `files`, корректно включаются в пакет
- **Убрана зависимость от SCSS в Vue компонентах**: Удалены импорты SCSS файлов из Vue компонентов (`@use '../styles/index.scss'` и подобные). Теперь пользователям не нужно устанавливать `sass` - стили уже скомпилированы в `dist/index.esm.css` и должны импортироваться отдельно
- **Исключены SCSS файлы из npm пакета**: Директория `src/ui/styles/` теперь исключена из публикации пакета

---

## [1.0.11] - 2025-11-03

### Исправлено
- **Исправлен список файлов npm пакета**: Теперь включены все необходимые директории (`src/ui/**/*`, `src/core/**/*.ts`) для корректной работы Vue компонентов с их зависимостями (icons, controllers, services и т.д.)

---

## [1.0.10] - 2025-11-03

### Исправлено
- **Добавлены `core/services` и `core/entities` в npm пакет**: Файлы из `src/core/services/` и `src/core/entities/` теперь включены в список файлов пакета, что позволяет Vue компонентам корректно резолвить импорты лицензионных сервисов

---

## [1.0.9] - 2025-11-03

### Исправлено
- **Добавлен `BlockBuilderFactory.ts` в npm пакет**: Файл `src/BlockBuilderFactory.ts` теперь включен в список файлов пакета, что позволяет корректно резолвить импорты при использовании `vue` entry point

---

## [1.0.8] - 2025-11-03

### Исправлено
- **Исправлена проблема с резолвингом импортов в `vue` entry point**: Теперь `createBlockManagementUseCase` корректно работает при установке пакета через npm, добавлен экспорт `BlockBuilderFactory` через `vue.ts` для внешнего использования

### Изменено
- **vue.ts**: Добавлен экспорт `BlockBuilderFactory` и его типов для удобного использования в Vue компонентах

---

## [1.0.7] - 2025-11-03

### Исправлено
- **Исправлена проблема с резолвингом импортов в `vue` entry point**: Теперь `createBlockManagementUseCase` корректно работает при установке пакета через npm, добавлен экспорт `BlockBuilderFactory` через `vue.ts` для внешнего использования

### Изменено
- **vue.ts**: Добавлен экспорт `BlockBuilderFactory` и его типов для удобного использования в Vue компонентах

---

## [1.0.6] - 2025-11-03

### Добавлено
- **Режим редактирования/просмотра**: Добавлен параметр `isEdit` в `BlockBuilderFacade`, который позволяет переключаться между режимом редактирования (по умолчанию `true`) и режимом только просмотра (`false`)
- **API для управления режимом редактирования**: Добавлены методы `setIsEdit(isEdit: boolean)` и `getIsEdit(): boolean` в `BlockBuilderFacade` для динамического переключения режима
- **Условное отображение UI контролов**: В режиме просмотра (`isEdit: false`) автоматически скрываются все кнопки редактирования, добавления и управления блоками. Остаётся доступной только функция копирования ID блока
- **CSS класс `bb-is-edit-mode`**: Автоматически добавляется класс на элемент `body` для возможности кастомизации стилей в зависимости от режима работы

### Изменено
- **BlockBuilderFacade**: Добавлен параметр `isEdit` в интерфейс `IBlockBuilderOptions`, по умолчанию `true`
- **BlockUIController**: Добавлена поддержка режима редактирования, все операции создания/редактирования/удаления блоков блокируются в режиме просмотра
- **UIRenderer**: Обновлён для поддержки условного рендеринга контролов в зависимости от режима редактирования
- **BlockBuilder.vue**: Компонент теперь получает и обрабатывает проп `isEdit` для Vue3 интеграции
- **Примеры использования**: Обновлены примеры в `examples/pure-js-vite`, `examples/vue3` и `examples/pure-js-cdn` для демонстрации использования режима редактирования

### Исправлено
- Улучшена обработка режима просмотра в UI контроллере - все действия, связанные с редактированием, корректно блокируются

---

**Примечание**: Для полной истории изменений см. [git log](https://github.com/mushket-co/block-builder/commits/master).

