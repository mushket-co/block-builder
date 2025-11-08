import { CSS_CLASSES } from './constants';
export interface IFirstErrorInfo {
  fieldKey: string;
  isRepeaterField: boolean;
  repeaterFieldName?: string;
  repeaterIndex?: number;
  nestedFieldName?: string;
}
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
export function getFirstErrorKey(errors: Record<string, string[]>): string | null {
  const errorKeys = Object.keys(errors);
  if (errorKeys.length === 0) {
  return null;
  }
  const sortedKeys = errorKeys.sort((a, b) => {
  const aInfo = parseErrorKey(a);
  const bInfo = parseErrorKey(b);
  if (!aInfo.isRepeaterField && bInfo.isRepeaterField) return -1;
  if (aInfo.isRepeaterField && !bInfo.isRepeaterField) return 1;
  if (aInfo.isRepeaterField && bInfo.isRepeaterField) {
    if (aInfo.repeaterFieldName !== bInfo.repeaterFieldName) {
      return aInfo.repeaterFieldName!.localeCompare(bInfo.repeaterFieldName!);
    }
    return (aInfo.repeaterIndex || 0) - (bInfo.repeaterIndex || 0);
  }
  return a.localeCompare(b);
  });
  return sortedKeys[0];
}
export function findFieldElement(containerElement: HTMLElement, errorInfo: IFirstErrorInfo): HTMLElement | null {
  if (!errorInfo.isRepeaterField) {
    let element = containerElement.querySelector(`[data-field-name="${errorInfo.fieldKey}"]`) as HTMLElement;
    if (element) return element;
    
    element = containerElement.querySelector(`.image-upload-field[data-field-name="${errorInfo.fieldKey}"]`) as HTMLElement;
    if (element) return element;
    
    return containerElement.querySelector(`.${CSS_CLASSES.FORM_GROUP}[data-field-name="${errorInfo.fieldKey}"]`) as HTMLElement || null;
  }
  
  let repeaterContainer = containerElement.querySelector(`.repeater-control[data-field-name="${errorInfo.repeaterFieldName}"]`) as HTMLElement;
  
  if (!repeaterContainer) {
    repeaterContainer = containerElement.querySelector(`[data-field-name="${errorInfo.repeaterFieldName}"]`) as HTMLElement;
  }
  
  if (!repeaterContainer) {
    return null;
  }
  
  const repeaterItems = repeaterContainer.querySelectorAll('.repeater-control__item');
  const itemIndex = errorInfo.repeaterIndex || 0;
  
  if (itemIndex >= repeaterItems.length) {
    return null;
  }
  
  const targetItem = repeaterItems[itemIndex] as HTMLElement;
  if (!targetItem) return null;
  
  const fullFieldPath = `${errorInfo.repeaterFieldName}[${errorInfo.repeaterIndex}].${errorInfo.nestedFieldName}`;
  let fieldElement = targetItem.querySelector(`[data-field-name="${fullFieldPath}"]`) as HTMLElement;
  if (fieldElement) {
    return fieldElement;
  }
  
  const imageUploadFields = targetItem.querySelectorAll<HTMLElement>(`.image-upload-field[data-repeater-item-field="${errorInfo.nestedFieldName}"]`);
  
  for (const el of Array.from(imageUploadFields)) {
    const repeaterIndexAttr = el.getAttribute('data-repeater-index');
    if (repeaterIndexAttr !== null) {
      const repeaterIndexNum = parseInt(repeaterIndexAttr, 10);
      if (!isNaN(repeaterIndexNum) && repeaterIndexNum === errorInfo.repeaterIndex) {
        return el;
      }
    }
  }
  
  if (imageUploadFields.length === 1) {
    return imageUploadFields[0] as HTMLElement;
  }
  
  fieldElement = targetItem.querySelector(`[data-field-name*="${errorInfo.nestedFieldName}"]`) as HTMLElement;
  if (fieldElement) {
    return fieldElement;
  }
  
  const lastTry = targetItem.querySelector(`.image-upload-field[data-field-name*="${errorInfo.nestedFieldName}"]`) as HTMLElement;
  if (lastTry) {
    return lastTry;
  }
  
  return null;
}
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
  const scrollContainer = container || getScrollContainer(element);
  if (!scrollContainer) {
  const elementRect = element.getBoundingClientRect();
  const absoluteElementTop = elementRect.top + window.pageYOffset;
  const targetPosition = absoluteElementTop - offset;
  window.scrollTo({
    top: targetPosition,
    behavior
  });
  return;
  }
  const elementRect = element.getBoundingClientRect();
  const containerRect = scrollContainer.getBoundingClientRect();
  const relativeTop = elementRect.top - containerRect.top;
  const targetScrollTop = scrollContainer.scrollTop + relativeTop - offset;
  scrollContainer.scrollTo({
  top: targetScrollTop,
  behavior
  });
}
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
export function focusElement(element: HTMLElement): void {
  if (element.classList.contains('image-upload-field')) {
    setTimeout(() => {
      element.classList.add(CSS_CLASSES.ERROR);
      element.classList.add('field-error-highlight');
      setTimeout(() => {
        element.classList.remove('field-error-highlight');
      }, 2000);
    }, 300);
    return;
  }
  let targetElement = element;
  if (!isFormField(element)) {
  const field = element.querySelector('input, textarea, select') as HTMLElement;
  if (field && isFormField(field)) {
    targetElement = field;
  }
  }
  if (isFormField(targetElement)) {
  setTimeout(() => {
    (targetElement as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).focus();
    targetElement.classList.add('field-error-highlight');
    setTimeout(() => {
      targetElement.classList.remove('field-error-highlight');
    }, 2000);
  }, 300);
  }
}
function isFormField(element: HTMLElement): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return (
  element instanceof HTMLInputElement ||
  element instanceof HTMLTextAreaElement ||
  element instanceof HTMLSelectElement
  );
}
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
  return errorInfo;
  }
  scrollToElement(fieldElement, {
  offset: options.offset,
  behavior: options.behavior
  });
  if (options.autoFocus !== false) {
  focusElement(fieldElement);
  }
  return errorInfo;
}