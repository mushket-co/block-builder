import { CSS_CLASSES } from './constants';

export interface IFirstErrorInfo {
  fieldKey: string;
  isRepeaterField: boolean;
  repeaterFieldName?: string;
  repeaterIndex?: number;
  nestedFieldName?: string;
  nestedPath?: string;
}
export function parseErrorKey(errorKey: string): IFirstErrorInfo {
  const repeaterMatch = errorKey.match(/^([A-Z_a-z]+)\[(\d+)]\.(.+)$/);
  if (repeaterMatch) {
    const nestedPath = repeaterMatch[3];
    const nestedRepeaterMatch = nestedPath.match(/^([A-Z_a-z]+)\[(\d+)]/);

    return {
      fieldKey: errorKey,
      isRepeaterField: true,
      repeaterFieldName: repeaterMatch[1],
      repeaterIndex: Number.parseInt(repeaterMatch[2], 10),
      nestedFieldName: nestedRepeaterMatch ? nestedRepeaterMatch[1] : nestedPath.split('.')[0],
      nestedPath: nestedPath,
    };
  }
  return {
    fieldKey: errorKey,
    isRepeaterField: false,
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
    if (!aInfo.isRepeaterField && bInfo.isRepeaterField) {
      return -1;
    }
    if (aInfo.isRepeaterField && !bInfo.isRepeaterField) {
      return 1;
    }
    if (aInfo.isRepeaterField && bInfo.isRepeaterField) {
      if (aInfo.repeaterFieldName !== bInfo.repeaterFieldName) {
        const aName = aInfo.repeaterFieldName || '';
        const bName = bInfo.repeaterFieldName || '';
        return aName.localeCompare(bName);
      }
      return (aInfo.repeaterIndex || 0) - (bInfo.repeaterIndex || 0);
    }
    return a.localeCompare(b);
  });
  return sortedKeys[0];
}
export function findFieldElement(
  containerElement: HTMLElement,
  errorInfo: IFirstErrorInfo
): HTMLElement | null {
  if (!errorInfo.isRepeaterField) {
    let element = containerElement.querySelector(
      `[data-field-name="${errorInfo.fieldKey}"]`
    ) as HTMLElement;
    if (element) {
      return element;
    }

    element = containerElement.querySelector(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD}[data-field-name="${errorInfo.fieldKey}"]`
    ) as HTMLElement;
    if (element) {
      return element;
    }

    return (
      (containerElement.querySelector(
        `.${CSS_CLASSES.FORM_GROUP}[data-field-name="${errorInfo.fieldKey}"]`
      ) as HTMLElement) || null
    );
  }

  const fullFieldPath = `${errorInfo.repeaterFieldName}[${errorInfo.repeaterIndex}].${errorInfo.nestedPath || errorInfo.nestedFieldName}`;

  const fullPathElement = containerElement.querySelector(
    `[data-field-name="${fullFieldPath}"]`
  ) as HTMLElement;
  if (fullPathElement) {
    const input = fullPathElement.querySelector('input, textarea, select') as HTMLElement;
    return input || fullPathElement;
  }

  if (errorInfo.nestedPath && errorInfo.nestedPath.includes('[')) {
    let repeaterContainer = containerElement.querySelector(
      `.${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}[data-field-name="${errorInfo.repeaterFieldName}"]`
    ) as HTMLElement;

    if (!repeaterContainer) {
      repeaterContainer = containerElement.querySelector(
        `[data-field-name="${errorInfo.repeaterFieldName}"]`
      ) as HTMLElement;
    }

    if (repeaterContainer) {
      const repeaterItems = repeaterContainer.querySelectorAll(
        `.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`
      );
      const itemIndex = errorInfo.repeaterIndex || 0;

      if (itemIndex < repeaterItems.length) {
        const targetItem = repeaterItems[itemIndex] as HTMLElement;
        const nestedField = findNestedRepeaterField(
          targetItem,
          errorInfo.nestedPath,
          errorInfo.repeaterIndex || 0
        );
        if (nestedField) {
          return nestedField;
        }
      }
    }

    const fallbackElement = containerElement.querySelector(
      `[data-field-name*="${fullFieldPath}"]`
    ) as HTMLElement;
    if (fallbackElement) {
      const input = fallbackElement.querySelector('input, textarea, select') as HTMLElement;
      return input || fallbackElement;
    }
  }

  let repeaterContainer = containerElement.querySelector(
    `.${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}[data-field-name="${errorInfo.repeaterFieldName}"]`
  ) as HTMLElement;

  if (!repeaterContainer) {
    repeaterContainer = containerElement.querySelector(
      `[data-field-name="${errorInfo.repeaterFieldName}"]`
    ) as HTMLElement;
  }

  if (!repeaterContainer) {
    return null;
  }

  const repeaterItems = repeaterContainer.querySelectorAll(`.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`);
  const itemIndex = errorInfo.repeaterIndex || 0;

  if (itemIndex >= repeaterItems.length) {
    return null;
  }

  const targetItem = repeaterItems[itemIndex] as HTMLElement;
  if (!targetItem) {
    return null;
  }

  let fieldElement = targetItem.querySelector(
    `[data-field-name="${fullFieldPath}"]`
  ) as HTMLElement;
  if (fieldElement) {
    const input = fieldElement.querySelector('input, textarea, select') as HTMLElement;
    return input || fieldElement;
  }

  const imageUploadFields = targetItem.querySelectorAll<HTMLElement>(
    `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD}[data-repeater-item-field="${errorInfo.nestedFieldName}"]`
  );

  for (const el of Array.from(imageUploadFields)) {
    const repeaterIndexAttr = el.dataset.repeaterIndex;
    if (repeaterIndexAttr !== undefined && repeaterIndexAttr !== null) {
      const repeaterIndexNum = Number.parseInt(repeaterIndexAttr, 10);
      if (!Number.isNaN(repeaterIndexNum) && repeaterIndexNum === errorInfo.repeaterIndex) {
        return el;
      }
    }
  }

  if (imageUploadFields.length === 1) {
    return imageUploadFields[0] as HTMLElement;
  }

  fieldElement = targetItem.querySelector(
    `[data-field-name*="${errorInfo.nestedFieldName}"]`
  ) as HTMLElement;
  if (fieldElement) {
    const input = fieldElement.querySelector('input, textarea, select') as HTMLElement;
    return input || fieldElement;
  }

  const lastTry = targetItem.querySelector(
    `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD}[data-field-name*="${errorInfo.nestedFieldName}"]`
  ) as HTMLElement;
  if (lastTry) {
    return lastTry;
  }

  return null;
}

function findNestedRepeaterField(
  container: HTMLElement,
  nestedPath: string,
  _parentIndex: number
): HTMLElement | null {
  const pathParts = nestedPath.split('.');
  let currentContainer: HTMLElement | null = container;

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    const repeaterMatch = part.match(/^([A-Z_a-z]+)\[(\d+)]$/);

    if (repeaterMatch) {
      const fieldName = repeaterMatch[1];
      const index = Number.parseInt(repeaterMatch[2], 10);

      const allRepeaterContainers =
        currentContainer?.querySelectorAll(`.${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}`) || [];

      let nestedRepeaterContainer: HTMLElement | null = null;

      for (const container of Array.from(allRepeaterContainers)) {
        const containerFieldName = (container as HTMLElement).dataset.fieldName || '';
        if (containerFieldName.includes(fieldName) && containerFieldName.includes(`[${index}]`)) {
          nestedRepeaterContainer = container as HTMLElement;
          break;
        }
      }

      if (!nestedRepeaterContainer) {
        for (const container of Array.from(allRepeaterContainers)) {
          const containerFieldName = (container as HTMLElement).dataset.fieldName || '';
          if (
            containerFieldName.endsWith(`.${fieldName}`) ||
            containerFieldName === fieldName ||
            containerFieldName.endsWith(`[${index}].${fieldName}`)
          ) {
            nestedRepeaterContainer = container as HTMLElement;
            break;
          }
        }
      }

      if (!nestedRepeaterContainer) {
        nestedRepeaterContainer = currentContainer?.querySelector(
          `.${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}[data-field-name*="${fieldName}"]`
        ) as HTMLElement;
      }

      if (!nestedRepeaterContainer) {
        return null;
      }

      const nestedItems = nestedRepeaterContainer.querySelectorAll(
        `.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`
      );

      if (index >= nestedItems.length) {
        return null;
      }

      currentContainer = nestedItems[index] as HTMLElement;
    } else {
      if (currentContainer && i === pathParts.length - 1) {
        const fieldName = part;

        const fieldElement = currentContainer.querySelector(
          `[data-field-name*="${fieldName}"]`
        ) as HTMLElement;

        if (!fieldElement) {
          const formGroup = currentContainer.querySelector(
            `.${CSS_CLASSES.FORM_GROUP}[data-field-name*="${fieldName}"]`
          ) as HTMLElement;
          if (formGroup) {
            const input = formGroup.querySelector('input, textarea, select') as HTMLElement;
            return input || formGroup;
          }
        }

        if (!fieldElement) {
          const allInputs = currentContainer.querySelectorAll('input, textarea, select');
          for (const input of Array.from(allInputs)) {
            const htmlInput = input as HTMLElement;
            const fieldId = htmlInput.id || htmlInput.getAttribute('name') || '';
            const closestFieldName =
              htmlInput.closest(`[data-field-name]`)?.getAttribute('data-field-name') || '';
            if (fieldId.includes(fieldName) || closestFieldName.includes(fieldName)) {
              return htmlInput;
            }
          }
        }

        if (fieldElement) {
          const input = fieldElement.querySelector('input, textarea, select') as HTMLElement;
          return input || fieldElement;
        }

        return fieldElement;
      }
    }
  }

  return currentContainer;
}

export function scrollToElement(
  element: HTMLElement,
  options: {
    offset?: number;
    behavior?: ScrollBehavior;
    container?: HTMLElement;
  } = {}
): void {
  const { offset = 20, behavior = 'smooth', container } = options;

  const nearestScrollContainer = getScrollContainer(element);
  const scrollContainer = nearestScrollContainer || container;

  if (!scrollContainer) {
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const targetPosition = absoluteElementTop - offset;

    if (behavior === 'smooth') {
      try {
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
        return;
      } catch {
        smoothScrollWindow(targetPosition);
      }
    } else {
      window.scrollTo(0, targetPosition);
    }
    return;
  }

  const performScroll = () => {
    let elementTop = 0;
    let containerTop = 0;

    if (scrollContainer.contains(element)) {
      let currentElement: HTMLElement | null = element;
      while (currentElement && currentElement !== scrollContainer) {
        elementTop += currentElement.offsetTop;
        currentElement = currentElement.offsetParent as HTMLElement | null;
      }
      containerTop = scrollContainer.offsetTop;
    } else {
      const elementRect = element.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      elementTop = elementRect.top - containerRect.top + scrollContainer.scrollTop;
      containerTop = 0;
    }

    let targetScrollTop = elementTop - containerTop - offset;
    const maxScrollTop = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);

    if (targetScrollTop < 0) {
      targetScrollTop = 0;
    } else if (maxScrollTop > 0 && targetScrollTop > maxScrollTop) {
      targetScrollTop = maxScrollTop;
    }

    if (behavior === 'smooth') {
      smoothScrollElement(scrollContainer, targetScrollTop);
    } else {
      scrollContainer.scrollTop = targetScrollTop;
    }
  };

  if (behavior === 'smooth') {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        performScroll();
      });
    });
  } else {
    performScroll();
  }
}

function smoothScrollWindow(targetPosition: number): void {
  const startPosition = window.pageYOffset || window.scrollY;
  const distance = targetPosition - startPosition;

  if (Math.abs(distance) < 1) {
    return;
  }

  const duration = Math.min(Math.abs(distance) * 0.5, 800);
  let start: number | null = null;

  function step(timestamp: number): void {
    if (!start) {
      start = timestamp;
    }
    const progress = timestamp - start;
    const percentage = Math.min(progress / duration, 1);
    const ease = 0.5 - Math.cos(percentage * Math.PI) / 2;
    const currentPosition = startPosition + distance * ease;
    window.scrollTo(0, currentPosition);
    if (percentage < 1) {
      window.requestAnimationFrame(step);
    }
  }

  window.requestAnimationFrame(step);
}

function smoothScrollElement(element: HTMLElement, targetScrollTop: number): void {
  const startPosition = element.scrollTop;
  const distance = targetScrollTop - startPosition;

  if (Math.abs(distance) < 1) {
    return;
  }

  const duration = Math.min(Math.max(Math.abs(distance) * 0.5, 300), 1000);
  let start: number | null = null;
  let rafId: number | null = null;
  let isCancelled = false;

  const cancel = () => {
    isCancelled = true;
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const step = (timestamp: number): void => {
    if (isCancelled) {
      return;
    }

    if (!start) {
      start = timestamp;
    }

    const progress = timestamp - start;
    const percentage = Math.min(progress / duration, 1);
    const ease = 0.5 - Math.cos(percentage * Math.PI) / 2;
    const currentPosition = startPosition + distance * ease;

    element.scrollTop = currentPosition;

    if (percentage < 1 && !isCancelled) {
      rafId = window.requestAnimationFrame(step);
    } else {
      element.scrollTop = targetScrollTop;
      rafId = null;
    }
  };

  rafId = window.requestAnimationFrame(step);

  setTimeout(() => {
    if (rafId !== null && !isCancelled) {
      cancel();
      element.scrollTop = targetScrollTop;
    }
  }, duration + 100);
}
function getScrollContainer(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;

  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    const scrollHeight = parent.scrollHeight;
    const clientHeight = parent.clientHeight;

    if (
      (overflowY === 'auto' ||
        overflowY === 'scroll' ||
        overflowX === 'auto' ||
        overflowX === 'scroll') &&
      scrollHeight > clientHeight
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return null;
}

export function focusElement(element: HTMLElement): void {
  if (element.classList.contains(CSS_CLASSES.IMAGE_UPLOAD_FIELD)) {
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
function isFormField(
  element: HTMLElement
): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
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
    behavior: options.behavior,
  });
  if (options.autoFocus !== false) {
    focusElement(fieldElement);
  }
  return errorInfo;
}
