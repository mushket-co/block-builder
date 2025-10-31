import { generateSVGSprite, ICON_SYMBOLS, getIconHTML } from './sprite';

export { ICON_SYMBOLS, generateSVGSprite, getIconHTML };

export function initIcons(): void {
  if (document.getElementById('block-builder-icon-sprite')) {
    return;
  }

  const spriteHTML = generateSVGSprite();
  
  const div = document.createElement('div');
  div.innerHTML = spriteHTML;
  div.style.display = 'none';
  div.id = 'block-builder-icon-sprite';
  document.body.appendChild(div);
}
