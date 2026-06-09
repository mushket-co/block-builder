export const ICON_SYMBOLS = {
  copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" fill="none"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" fill="none"/>',

  arrowUp: '<path d="M18 15l-6-6-6 6" stroke="currentColor" fill="none"/>',

  arrowDown: '<path d="M6 9l6 6 6-6" stroke="currentColor" fill="none"/>',

  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" fill="none"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" fill="none"/>',

  duplicate:
    '<path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="currentColor" fill="none"/><path d="M10 3v14" stroke="currentColor"/><path d="M14 3v14" stroke="currentColor"/>',

  lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" fill="none"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" fill="none"/>',

  unlock:
    '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" fill="none"/><path d="M7 11V7a5 5 0 0 0 10 0" stroke="currentColor" fill="none"/>',

  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" fill="none"/>',

  eyeOff:
    '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94L17.94 17.94z" stroke="currentColor" fill="none"/><path d="M1 1l22 22" stroke="currentColor"/><path d="M6.08 6.08A10.07 10.07 0 0 0 1 12s4 8 11 8a10.07 10.07 0 0 0 6-2.08" stroke="currentColor" fill="none"/><path d="M12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 3.5-4.5" stroke="currentColor" fill="none"/>',

  delete:
    '<polyline points="3 6 5 6 21 6" stroke="currentColor" fill="none"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" fill="none"/><line x1="10" y1="11" x2="10" y2="17" stroke="currentColor"/><line x1="14" y1="11" x2="14" y2="17" stroke="currentColor"/>',

  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" fill="none"/><polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" fill="none"/><polyline points="7 3 7 8 15 8" stroke="currentColor" fill="none"/>',
} as const;

export function generateSVGSprite(): string {
  const symbols = Object.entries(ICON_SYMBOLS)
    .map(([name, content]) => `<symbol id="icon-${name}" viewBox="0 0 24 24">${content}</symbol>`)
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <defs>
    ${symbols}
  </defs>
</svg>`;
}

export function getIconHTML(name: keyof typeof ICON_SYMBOLS, size = 16): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#icon-${name}"/></svg>`;
}
