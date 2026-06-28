export type TUiLocale = 'ru' | 'en';

export interface IUiStrings {
  save: string;
  clearAll: string;
  blocksTotal: string;
  createBlock: string;
  editBlock: string;
  submitCreate: string;
  submitSave: string;
  cancelButtonText: string;
  loading: string;
  addBlock: string;
  edit: string;
  moveUp: string;
  moveDown: string;
  copyIdTitle: string;
  duplicate: string;
  delete: string;
  hide: string;
  show: string;
  expand: string;
  collapse: string;
  blockTypeSelectionTitle: string;
  repeaterAdd: string;
  repeaterRemove: string;
  repeaterItem: string;
  repeaterMin: string;
  repeaterMax: string;
  saveNotEnabled: string;
  errorSaveFailed: string;
  successSaved: string;
  blockIdCopied: string;
  copyIdError: string;
  blockConfigNotFound: string;
  addBlockTitle: string;
  blockCreationError: string;
  editBlockTitle: string;
  blockUpdateError: string;
  deleteBlockConfirmTitle: string;
  deleteBlockConfirmMessage: string;
  clearAllBlocksConfirmTitle: string;
  clearAllBlocksConfirmMessage: string;
  deleteBlockSimpleConfirm: string;
  clearAllSimpleConfirm: string;
  blockDuplicateError: string;
  blockDeleteError: string;
  blocksClearError: string;
  initialBlocksLoadError: string;
  formLoadError: string;
  formSaveError: string;
  apiSelectRequired: string;
  apiSelectUnavailable: string;
  customFieldRequired: string;
  customFieldsUnavailable: string;
  spacingDefaultLabel: string;
  spacingCssVariablesPreview: string;
  breakpointDesktop: string;
  breakpointTablet: string;
  breakpointMobile: string;
  spacingPaddingTop: string;
  spacingPaddingBottom: string;
  spacingMarginTop: string;
  spacingMarginBottom: string;
  selectPlaceholder: string;
  dropdownPlaceholder: string;
  dropdownLoading: string;
  dropdownEmpty: string;
  apiSelectPlaceholder: string;
  apiSelectLoading: string;
  apiSelectNoResults: string;
  apiSelectError: string;
  apiSelectConfigMissing: string;
  apiSelectLoadMore: string;
  matrixStructureTab: string;
  matrixContentTab: string;
  matrixColumn: string;
  matrixRow: string;
  matrixDeleteColumn: string;
  matrixDeleteRow: string;
  chooseFile: string;
  chooseImage: string;
  replaceFile: string;
  changeImage: string;
  addFile: string;
  add: string;
  remove: string;
  removeFile: string;
  removeImage: string;
  imageAlt: string;
  uploadServerError: string;
  uploadFileError: string;
  fileImportError: string;
  fileReadError: string;
  invalidImageFile: string;
  customFieldInitError: string;
  blockAnchorPlaceholder: string;
  blockAnchorCustomUrlPlaceholder: string;
  validationErrorsAriaLabel: string;
  unknownError: string;
}

export const UI_STRINGS_RU: IUiStrings = {
  save: 'Сохранить',
  clearAll: 'Очистить все',
  blocksTotal: 'Всего блоков:',
  createBlock: 'Создать',
  editBlock: 'Редактировать',
  submitCreate: 'Создать',
  submitSave: 'Сохранить',
  cancelButtonText: 'Отмена',
  loading: 'Загрузка…',
  addBlock: 'Добавить блок',
  edit: 'Редактировать',
  moveUp: 'Переместить вверх',
  moveDown: 'Переместить вниз',
  copyIdTitle: 'Копировать ID:',
  duplicate: 'Дублировать',
  delete: 'Удалить',
  hide: 'Скрыть',
  show: 'Показать',
  expand: 'Развернуть',
  collapse: 'Свернуть',
  blockTypeSelectionTitle: 'Выберите тип блока',
  repeaterAdd: 'Добавить',
  repeaterRemove: 'Удалить',
  repeaterItem: 'Элемент',
  repeaterMin: 'Минимум:',
  repeaterMax: 'Максимум:',
  saveNotEnabled:
    'Функция сохранения не настроена. Передайте onSave в конфигурацию BlockBuilder.',
  errorSaveFailed: 'Произошла ошибка при сохранении',
  successSaved: 'Данные успешно сохранены',
  blockIdCopied: 'ID скопирован:',
  copyIdError: 'Ошибка копирования ID',
  blockConfigNotFound: 'Конфигурация для типа блока не найдена',
  addBlockTitle: 'Добавление',
  blockCreationError: 'Ошибка создания блока',
  editBlockTitle: 'Редактирование',
  blockUpdateError: 'Ошибка обновления блока',
  deleteBlockConfirmTitle: 'Удалить блок?',
  deleteBlockConfirmMessage: 'Вы действительно хотите удалить блок?',
  clearAllBlocksConfirmTitle: 'Очистить все блоки?',
  clearAllBlocksConfirmMessage: 'Это действие удалит все блоки. Продолжить?',
  deleteBlockSimpleConfirm: 'Удалить блок?',
  clearAllSimpleConfirm: 'Удалить все блоки?',
  blockDuplicateError: 'Ошибка дублирования блока',
  blockDeleteError: 'Ошибка удаления блока',
  blocksClearError: 'Ошибка очистки блоков',
  initialBlocksLoadError: 'Ошибка загрузки начальных блоков',
  formLoadError: 'Ошибка загрузки формы',
  formSaveError: 'Ошибка сохранения',
  apiSelectRequired: 'Передайте apiSelectUseCase для использования API Select полей.',
  apiSelectUnavailable: 'API Select поля недоступны.',
  customFieldRequired:
    'Зарегистрируйте customFieldRendererRegistry для использования кастомных полей.',
  customFieldsUnavailable: 'Кастомные поля недоступны.',
  spacingDefaultLabel: 'Отступы',
  spacingCssVariablesPreview: 'CSS переменные:',
  breakpointDesktop: 'Десктоп',
  breakpointTablet: 'Таблет',
  breakpointMobile: 'Моб',
  spacingPaddingTop: 'Внутренний верх',
  spacingPaddingBottom: 'Внутренний низ',
  spacingMarginTop: 'Внешний верх',
  spacingMarginBottom: 'Внешний низ',
  selectPlaceholder: 'Выберите...',
  dropdownPlaceholder: 'Выберите значение',
  dropdownLoading: 'Загрузка...',
  dropdownEmpty: 'Нет данных',
  apiSelectPlaceholder: 'Начните вводить для поиска...',
  apiSelectLoading: 'Загрузка...',
  apiSelectNoResults: 'Ничего не найдено',
  apiSelectError: 'Ошибка загрузки данных',
  apiSelectConfigMissing: 'Конфигурация API не указана',
  apiSelectLoadMore: 'Загрузить ещё...',
  matrixStructureTab: 'Структура таблицы',
  matrixContentTab: 'Контент',
  matrixColumn: 'Столбец',
  matrixRow: 'Строка',
  matrixDeleteColumn: 'Удалить столбец',
  matrixDeleteRow: 'Удалить строку',
  chooseFile: 'Выберите файл',
  chooseImage: 'Выберите изображение',
  replaceFile: 'Заменить файл',
  changeImage: 'Изменить изображение',
  addFile: 'Добавить файл',
  add: 'Добавить',
  remove: 'Удалить',
  removeFile: 'Удалить файл',
  removeImage: 'Удалить изображение',
  imageAlt: 'Изображение',
  uploadServerError:
    'Не удалось подключиться к серверу загрузки. Проверьте, что API доступен.',
  uploadFileError: 'Ошибка при загрузке файла',
  fileImportError: 'Ошибка импорта файла',
  fileReadError: 'Ошибка при чтении файла',
  invalidImageFile: 'Пожалуйста, выберите файл изображения',
  customFieldInitError: 'Ошибка инициализации кастомного поля',
  blockAnchorPlaceholder: 'Выберите блок на странице',
  blockAnchorCustomUrlPlaceholder: 'или введите URL',
  validationErrorsAriaLabel: 'Ошибки валидации:',
  unknownError: 'Неизвестная ошибка',
};

export const UI_STRINGS_EN: IUiStrings = {
  save: 'Save',
  clearAll: 'Clear all',
  blocksTotal: 'Total blocks:',
  createBlock: 'Create',
  editBlock: 'Edit',
  submitCreate: 'Create',
  submitSave: 'Save',
  cancelButtonText: 'Cancel',
  loading: 'Loading…',
  addBlock: 'Add block',
  edit: 'Edit',
  moveUp: 'Move up',
  moveDown: 'Move down',
  copyIdTitle: 'Copy ID:',
  duplicate: 'Duplicate',
  delete: 'Delete',
  hide: 'Hide',
  show: 'Show',
  expand: 'Expand',
  collapse: 'Collapse',
  blockTypeSelectionTitle: 'Select block type',
  repeaterAdd: 'Add',
  repeaterRemove: 'Remove',
  repeaterItem: 'Item',
  repeaterMin: 'Minimum:',
  repeaterMax: 'Maximum:',
  saveNotEnabled: 'Save is not configured. Pass onSave to BlockBuilder.',
  errorSaveFailed: 'An error occurred while saving',
  successSaved: 'Data saved successfully',
  blockIdCopied: 'ID copied:',
  copyIdError: 'Failed to copy ID',
  blockConfigNotFound: 'Block type configuration not found',
  addBlockTitle: 'Adding',
  blockCreationError: 'Block creation error',
  editBlockTitle: 'Editing',
  blockUpdateError: 'Block update error',
  deleteBlockConfirmTitle: 'Delete block?',
  deleteBlockConfirmMessage: 'Are you sure you want to delete this block?',
  clearAllBlocksConfirmTitle: 'Clear all blocks?',
  clearAllBlocksConfirmMessage: 'This will delete all blocks. Continue?',
  deleteBlockSimpleConfirm: 'Delete block?',
  clearAllSimpleConfirm: 'Delete all blocks?',
  blockDuplicateError: 'Block duplication error',
  blockDeleteError: 'Block deletion error',
  blocksClearError: 'Failed to clear blocks',
  initialBlocksLoadError: 'Failed to load initial blocks',
  formLoadError: 'Form load error',
  formSaveError: 'Save error',
  apiSelectRequired: 'Pass apiSelectUseCase to use API Select fields.',
  apiSelectUnavailable: 'API Select fields are unavailable.',
  customFieldRequired: 'Register customFieldRendererRegistry to use custom fields.',
  customFieldsUnavailable: 'Custom fields are unavailable.',
  spacingDefaultLabel: 'Spacing',
  spacingCssVariablesPreview: 'CSS variables:',
  breakpointDesktop: 'Desktop',
  breakpointTablet: 'Tablet',
  breakpointMobile: 'Mobile',
  spacingPaddingTop: 'Padding top',
  spacingPaddingBottom: 'Padding bottom',
  spacingMarginTop: 'Margin top',
  spacingMarginBottom: 'Margin bottom',
  selectPlaceholder: 'Select...',
  dropdownPlaceholder: 'Select value',
  dropdownLoading: 'Loading...',
  dropdownEmpty: 'No data',
  apiSelectPlaceholder: 'Start typing to search...',
  apiSelectLoading: 'Loading...',
  apiSelectNoResults: 'Nothing found',
  apiSelectError: 'Failed to load data',
  apiSelectConfigMissing: 'API configuration is missing',
  apiSelectLoadMore: 'Load more...',
  matrixStructureTab: 'Table structure',
  matrixContentTab: 'Content',
  matrixColumn: 'Column',
  matrixRow: 'Row',
  matrixDeleteColumn: 'Delete column',
  matrixDeleteRow: 'Delete row',
  chooseFile: 'Choose file',
  chooseImage: 'Choose image',
  replaceFile: 'Replace file',
  changeImage: 'Change image',
  addFile: 'Add file',
  add: 'Add',
  remove: 'Remove',
  removeFile: 'Remove file',
  removeImage: 'Remove image',
  imageAlt: 'Image',
  uploadServerError: 'Could not connect to upload server. Check that the API is available.',
  uploadFileError: 'File upload error',
  fileImportError: 'File import error',
  fileReadError: 'File read error',
  invalidImageFile: 'Please select an image file',
  customFieldInitError: 'Custom field initialization error',
  blockAnchorPlaceholder: 'Select a block on the page',
  blockAnchorCustomUrlPlaceholder: 'or enter URL',
  validationErrorsAriaLabel: 'Validation errors:',
  unknownError: 'Unknown error',
};

export function resolveUiStrings(
  locale?: TUiLocale,
  overrides?: Partial<IUiStrings>
): IUiStrings {
  const base = locale === 'en' ? UI_STRINGS_EN : UI_STRINGS_RU;
  return overrides ? { ...base, ...overrides } : base;
}

export function getSpacingLabelsFromUi(ui: IUiStrings): Record<string, string> {
  return {
    'padding-top': ui.spacingPaddingTop,
    'padding-bottom': ui.spacingPaddingBottom,
    'margin-top': ui.spacingMarginTop,
    'margin-bottom': ui.spacingMarginBottom,
  };
}

export function getDefaultBreakpointsFromUi(ui: IUiStrings) {
  return [
    { name: 'desktop', label: ui.breakpointDesktop, maxWidth: undefined as number | undefined },
    { name: 'tablet', label: ui.breakpointTablet, maxWidth: 1199 },
    { name: 'mobile', label: ui.breakpointMobile, maxWidth: 767 },
  ];
}
