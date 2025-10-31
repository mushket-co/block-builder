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

  /**
   * Рендерит визуальный редактор в контейнер
   * @param {HTMLElement} container - Контейнер для рендеринга
   * @param {Object} context - Контекст с данными поля
   * @returns {Object} Результат рендеринга
   */
  render(container, context) {
    // Создаем обертку для Vue компонента
    const wrapper = document.createElement('div')
    wrapper.className = 'wysiwyg-field-wrapper'
    
    // Очищаем контейнер и добавляем обертку
    container.innerHTML = ''
    container.appendChild(wrapper)

    // Создаем Vue приложение с компонентом редактора
    const app = createApp(WysiwygEditor, {
      modelValue: context.value || '',
      isError: false,
      mode: context.options?.mode || 'default',
      'onUpdate:modelValue': (newValue) => {
        // Вызываем onChange callback при изменении значения
        context.onChange(newValue)
      }
    })

    // Монтируем приложение
    const instance = app.mount(wrapper)

    // Возвращаем результат с методами управления
    return {
      element: wrapper,
      
      // Получение текущего значения
      getValue: () => {
        return instance.editor?.value || ''
      },

      // Установка значения программно
      setValue: (value) => {
        if (instance.editor) {
          instance.editor.value = value
        }
      },

      // Валидация поля
      validate: () => {
        const value = instance.editor?.value || ''
        const isEmpty = this.isEditorEmpty(value)
        
        if (context.required && isEmpty) {
          return `${context.label}: Поле обязательно для заполнения`
        }
        
        return null
      },

      // Очистка ресурсов
      destroy: () => {
        try {
          // Размонтируем Vue приложение
          app.unmount()
          
          // Удаляем обертку из DOM
          if (wrapper.parentNode) {
            wrapper.parentNode.removeChild(wrapper)
          }
        } catch (error) {
          console.error('Ошибка при очистке WysiwygFieldRenderer:', error)
        }
      }
    }
  }

  /**
   * Проверяет, пустой ли редактор
   * @param {string} html - HTML контент
   * @returns {boolean}
   */
  isEditorEmpty(html) {
    const text = html
      .replaceAll(/<[^>]*>/g, '')
      .replaceAll('&nbsp;', ' ')
      .trim()
    return text === ''
  }
}

