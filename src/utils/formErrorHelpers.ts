import { CSS_CLASSES } from './constants';

export function countValidationErrors(errors: Record<string, string[]>): number {
  return Object.values(errors).reduce((total, fieldErrors) => total + fieldErrors.length, 0);
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
