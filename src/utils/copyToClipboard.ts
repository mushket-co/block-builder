/**
 * Универсальная утилита для копирования текста в буфер обмена
 * Работает в различных окружениях (secure context и legacy browsers)
 * Следуем принципу Pure Function
 */

import { ERROR_MESSAGES } from './constants';

/**
 * Fallback метод для копирования в буфер обмена (для non-secure контекста)
 */
const unsecuredCopyToClipboard = (text: string): void => {
  const element = document.createElement('div');
  element.textContent = text;
  element.style.cssText =
  'position: fixed; opacity: 0; left: 50%; top: 50%; height: 1px; width: 1px; pointer-events: none; touch-action: none;';
  document.body.append(element);

  const range = document.createRange();
  range.selectNode(element);

  const selection = window.getSelection();
  if (!selection) {
  element.remove();
  return;
  }

  selection.removeAllRanges();
  selection.addRange(range);

  try {
  document.execCommand('copy');
  } catch (error) {
    // Ошибка копирования игнорируется
  } finally {
  selection.removeAllRanges();
  element.remove();
  }
};

/**
 * Копирует текст в буфер обмена
 * @param content - текст для копирования
 * @returns Promise<boolean> - true если успешно, false если произошла ошибка
 */
export const copyToClipboard = async (content: string): Promise<boolean> => {
  try {
  if (window.isSecureContext && navigator.clipboard) {
    await navigator.clipboard.writeText(content);
    return true;
  } else {
    unsecuredCopyToClipboard(content);
    return true;
  }
  } catch (error) {
    // Ошибка копирования игнорируется
    return false;
  }
};
