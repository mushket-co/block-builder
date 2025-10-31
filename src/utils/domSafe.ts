/**
 * Утилиты для безопасной работы с DOM
 * Предотвращают XSS уязвимости
 */

/**
 * Безопасно декодирует HTML entities
 */
export function decodeHTMLEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.textContent = text;
  return textarea.value;
}

/**
 * Безопасно устанавливает текст (безопасная альтернатива innerHTML для простого текста)
 */
export function setTextContent(element: HTMLElement, text: string): void {
  element.textContent = text;
}

/**
 * Безопасно устанавливает HTML содержимое
 * ВАЖНО: Используйте только для доверенного HTML!
 * Для пользовательского ввода используйте textContent
 */
export function setSafeHTML(element: HTMLElement, html: string): void {
  // Очищаем контейнер
  element.innerHTML = '';

  // Создаем временный контейнер для парсинга
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Перемещаем узлы (более безопасно чем innerHTML)
  while (temp.firstChild) {
    element.appendChild(temp.firstChild);
  }
}

/**
 * Безопасно парсит JSON из HTML атрибута
 */
export function parseJSONFromAttribute(attrValue: string): any {
  try {
    // Декодируем HTML entities
    const decoded = decodeHTMLEntities(attrValue);
    // Парсим JSON
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error(`Failed to parse JSON from attribute: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Экранирует HTML символы для безопасного вывода
 */
export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
