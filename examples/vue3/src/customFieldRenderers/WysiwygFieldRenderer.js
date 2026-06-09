/**
 * WysiwygFieldRenderer - кастомный рендерер поля с визуальным редактором Jodit
 * Пример реализации ICustomFieldRenderer для Vue3
 */

import { createApp } from 'vue'
import WysiwygEditor from '../components/WysiwygEditor.vue'

export class WysiwygFieldRenderer {
  constructor() {
    this.id = 'wysiwyg-editor'
    this.name = 'WYSIWYG Редактор (Jodit)'
  }

  render(container, context) {
    const wrapper = document.createElement('div')
    wrapper.className = 'wysiwyg-field-wrapper'

    container.innerHTML = ''
    container.appendChild(wrapper)

    let currentValue = context.value || ''
    let currentError = context.error || ''
    let app = null
    let instance = null

    const mountEditor = () => {
      if (app) {
        app.unmount()
      }

      app = createApp(WysiwygEditor, {
        modelValue: currentValue,
        isError: !!currentError,
        mode: context.options?.mode || 'default',
        'onUpdate:modelValue': newValue => {
          currentValue = newValue
          context.onChange(newValue)
        },
      })

      instance = app.mount(wrapper)
    }

    mountEditor()

    return {
      element: wrapper,

      getValue: () => {
        return instance?.editor?.value || currentValue || ''
      },

      setValue: value => {
        currentValue = value
        if (instance?.editor) {
          instance.editor.value = value
        } else {
          mountEditor()
        }
      },

      setError: error => {
        currentError = error || ''
        mountEditor()
      },

      validate: () => {
        const value = instance?.editor?.value || currentValue || ''
        const isEmpty = this.isEditorEmpty(value)

        if (context.required && isEmpty) {
          return `${context.label}: Поле обязательно для заполнения`
        }

        return null
      },

      destroy: () => {
        try {
          if (app) {
            app.unmount()
            app = null
          }

          if (wrapper.parentNode) {
            wrapper.parentNode.removeChild(wrapper)
          }
        } catch (error) {
          console.error('Ошибка при очистке WysiwygFieldRenderer:', error)
        }
      },
    }
  }

  isEditorEmpty(html) {
    const text = html
      .replaceAll(/<[^>]*>/g, '')
      .replaceAll('&nbsp;', ' ')
      .trim()
    return text === ''
  }
}
