import { ERROR_MESSAGES } from './constants';

function decodeHTMLEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.textContent = text;
  return textarea.value;
}

export function parseJSONFromAttribute(attrValue: string): unknown {
  try {
    const decoded = decodeHTMLEntities(attrValue);
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error(
      `Не удалось распарсить JSON из атрибута: ${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
    );
  }
}
