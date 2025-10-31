/**
 * Renderer для кастомного WYSIWYG поля (Pure JS версия)
 * Реализует интерфейс ICustomFieldRenderer для интеграции с Block Builder
 */

import { createWysiwygEditor } from '../components/WysiwygEditor.js'
import '../components/WysiwygEditor.css'

/**
 * WYSIWYG Field Renderer
 * Интегрирует Jodit редактор в формы Block Builder
 */
export class WysiwygFieldRenderer {
  constructor() {
    this.id = 'wysiwyg-editor'
    this.name = 'WYSIWYG редактор'
  }

  /**
   * Рендерит WYSIWYG редактор в указанный контейнер
   * @param {HTMLElement} container - Контейнер для рендера
   * @param {Object} context - Контекст с данными поля
   * @returns {Object} API управления редактором
   */
  render(container, context) {
    const {
      fieldName,
      label,
      value,
      required,
      options = {},
      onChange,
      onError
    } = context

    // Создаём wrapper для редактора, который будем возвращать
    const wrapper = document.createElement('div')
    wrapper.className = 'wysiwyg-field-wrapper'

    // Инициализируем редактор прямо в wrapper
    const editorAPI = createWysiwygEditor(wrapper, {
      value: value || '<p></p>',
      mode: options.mode || 'default',
      onChange: (newValue) => {
        // Вызываем onChange из контекста
        onChange(newValue)
        
        // Валидация при изменении
        if (required) {
          const error = editorAPI.validate()
          onError(error)
        }
      },
      onError: (error) => {
        onError(error)
      }
    })

    // Возвращаем API для Block Builder
    return {
      element: wrapper,  // Возвращаем wrapper, а не container
      
      getValue: () => {
        return editorAPI.getValue()
      },

      setValue: (newValue) => {
        editorAPI.setValue(newValue)
      },

      validate: () => {
        if (required) {
          return editorAPI.validate()
        }
        return null
      },

      destroy: () => {
        editorAPI.destroy()
      }
    }
  }
}

// Экспортируем также функцию-фабрику для удобства
export function createWysiwygFieldRenderer() {
  return new WysiwygFieldRenderer()
}

