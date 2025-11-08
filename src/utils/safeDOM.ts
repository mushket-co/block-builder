export function escapeHtml(text: string | number | null | undefined): string {
  if (text === null || text === undefined) {
    return '';
  }
  const stringValue = String(text);
  const div = document.createElement('div');
  div.textContent = stringValue;
  return div.innerHTML;
}
export function setTextContent(
  element: HTMLElement,
  text: string | number | null | undefined
): void {
  element.textContent = text === null || text === undefined ? '' : String(text);
}
export function createElementWithText(
  tagName: string,
  text: string | number | null | undefined = '',
  attributes: Record<string, string> = {}
): HTMLElement {
  const element = document.createElement(tagName);
  setTextContent(element, text);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });
  return element;
}
export function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}
export function parseJsonFromHtmlAttribute(text: string): unknown {
  try {
    const decoded = decodeHtmlEntities(text);
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error(
      `Failed to parse JSON from HTML attribute: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
export function setHTMLSafely(container: HTMLElement, html: string): void {
  if (!html.trim()) {
    container.innerHTML = '';
    return;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    container.textContent = html;
    return;
  }
  container.innerHTML = '';
  const body = doc.body;
  while (body.firstChild) {
    container.append(body.firstChild);
  }
}
