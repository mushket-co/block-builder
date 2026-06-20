const ARROW_UP =
  '<path d="M6.1,0.2C5.8-0.1,5.3-0.1,5,0.2L0.2,5c-0.3,0.3-0.3,0.8,0,1.1s0.8,0.3,1.1,0l4.2-4.2l4.2,4.2c0.3,0.3,0.8,0.3,1.1,0s0.3-0.8,0-1.1L6.1,0.2z M6.3,14.8v-14H4.8v14H6.3z"/>';

const COPY_OVERLAY =
  '<rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" fill="none"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" fill="none"/>';

const ID_BADGE =
  '<path d="M39 19.434h-5.384v25.133H39c2.969 0 5.386-2.322 5.386-5.174V24.609c0-2.853-2.417-5.175-5.386-5.175"/><path d="M52 2H12C6.477 2 2 6.477 2 12v40c0 5.523 4.477 10 10 10h40c5.523 0 10-4.477 10-10V12c0-5.523-4.477-10-10-10M23 49h-4V15h4v34m26-9.607a9.251 9.251 0 0 1-.787 3.738a9.592 9.592 0 0 1-2.143 3.055a10.032 10.032 0 0 1-3.178 2.059A10.302 10.302 0 0 1 39 49H29V15h10c1.348 0 2.657.254 3.893.754c1.19.484 2.26 1.176 3.178 2.059s1.638 1.912 2.143 3.053A9.294 9.294 0 0 1 49 24.609v14.784"/>';

export const ICON_SYMBOLS = {
  id: ID_BADGE,

  arrowUp: ARROW_UP,

  arrowDown: `<g transform="rotate(180 5.5 7.4)">${ARROW_UP}</g>`,

  chevronDown:
    '<path d="M14 1.43408L7.5 7.56616L1 1.43408" stroke="currentColor" fill="none"/>',

  check: '<polyline points="20 6 9 17 4 12" stroke="currentColor" fill="none"/>',

  loader:
    '<path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" fill="none" stroke-linecap="round"/>',

  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" fill="none"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" fill="none"/>',

  duplicate: COPY_OVERLAY,

  lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" fill="none"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" fill="none"/>',

  unlock:
    '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" fill="none"/><path d="M7 11V7a5 5 0 0 0 10 0" stroke="currentColor" fill="none"/>',

  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" fill="none"/>',

  eyeOff:
    '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94L17.94 17.94z" stroke="currentColor" fill="none"/><path d="M1 1l22 22" stroke="currentColor"/><path d="M6.08 6.08A10.07 10.07 0 0 0 1 12s4 8 11 8a10.07 10.07 0 0 0 6-2.08" stroke="currentColor" fill="none"/><path d="M12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 3.5-4.5" stroke="currentColor" fill="none"/>',

  delete: '<path fill="currentColor" d="M381.163,57.799h-75.094C302.323,25.316,274.686,0,241.214,0c-33.471,0-61.104,25.315-64.85,57.799h-75.098c-30.39,0-55.111,24.728-55.111,55.117v2.828c0,23.223,14.46,43.1,34.83,51.199v260.369c0,30.39,24.724,55.117,55.112,55.117h210.236c30.389,0,55.111-24.729,55.111-55.117V166.944c20.369-8.1,34.83-27.977,34.83-51.199v-2.828C436.274,82.527,411.551,57.799,381.163,57.799z M241.214,26.139c19.037,0,34.927,13.645,38.443,31.66h-76.879C206.293,39.783,222.184,26.139,241.214,26.139z M375.305,427.312c0,15.978-13,28.979-28.973,28.979H136.096c-15.973,0-28.973-13.002-28.973-28.979V170.861h268.182V427.312z M410.135,115.744c0,15.978-13,28.979-28.973,28.979H101.266c-15.973,0-28.973-13.001-28.973-28.979v-2.828c0-15.978,13-28.979,28.973-28.979h279.897c15.973,0,28.973,13.001,28.973,28.979V115.744z"/><path fill="currentColor" d="M171.144,422.863c7.218,0,13.069-5.853,13.069-13.068V262.641c0-7.216-5.852-13.07-13.069-13.07c-7.217,0-13.069,5.854-13.069,13.07v147.154C158.074,417.012,163.926,422.863,171.144,422.863z"/><path fill="currentColor" d="M241.214,422.863c7.218,0,13.07-5.853,13.07-13.068V262.641c0-7.216-5.854-13.07-13.07-13.07c-7.217,0-13.069,5.854-13.069,13.07v147.154C228.145,417.012,233.996,422.863,241.214,422.863z"/><path fill="currentColor" d="M311.284,422.863c7.217,0,13.068-5.853,13.068-13.068V262.641c0-7.216-5.852-13.07-13.068-13.07c-7.219,0-13.07,5.854-13.07,13.07v147.154C298.213,417.012,304.067,422.863,311.284,422.863z"/>',

  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" fill="none"/><polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" fill="none"/><polyline points="7 3 7 8 15 8" stroke="currentColor" fill="none"/>',

  close:
    '<g transform="translate(12 12) scale(1.25654450262) translate(-9.53 -9.53)"><path fill="currentColor" d="M8.8-3.2h1.5v25.5H8.8z" transform="rotate(-45.001 9.53 9.53)"/><path fill="currentColor" d="M-3.2 8.8h25.5v1.5H-3.2z" transform="rotate(-45.001 9.53 9.53)"/></g>',
} as const;

export const ICON_VIEWBOXES: Partial<Record<keyof typeof ICON_SYMBOLS, string>> = {
  id: '0 0 64 64',
  arrowUp: '0 0 11 14.8',
  arrowDown: '0 0 11 14.8',
  chevronDown: '0 0 15 9',
  delete: '0 0 482.429 482.429',
};

const ICON_FILL_ONLY: ReadonlySet<keyof typeof ICON_SYMBOLS> = new Set([
  'id',
  'arrowUp',
  'arrowDown',
  'delete',
  'close',
]);

export function resolveIconViewBox(name: keyof typeof ICON_SYMBOLS): string {
  return ICON_VIEWBOXES[name] ?? '0 0 24 24';
}

export function resolveIconUsesFill(name: keyof typeof ICON_SYMBOLS): boolean {
  return ICON_FILL_ONLY.has(name);
}

export function generateSVGSprite(): string {
  const symbols = Object.entries(ICON_SYMBOLS)
    .map(
      ([name, content]) =>
        `<symbol id="block-builder-icon-${name}" viewBox="${resolveIconViewBox(name as keyof typeof ICON_SYMBOLS)}">${content}</symbol>`
    )
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <defs>
    ${symbols}
  </defs>
</svg>`;
}

export function getIconHTML(
  name: keyof typeof ICON_SYMBOLS,
  size = 16,
  className = ''
): string {
  const viewBox = resolveIconViewBox(name);
  const usesFill = resolveIconUsesFill(name);
  const classNames = [usesFill ? 'bb-icon--filled' : 'bb-icon--stroke', className].filter(Boolean).join(' ');
  const classAttr = ` class="${classNames}"`;

  if (usesFill) {
    return `<svg width="${size}" height="${size}" viewBox="${viewBox}" fill="currentColor"${classAttr}><use href="#block-builder-icon-${name}"/></svg>`;
  }

  return `<svg width="${size}" height="${size}" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"${classAttr}><use href="#block-builder-icon-${name}"/></svg>`;
}
