/**
 * Пример конфигурации блоков с использованием автоматического spacing
 * Демонстрация различных вариантов настройки отступов
 */

import { defineAsyncComponent } from 'vue'
import TextBlock from './components/TextBlock.vue'
import ImageBlock from './components/ImageBlock.vue'
import SpacedContentBlock from './components/SpacedContentBlock.vue'

export const blockConfigs = {
  // ✅ ПРИМЕР 1: Блок с автоматическим добавлением ВСЕХ отступов (по умолчанию)
  textWithAllSpacing: {
    title: 'Текст (все отступы)',
    icon: '📝',
    description: 'Текстовый блок с автоматическим полем для всех отступов',
    render: {
      kind: 'component',
      framework: 'vue',
      component: TextBlock
    },
    fields: [
      {
        field: 'content',
        label: 'Текст',
        type: 'textarea',
        placeholder: 'Введите текст...',
        rules: [{ type: 'required', message: 'Текст обязателен' }],
        defaultValue: 'Текст с автоматическими отступами'
      }
    ]
    // spacingOptions не указан = spacing добавляется автоматически со всеми типами отступов
  },

  // ✅ ПРИМЕР 2: Блок ТОЛЬКО с внутренними отступами (padding)
  textWithPaddingOnly: {
    title: 'Текст (padding only)',
    icon: '📝',
    description: 'Текстовый блок только с внутренними отступами',
    render: {
      kind: 'component',
      framework: 'vue',
      component: TextBlock
    },
    fields: [
      {
        field: 'content',
        label: 'Текст',
        type: 'textarea',
        defaultValue: 'Текст только с padding'
      }
    ],
    spacingOptions: {
      spacingTypes: ['padding-top', 'padding-bottom'] // Только padding
    }
  },

  // ✅ ПРИМЕР 3: Блок ТОЛЬКО с внешними отступами (margin)
  textWithMarginOnly: {
    title: 'Текст (margin only)',
    icon: '📝',
    description: 'Текстовый блок только с внешними отступами',
    render: {
      kind: 'component',
      framework: 'vue',
      component: TextBlock
    },
    fields: [
      {
        field: 'content',
        label: 'Текст',
        type: 'textarea',
        defaultValue: 'Текст только с margin'
      }
    ],
    spacingOptions: {
      spacingTypes: ['margin-top', 'margin-bottom'] // Только margin
    }
  },

  // ✅ ПРИМЕР 4: Блок с конкретными типами отступов
  textWithSpecificSpacing: {
    title: 'Текст (кастомные отступы)',
    icon: '📝',
    description: 'Текстовый блок с выбранными типами отступов',
    render: {
      kind: 'component',
      framework: 'vue',
      component: TextBlock
    },
    fields: [
      {
        field: 'content',
        label: 'Текст',
        type: 'textarea',
        defaultValue: 'Текст с выбранными отступами'
      }
    ],
    spacingOptions: {
      spacingTypes: ['padding-top', 'margin-bottom'] // Только эти два типа
    }
  },

  // ✅ ПРИМЕР 5: Блок с кастомными брекпоинтами
  textWithCustomBreakpoints: {
    title: 'Текст (кастомные брекпоинты)',
    icon: '📝',
    description: 'Текстовый блок с кастомными брекпоинтами (заменяют дефолтные)',
    render: {
      kind: 'component',
      framework: 'vue',
      component: TextBlock
    },
    fields: [
      {
        field: 'content',
        label: 'Текст',
        type: 'textarea',
        defaultValue: 'Текст с кастомными брекпоинтами'
      }
    ],
    spacingOptions: {
      config: {
        min: 0,
        max: 300,
        step: 8,
        breakpoints: [
          { name: 'desktop', label: 'Десктоп', maxWidth: undefined },
          { name: 'ultrawide', label: '4K', maxWidth: 2560 },
          { name: 'large', label: 'Большой', maxWidth: 1440 },
          { name: 'tablet', label: 'Планшет', maxWidth: 1024 },
          { name: 'mobile', label: 'Телефон', maxWidth: 767 }
        ]
      }
    }
  },

  // ✅ ПРИМЕР 6: Блок БЕЗ spacing (явно выключен)
  textWithoutSpacing: {
    title: 'Текст (без отступов)',
    icon: '📝',
    description: 'Текстовый блок без поля для отступов',
    render: {
      kind: 'component',
      framework: 'vue',
      component: TextBlock
    },
    fields: [
      {
        field: 'content',
        label: 'Текст',
        type: 'textarea',
        defaultValue: 'Текст без контрола отступов'
      }
    ],
    spacingOptions: {
      enabled: false // Явно выключаем spacing
    }
  },

  // ✅ ПРИМЕР 7: Блок с spacing через spacingOptions (явные поля type: 'spacing' игнорируются)
  spacedContentManual: {
    title: 'Контент с spacing',
    icon: '📐',
    description: 'Блок с spacing через spacingOptions',
    render: {
      kind: 'component',
      framework: 'vue',
      component: SpacedContentBlock
    },
    fields: [
      {
        field: 'title',
        label: 'Заголовок',
        type: 'text',
        defaultValue: 'Spacing через spacingOptions'
      },
      {
        field: 'content',
        label: 'Контент',
        type: 'textarea',
        defaultValue: 'Контент с настройками spacing через spacingOptions'
      }
      // ⚠️ ВАЖНО: Явные поля с type: 'spacing' в fields теперь ИГНОРИРУЮТСЯ
      // Все настройки spacing задаются через spacingOptions ниже
    ],
    spacingOptions: {
      enabled: true, // По умолчанию true, можно отключить установив false
      spacingTypes: ['padding-top', 'padding-bottom'], // Только padding
      config: {
        min: 0,
        max: 150,
        step: 5
        // breakpoints не указаны - будут использованы дефолтные
      }
    }
  },

  // ✅ ПРИМЕР 8: Простой блок без полей (только spacing автоматом)
  imageOnlySpacing: {
    title: 'Изображение (только spacing)',
    icon: '🖼️',
    description: 'Блок изображения с автоматическим spacing',
    render: {
      kind: 'component',
      framework: 'vue',
      component: ImageBlock
    },
    fields: [
      {
        field: 'src',
        label: 'URL изображения',
        type: 'text',
        defaultValue: '/1.jpeg',
        rules: [{ type: 'required', message: 'URL обязателен' }]
      }
    ]
    // Автоматический spacing со всеми типами отступов
  },

  // ✅ ПРИМЕР 9: Блок с настройками диапазона отступов
  textWithRangeConfig: {
    title: 'Текст (custom range)',
    icon: '📝',
    description: 'Текстовый блок с кастомным диапазоном отступов',
    render: {
      kind: 'component',
      framework: 'vue',
      component: TextBlock
    },
    fields: [
      {
        field: 'content',
        label: 'Текст',
        type: 'textarea',
        defaultValue: 'Текст с custom range'
      }
    ],
    spacingOptions: {
      config: {
        min: 10,     // Минимум 10px
        max: 100,    // Максимум 100px
        step: 10     // Шаг 10px
      }
    }
  }
};

