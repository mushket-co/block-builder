import TextBlock from './components/TextBlock.vue'
import ButtonBlock from './components/ButtonBlock.vue'
import NestedRepeaterBlock from '../../vue3/src/components/NestedRepeaterBlock.vue'
import {
  createNestedRepeaterBlockConfig,
  createNestedRepeaterDefaultCategory,
} from '../../shared/nestedRepeaterBlockConfig.js'

export const blockConfigs = {
  text: {
    title: 'Text block',
    icon: '/icons/text.svg',
    description: 'Simple text content',
    render: {
      kind: 'component',
      framework: 'vue',
      component: TextBlock,
    },
    fields: [
      {
        field: 'content',
        label: 'Text',
        type: 'textarea',
        placeholder: 'Enter text…',
        rules: [{ type: 'required', message: 'Text is required' }],
        defaultValue: 'Theme demo: open the block form to see customized controls.',
      },
      {
        field: 'fontSize',
        label: 'Font size',
        type: 'number',
        rules: [
          { type: 'required', message: 'Required' },
          { type: 'min', value: 12, message: 'Min: 12px' },
          { type: 'max', value: 48, message: 'Max: 48px' },
        ],
        defaultValue: 18,
      },
      {
        field: 'color',
        label: 'Text color',
        type: 'color',
        defaultValue: '#333333',
      },
      {
        field: 'textAlign',
        label: 'Alignment',
        type: 'select',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
        defaultValue: 'left',
      },
    ],
  },

  button: {
    title: 'Button',
    icon: '/icons/button.svg',
    description: 'Call-to-action button',
    render: {
      kind: 'component',
      framework: 'vue',
      component: ButtonBlock,
    },
    fields: [
      {
        field: 'text',
        label: 'Button text',
        type: 'text',
        rules: [{ type: 'required', message: 'Required' }],
        defaultValue: 'Click me',
      },
      {
        field: 'backgroundColor',
        label: 'Background',
        type: 'color',
        defaultValue: '#007bff',
      },
      {
        field: 'color',
        label: 'Text color',
        type: 'color',
        defaultValue: '#ffffff',
      },
      {
        field: 'borderRadius',
        label: 'Border radius',
        type: 'number',
        defaultValue: 8,
      },
    ],
  },

  nestedRepeater: createNestedRepeaterBlockConfig({
    component: NestedRepeaterBlock,
    framework: 'vue',
    locale: 'en',
  }),
}
