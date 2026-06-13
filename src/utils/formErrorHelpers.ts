import { CSS_CLASSES } from './constants';
import { scrollToElement } from './scrollHelpers';

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

function parseNestedPath(path: string): Array<{ fieldName: string; index: number }> {
  const parts: Array<{ fieldName: string; index: number }> = [];
  let remainingPath = path;

  while (remainingPath) {
    const repeaterMatch = remainingPath.match(/^([A-Z_a-z]+)\[(\d+)]/);
    if (repeaterMatch) {
      parts.push({
        fieldName: repeaterMatch[1],
        index: Number.parseInt(repeaterMatch[2], 10),
      });
      remainingPath = remainingPath.slice(repeaterMatch[0].length);
      if (remainingPath.startsWith('.')) {
        remainingPath = remainingPath.slice(1);
      } else {
        break;
      }
    } else {
      const fieldMatch = remainingPath.match(/^([A-Z_a-z]+)/);
      if (fieldMatch) {
        remainingPath = remainingPath.slice(fieldMatch[0].length);
        if (remainingPath.startsWith('.')) {
          remainingPath = remainingPath.slice(1);
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  return parts;
}

export function getSortedErrorKeys(errors: Record<string, string[]>): string[] {
  const errorKeys = Object.keys(errors);
  if (errorKeys.length === 0) {
    return [];
  }

  return errorKeys.sort((a, b) => {
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
      const indexDiff = (aInfo.repeaterIndex || 0) - (bInfo.repeaterIndex || 0);
      if (indexDiff !== 0) {
        return indexDiff;
      }

      if (aInfo.nestedPath && bInfo.nestedPath) {
        const aPath = parseNestedPath(aInfo.nestedPath);
        const bPath = parseNestedPath(bInfo.nestedPath);

        for (let i = 0; i < Math.max(aPath.length, bPath.length); i++) {
          if (i >= aPath.length) {
            return -1;
          }
          if (i >= bPath.length) {
            return 1;
          }

          const aPart = aPath[i];
          const bPart = bPath[i];

          if (aPart.fieldName !== bPart.fieldName) {
            return aPart.fieldName.localeCompare(bPart.fieldName);
          }

          if (aPart.index !== bPart.index) {
            return aPart.index - bPart.index;
          }
        }
      }

      return a.localeCompare(b);
    }
    return a.localeCompare(b);
  });
}

export function getFirstErrorKey(errors: Record<string, string[]>): string | null {
  const sortedKeys = getSortedErrorKeys(errors);
  return sortedKeys[0] ?? null;
}

export function countValidationErrors(errors: Record<string, string[]>): number {
  return Object.values(errors).reduce((total, fieldErrors) => total + fieldErrors.length, 0);
}

export function findFieldElement(
  containerElement: HTMLElement,
  errorInfo: IFirstErrorInfo
): HTMLElement | null {
  if (!errorInfo.isRepeaterField) {
    const element = containerElement.querySelector(
      `[data-field-name="${errorInfo.fieldKey}"]`
    ) as HTMLElement;
    return element || null;
  }

  const fullFieldPath = `${errorInfo.repeaterFieldName}[${errorInfo.repeaterIndex}].${errorInfo.nestedPath || errorInfo.nestedFieldName}`;

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

  if (errorInfo.nestedPath && errorInfo.nestedPath.includes('[')) {
    const nestedField = findNestedRepeaterField(
      targetItem,
      errorInfo.nestedPath,
      errorInfo.repeaterIndex || 0
    );
    if (nestedField) {
      return nestedField;
    }
  }

  const fieldElement = targetItem.querySelector(
    `[data-field-name="${fullFieldPath}"]`
  ) as HTMLElement;
  if (fieldElement) {
    return fieldElement;
  }

  const fallbackElement = targetItem.querySelector(
    `[data-field-name*="${errorInfo.nestedFieldName}"]`
  ) as HTMLElement;
  if (fallbackElement) {
    return fallbackElement;
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

      for (const repeaterContainer of Array.from(allRepeaterContainers)) {
        const containerFieldName = (repeaterContainer as HTMLElement).dataset.fieldName || '';
        if (containerFieldName.includes(fieldName) && containerFieldName.includes(`[${index}]`)) {
          nestedRepeaterContainer = repeaterContainer as HTMLElement;
          break;
        }
      }

      if (!nestedRepeaterContainer) {
        for (const repeaterContainer of Array.from(allRepeaterContainers)) {
          const containerFieldName = (repeaterContainer as HTMLElement).dataset.fieldName || '';
          if (
            containerFieldName.endsWith(`.${fieldName}`) ||
            containerFieldName === fieldName ||
            containerFieldName.endsWith(`[${index}].${fieldName}`)
          ) {
            nestedRepeaterContainer = repeaterContainer as HTMLElement;
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
        return fieldElement || null;
      }
    }
  }

  return currentContainer;
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

function findFirstErrorElementInDOM(containerElement: HTMLElement): HTMLElement | null {
  const firstErrorFormGroup = containerElement.querySelector(
    `.${CSS_CLASSES.FORM_GROUP}.${CSS_CLASSES.ERROR}`
  ) as HTMLElement;

  if (!firstErrorFormGroup) {
    return null;
  }

  return firstErrorFormGroup;
}

export function scrollToFirstError(
  containerElement: HTMLElement,
  errors: Record<string, string[]>,
  options: {
    offset?: number;
    behavior?: ScrollBehavior;
    autoFocus?: boolean;
    scrollContainer?: HTMLElement;
  } = {}
): IFirstErrorInfo | null {
  if (Object.keys(errors).length === 0) {
    return null;
  }

  setTimeout(() => {
    let fieldElement = findFirstErrorElementInDOM(containerElement);

    if (!fieldElement) {
      const firstErrorKey = getFirstErrorKey(errors);
      if (firstErrorKey) {
        const errorInfo = parseErrorKey(firstErrorKey);
        fieldElement = findFieldElement(containerElement, errorInfo);
      }
    }

    if (!fieldElement) {
      return;
    }

    scrollToElement(fieldElement, {
      offset: options.offset,
      behavior: options.behavior,
      container: options.scrollContainer,
    });

    setTimeout(() => {
      if (options.autoFocus !== false) {
        focusElement(fieldElement);
      }
    }, 100);
  }, 300);

  const firstErrorKey = getFirstErrorKey(errors);
  return firstErrorKey ? parseErrorKey(firstErrorKey) : null;
}
