import { createElement } from 'react'
import { createRoot } from 'react-dom/client'

import WysiwygEditor from '../components/WysiwygEditor'

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
    const root = createRoot(wrapper)

    const renderEditor = () => {
      root.render(
        createElement(WysiwygEditor, {
          modelValue: currentValue,
          isError: !!currentError,
          mode: context.options?.mode || 'default',
          onChange: newValue => {
            currentValue = newValue
            context.onChange(newValue)
          },
        })
      )
    }

    renderEditor()

    return {
      element: wrapper,
      getValue: () => currentValue,
      setValue: value => {
        currentValue = value
        renderEditor()
      },
      setError: error => {
        currentError = error || ''
        renderEditor()
      },
      validate: () => {
        if (context.required && this.isEditorEmpty(currentValue)) {
          return `${context.label}: Поле обязательно для заполнения`
        }
        return null
      },
      destroy: () => {
        queueMicrotask(() => {
          try {
            root.unmount()
          } catch {
            // root may already be unmounted during React commit
          }
          if (wrapper.parentNode) {
            wrapper.parentNode.removeChild(wrapper)
          }
        })
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
