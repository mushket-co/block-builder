/**
 * Пример использования SpacingControl в чистом JS
 */

import { SpacingControlRenderer } from '../../../src/ui/services/SpacingControlRenderer';
import '../../../src/ui/styles/index.scss';

// Инициализация spacing контрола
export function initSpacingExample() {
  const container = document.getElementById('spacing-demo');
  
  if (!container) {
    console.error('Контейнер #spacing-demo не найден');
    return;
  }

  // Создаем экземпляр spacing контрола
  const spacingControl = new SpacingControlRenderer({
    fieldName: 'demo-spacing',
    label: 'Отступы блока',
    required: false,
    config: {
      spacingTypes: ['padding-top', 'padding-bottom', 'margin-top', 'margin-bottom'],
      min: 0,
      max: 200,
      step: 4
      // breakpoints не указан - будут использованы дефолтные (desktop, tablet, mobile)
    },
    value: {
      desktop: {
        'padding-top': 60,
        'padding-bottom': 60,
        'margin-top': 0,
        'margin-bottom': 20
      },
      tablet: {
        'padding-top': 40,
        'padding-bottom': 40,
        'margin-top': 0,
        'margin-bottom': 16
      },
      mobile: {
        'padding-top': 24,
        'padding-bottom': 24,
        'margin-top': 0,
        'margin-bottom': 12
      }
    },
    onChange: (value) => {
      console.log('Spacing изменился:', value);
      
      // Применяем изменения к демо-блоку
      applySpacingToDemo(value);
    }
  });

  // Рендерим контрол
  spacingControl.render(container);

  // Применяем начальные значения
  applySpacingToDemo(spacingControl.getValue());
}

/**
 * Применить spacing к демо-блоку
 */
function applySpacingToDemo(spacingData) {
  const demoBlock = document.getElementById('demo-block');
  
  if (!demoBlock) return;

  // Desktop (default)
  const desktop = spacingData.desktop || {};
  if (desktop['padding-top'] !== undefined) {
    demoBlock.style.setProperty('--spacing-padding-top', `${desktop['padding-top']}px`);
  }
  if (desktop['padding-bottom'] !== undefined) {
    demoBlock.style.setProperty('--spacing-padding-bottom', `${desktop['padding-bottom']}px`);
  }
  if (desktop['margin-top'] !== undefined) {
    demoBlock.style.setProperty('--spacing-margin-top', `${desktop['margin-top']}px`);
  }
  if (desktop['margin-bottom'] !== undefined) {
    demoBlock.style.setProperty('--spacing-margin-bottom', `${desktop['margin-bottom']}px`);
  }

  // Tablet
  const tablet = spacingData.tablet || {};
  if (tablet['padding-top'] !== undefined) {
    demoBlock.style.setProperty('--spacing-padding-top-tablet', `${tablet['padding-top']}px`);
  }
  if (tablet['padding-bottom'] !== undefined) {
    demoBlock.style.setProperty('--spacing-padding-bottom-tablet', `${tablet['padding-bottom']}px`);
  }
  if (tablet['margin-top'] !== undefined) {
    demoBlock.style.setProperty('--spacing-margin-top-tablet', `${tablet['margin-top']}px`);
  }
  if (tablet['margin-bottom'] !== undefined) {
    demoBlock.style.setProperty('--spacing-margin-bottom-tablet', `${tablet['margin-bottom']}px`);
  }

  // Mobile
  const mobile = spacingData.mobile || {};
  if (mobile['padding-top'] !== undefined) {
    demoBlock.style.setProperty('--spacing-padding-top-mobile', `${mobile['padding-top']}px`);
  }
  if (mobile['padding-bottom'] !== undefined) {
    demoBlock.style.setProperty('--spacing-padding-bottom-mobile', `${mobile['padding-bottom']}px`);
  }
  if (mobile['margin-top'] !== undefined) {
    demoBlock.style.setProperty('--spacing-margin-top-mobile', `${mobile['margin-top']}px`);
  }
  if (mobile['margin-bottom'] !== undefined) {
    demoBlock.style.setProperty('--spacing-margin-bottom-mobile', `${mobile['margin-bottom']}px`);
  }
}

