import { generateSVGSprite } from './sprite';

export function initIcons(): void {
  if (document.querySelector('#block-builder-icon-sprite')) {
    return;
  }

  const spriteHTML = generateSVGSprite();

  const div = document.createElement('div');
  div.innerHTML = spriteHTML;
  div.style.display = 'none';
  div.id = 'block-builder-icon-sprite';
  document.body.append(div);
}

export { generateSVGSprite, getIconHTML, ICON_SYMBOLS } from './sprite';
