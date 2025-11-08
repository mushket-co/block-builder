export function decodeHTMLEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.textContent = text;
  return textarea.value;
}
export function setTextContent(element: HTMLElement, text: string): void {
  element.textContent = text;
}
export function setSafeHTML(element: HTMLElement, html: string): void {
  element.innerHTML = '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  while (temp.firstChild) {
    element.appendChild(temp.firstChild);
  }
}
export function parseJSONFromAttribute(attrValue: string): any {
  try {
    const decoded = decodeHTMLEntities(attrValue);
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error(`Failed to parse JSON from attribute: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}