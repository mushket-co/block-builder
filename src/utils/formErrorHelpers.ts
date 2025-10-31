/**
 * Утилиты для работы с ошибками валидации форм
 * Обработка скролла к первой ошибке и открытие аккордеонов
 */

export interface IFirstErrorInfo {
  fieldKey: string;
  isRepeaterField: boolean;
  repeaterFieldName?: string;
  repeaterIndex?: number;
  nestedFieldName?: string;
}

/**
 * Парсинг ключа ошибки
 * Примеры:
 * - "title" -> { fieldKey: "title", isRepeaterField: false }
 * - "cards[0].title" -> { fieldKey: "cards[0].title", isRepeaterField: true, repeaterFieldName: "cards", repeaterIndex: 0, nestedFieldName: "title" }
 */
export function parseErrorKey(errorKey: string): IFirstErrorInfo {
  const repeaterMatch = errorKey.match(/^([a-zA-Z_]+)\[(\d+)\]\.(.+)$/);

  if (repeaterMatch) {
  return {
    fieldKey: errorKey,
    isRepeaterField: true,
    repeaterFieldName: repeaterMatch[1],
    repeaterIndex: parseInt(repeaterMatch[2], 10),
    nestedFieldName: repeaterMatch[3]
  };
  }

  return {
  fieldKey: errorKey,
  isRepeaterField: false
  };
}

/**
 * Получение первого ключа с ошибкой из объекта ошибок
 */
export function getFirstErrorKey(errors: Record<string, string[]>): string | null {
  const errorKeys = Object.keys(errors);

  if (errorKeys.length === 0) {
  return null;
  }

  // Сортируем ключи, чтобы сначала шли обычные поля, потом repeater поля
  // Это гарантирует правильный порядок обработки
  const sortedKeys = errorKeys.sort((a, b) => {
  const aInfo = parseErrorKey(a);
  const bInfo = parseErrorKey(b);

  // Обычные поля всегда первые
  if (!aInfo.isRepeaterField && bInfo.isRepeaterField) return -1;
  if (aInfo.isRepeaterField && !bInfo.isRepeaterField) return 1;

  // Если оба repeater - сравниваем по индексу
  if (aInfo.isRepeaterField && bInfo.isRepeaterField) {
    if (aInfo.repeaterFieldName !== bInfo.repeaterFieldName) {
      return aInfo.repeaterFieldName!.localeCompare(bInfo.repeaterFieldName!);
    }
    return (aInfo.repeaterIndex || 0) - (bInfo.repeaterIndex || 0);
  }

  // Если оба обычные - сравниваем по имени
  return a.localeCompare(b);
  });

  return sortedKeys[0];
}

/**
 * Поиск DOM элемента поля по его имени
 * Поддерживает обычные поля и поля внутри repeater
 */
export function findFieldElement(containerElement: HTMLElement, errorInfo: IFirstErrorInfo): HTMLElement | null {
  if (!errorInfo.isRepeaterField) {
    // Только по data-field-name
    return containerElement.querySelector(`.block-builder-form-group[data-field-name="${errorInfo.fieldKey}"]`) as HTMLElement || null;
  }
  // Только repeater-секция по data-field-name, затем поиск .repeater-control__item по индексу
  const repeaterContainer = containerElement.querySelector(`[data-field-name="${errorInfo.repeaterFieldName}"]`);
  if (!repeaterContainer) return null;
  const repeaterItems = repeaterContainer.querySelectorAll('.repeater-control__item');
  const targetItem = repeaterItems[errorInfo.repeaterIndex || 0] as HTMLElement;
  if (!targetItem) return null;
  // Только поиск поля по data-field-name внутри repeater
  return targetItem.querySelector(`.repeater-control__field [data-field-name="${errorInfo.nestedFieldName}"]`) as HTMLElement || null;
}

/**
 * Скролл к элементу с анимацией
 */
export function scrollToElement(
  element: HTMLElement,
  options: {
  offset?: number;
  behavior?: ScrollBehavior;
  container?: HTMLElement;
  } = {}
): void {
  const {
  offset = 20,
  behavior = 'smooth',
  container
  } = options;

  // Определяем контейнер для скролла
  const scrollContainer = container || getScrollContainer(element);

  if (!scrollContainer) {
  // Запасной вариант - используем window.scroll
  const elementRect = element.getBoundingClientRect();
  const absoluteElementTop = elementRect.top + window.pageYOffset;
  const targetPosition = absoluteElementTop - offset;

  window.scrollTo({
    top: targetPosition,
    behavior
  });
  return;
  }

  // Скролл внутри контейнера
  const elementRect = element.getBoundingClientRect();
  const containerRect = scrollContainer.getBoundingClientRect();
  const relativeTop = elementRect.top - containerRect.top;
  const targetScrollTop = scrollContainer.scrollTop + relativeTop - offset;

  scrollContainer.scrollTo({
  top: targetScrollTop,
  behavior
  });
}

/**
 * Поиск ближайшего скроллируемого контейнера
 */
function getScrollContainer(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;

  while (parent) {
  const style = window.getComputedStyle(parent);
  const overflowY = style.overflowY;
  const overflowX = style.overflowX;

  if (
    (overflowY === 'auto' || overflowY === 'scroll' || overflowX === 'auto' || overflowX === 'scroll') &&
    parent.scrollHeight > parent.clientHeight
  ) {
    return parent;
  }

  parent = parent.parentElement;
  }

  return null;
}

/**
 * Фокус на элементе (если это input/textarea/select)
 */
export function focusElement(element: HTMLElement): void {
  // Если передана группа полей - ищем внутри неё input/textarea/select
  let targetElement = element;

  if (!isFormField(element)) {
  // Ищем первое поле ввода внутри элемента
  const field = element.querySelector('input, textarea, select') as HTMLElement;
  if (field && isFormField(field)) {
    targetElement = field;
  }
  }

  if (isFormField(targetElement)) {
  // Добавляем небольшую задержку, чтобы скролл успел завершиться
  setTimeout(() => {
    (targetElement as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).focus();

    // Подсвечиваем поле с ошибкой
    targetElement.classList.add('field-error-highlight');
    setTimeout(() => {
      targetElement.classList.remove('field-error-highlight');
    }, 2000);
  }, 300);
  }
}

/**
 * Проверка, является ли элемент полем формы
 */
function isFormField(element: HTMLElement): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return (
  element instanceof HTMLInputElement ||
  element instanceof HTMLTextAreaElement ||
  element instanceof HTMLSelectElement
  );
}

/**
 * Обработка скролла к первой ошибке
 * Возвращает информацию о первой ошибке для дальнейшей обработки
 */
export function scrollToFirstError(
  containerElement: HTMLElement,
  errors: Record<string, string[]>,
  options: {
  offset?: number;
  behavior?: ScrollBehavior;
  autoFocus?: boolean;
  } = {}
): IFirstErrorInfo | null {
  const firstErrorKey = getFirstErrorKey(errors);

  if (!firstErrorKey) {
  return null;
  }

  const errorInfo = parseErrorKey(firstErrorKey);
  const fieldElement = findFieldElement(containerElement, errorInfo);

  if (!fieldElement) {
  // Не удалось найти элемент для ошибки
  return errorInfo;
  }

  // Скроллим к элементу
  scrollToElement(fieldElement, {
  offset: options.offset,
  behavior: options.behavior
  });

  // Фокусируемся на элементе, если нужно
  if (options.autoFocus !== false) {
  focusElement(fieldElement);
  }

  return errorInfo;
}

