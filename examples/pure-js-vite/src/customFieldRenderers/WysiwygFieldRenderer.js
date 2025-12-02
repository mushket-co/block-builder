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

    // Объявляем переменную для API редактора
    let editorAPI = null

    // Инициализируем редактор прямо в wrapper
    editorAPI = createWysiwygEditor(wrapper, {
      value: value || '<p></p>',
      mode: options.mode || 'default',
      onChange: (newValue) => {
        // Вызываем onChange из контекста
        onChange(newValue)

        // Валидация при изменении (проверяем что editorAPI уже инициализирован)
        if (required && editorAPI) {
          try {
            const error = editorAPI.validate()
            onError(error)
          } catch (err) {
            // Игнорируем ошибки валидации если редактор еще не готов
          }
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
        if (!editorAPI) {
          return value || ''
        }
        return editorAPI.getValue()
      },

      setValue: (newValue) => {
        if (editorAPI) {
          editorAPI.setValue(newValue)
        }
      },

      validate: () => {
        if (!editorAPI) {
          return null
        }
        if (required) {
          return editorAPI.validate()
        }
        return null
      },

      destroy: () => {
        if (editorAPI) {
          editorAPI.destroy()
          editorAPI = null
        }
      }
    }
  }
}

// Экспортируем также функцию-фабрику для удобства
export function createWysiwygFieldRenderer() {
  return new WysiwygFieldRenderer()
}

