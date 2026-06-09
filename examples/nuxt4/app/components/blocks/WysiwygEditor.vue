<template>
  <div 
    class="wyz-editor u-base-wyz-content" 
    :class="[{ 'wyz-editor--is-error': isError }, `wyz-editor--mode-${mode}`]"
  >
    <div ref="editor" @change="onChange" v-html="localModelValue" />
  </div>
</template>

<script>
import 'jodit/es2021/jodit.min.css'
import { Jodit } from 'jodit'
import Typograf from 'typograf'

export default {
  props: {
    modelValue: {
      type: String,
      default: ''
    },

    isError: {
      type: Boolean,
      default: false
    },

    mode: {
      type: String,
      default: 'default' // default | primary
    }
  },

  emits: ['update:modelValue'],

  data() {
    return {
      editor: null,
      localModelValue: this.modelValue,
      typograf: new Typograf({
        locale: ['ru', 'en-US'],
        enableRule: [
          'ru/quote/main',
          'ru/quote/second',
          'ru/dash/main',
          'ru/nbsp/afterShortWord',
          'ru/nbsp/afterParagraphMark',
          'common/nbsp/afterCurrency',
          'common/space/delBeforePunctuation'
        ],

        disableRule: ['ru/phone-number/main']
      })
    }
  },

  mounted() {
    this.initEditor()
  },

  beforeUnmount() {
    if (this.editor && this.editor.editor) {
      this.editor.editor.removeEventListener('paste', this.handlePaste)
    }
    this.editor?.destruct()
  },

  watch: {
    modelValue(newValue) {
      if (this.editor && this.editor.value !== newValue) {
        this.editor.value = newValue
      }
    }
  },

  methods: {
    initEditor() {
      // Кастомная кнопка плагина типографики
      Jodit.defaultOptions.controls.typography = {
        name: 'typography',
        text: 'Типографика',
        tooltip: 'Применить типографику',
        exec: editor => {
          editor.value = this.typograf.execute(editor.value)
          editor.events.fire('change')
        }
      }

      this.editor = Jodit.make(this.$refs.editor, {
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
        ]
      })

      const editorElement = this.editor.editor
      editorElement.addEventListener('paste', this.handlePaste)

      this.editor.events.on('change', this.onChange)

      if (this.modelValue) {
        this.editor.value = this.modelValue
      }
    },

    applyTypography() {
      const processed = this.typograf.execute(this.editor.value)

      this.editor.value = processed
      this.$emit('update:modelValue', processed)
    },

    onChange() {
      const value = this.editor.value
      const isEmpty = this.isEditorEmpty(value)

      this.$emit('update:modelValue', isEmpty ? '' : value)
    },

    isEditorEmpty(html) {
      const text = html
        .replaceAll(/<[^>]*>/g, '')
        .replaceAll('&nbsp;', ' ')
        .trim()
      return text === ''
    },

    handlePaste(e) {
      e.preventDefault()

      const text = e.clipboardData.getData('text/plain')

      document.execCommand('insertText', false, text)
    }
  }
}
</script>

<style lang="scss" scoped>
$b: '.wyz-editor';

#{$b} {
  &--is-error {
    :deep(.jodit-container) {
      border-color: #ff4444 !important;
    }
  }

  &--mode-primary {
    :deep(.jodit-wysiwyg) {
      /* Стили для primary mode */
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
    }
  }

  &--mode-default {
    :deep(.jodit-wysiwyg) {
      ul {
        list-style: disc;
        margin-left: 24px;
      }
      ol {
        padding: 0;
        margin-left: 17px;

        li {
          &::marker {
            font-weight: 700;
          }
        }
      }

      a {
        color: #0066cc;
        transition: opacity 0.2s ease;
        text-decoration: underline;

        &:hover {
          opacity: 0.75;
        }
      }

      & > * {
        margin: 8px 0;

        &:last-child {
          margin-bottom: 0;
        }
        &:first-child {
          margin-top: 0;
        }
      }
    }
  }

  :deep(.jodit-wysiwyg) {
    font-weight: 500;
  }

  :deep(.jodit-container) {
    font-size: 16px !important;
    color: #222 !important;
  }
}
</style>

