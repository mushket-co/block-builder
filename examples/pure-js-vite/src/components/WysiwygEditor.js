/**
 * Pure JS WYSIWYG редактор на базе Jodit
 * Версия без фреймворков для использования с Vite
 */

import 'jodit/es2021/jodit.min.css'
import { Jodit } from 'jodit'
import Typograf from 'typograf'

/**
 * Создаёт и инициализирует WYSIWYG редактор
 * @param {HTMLElement} container - Контейнер для редактора
 * @param {Object} options - Опции редактора
 * @param {string} options.value - Начальное значение
 * @param {string} options.mode - Режим редактора ('default' | 'minimal')
 * @param {Function} options.onChange - Колбэк при изменении значения
 * @param {Function} options.onError - Колбэк при ошибке
 * @returns {Object} API редактора
 */
export function createWysiwygEditor(container, options = {}) {
  const {
    value = '',
    mode = 'default',
    onChange = () => {},
    onError = () => {}
  } = options

  // Добавляем классы к контейнеру
  container.className += ` wyz-editor u-base-wyz-content wyz-editor--mode-${mode}`

  // Создаём элемент для Jodit
  const editorElement = document.createElement('div')
  editorElement.innerHTML = value
  container.appendChild(editorElement)

  // Инициализируем Typograf
  const tp = new Typograf({ locale: ['ru', 'en-US'] })

  // Кастомная кнопка плагина типографики (должна быть до создания Jodit)
  Jodit.defaultOptions.controls.typography = {
    name: 'typography',
    text: 'Типографика',
    tooltip: 'Применить типографику',
    exec: (editor) => {
      editor.value = tp.execute(editor.value)
      editor.events.fire('change')
    }
  }

  // Инициализируем Jodit с настройками из Vue3 версии
  const editor = Jodit.make(editorElement, {
    language: 'ru',
    showCharsCounter: false,
    showXPathInStatusbar: false,

    processPaste: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,

    disablePlugins: ['clipboard', 'paste'],

    buttons: [
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'ul',
      'ol',
      'paragraph',
      'superscript',
      'subscript',
      'link',
      'symbols',
      '|',
      'typography',
      'undo',
      'redo',
      'fullsize'
    ],

    uploader: {
      insertImageAsBase64URI: true
    }
  })

  // Обработчик paste
  const handlePaste = (event) => {
    event.preventDefault()
    const clipboardData = event.clipboardData || window.clipboardData
    const pastedText = clipboardData.getData('text/plain')
    
    if (editor && editor.selection) {
      editor.selection.insertHTML(pastedText)
    }
  }

  // Добавляем обработчик paste
  const editorDomElement = editor.editor
  editorDomElement.addEventListener('paste', handlePaste)

  // Обработчик изменений
  editor.events.on('change', () => {
    onChange(editor.value)
  })

  // Устанавливаем начальное значение
  if (value) {
    editor.value = value
  }

  // Публичный API
  return {
    /**
     * Получить текущее значение
     */
    getValue: () => {
      return editor.value
    },

    /**
     * Установить значение
     */
    setValue: (newValue) => {
      editor.value = newValue
    },

    /**
     * Валидация
     */
    validate: () => {
      const content = editor.value
      if (!content || content.trim() === '' || content === '<p><br></p>') {
        return 'Содержимое не может быть пустым'
      }
      return null
    },

    /**
     * Уничтожить редактор
     */
    destroy: () => {
      if (editor && editor.editor) {
        editorDomElement.removeEventListener('paste', handlePaste)
      }
      if (editor) {
        editor.destruct()
      }
      // Очищаем контейнер
      container.innerHTML = ''
      // Удаляем добавленные классы
      container.className = container.className
        .replace('wyz-editor', '')
        .replace('u-base-wyz-content', '')
        .replace(`wyz-editor--mode-${mode}`, '')
        .trim()
    }
  }
}

