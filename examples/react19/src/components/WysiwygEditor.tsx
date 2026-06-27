import 'jodit/es2021/jodit.min.css'
import { Jodit } from 'jodit'
import { useEffect, useRef } from 'react'
import Typograf from 'typograf'

interface IWysiwygEditorProps {
  modelValue?: string
  isError?: boolean
  mode?: 'default' | 'primary'
  onChange?: (value: string) => void
}

function isEditorEmpty(html: string) {
  const text = html
    .replaceAll(/<[^>]*>/g, '')
    .replaceAll('&nbsp;', ' ')
    .trim()
  return text === ''
}

export default function WysiwygEditor({
  modelValue = '',
  isError = false,
  mode = 'default',
  onChange,
}: IWysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const joditRef = useRef<ReturnType<typeof Jodit.make> | null>(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])
  const typografRef = useRef(
    new Typograf({
      locale: ['ru', 'en-US'],
      enableRule: [
        'ru/quote/main',
        'ru/quote/second',
        'ru/dash/main',
        'ru/nbsp/afterShortWord',
        'ru/nbsp/afterParagraphMark',
        'common/nbsp/afterCurrency',
        'common/space/delBeforePunctuation',
      ],
      disableRule: ['ru/phone-number/main'],
    })
  )

  useEffect(() => {
    if (!editorRef.current) {
      return
    }

    Jodit.defaultOptions.controls.typography = {
      name: 'typography',
      text: 'Типографика',
      tooltip: 'Применить типографику',
      exec: editor => {
        const joditEditor = editor as { value: string; events: { fire: (event: string) => void } }
        joditEditor.value = typografRef.current.execute(joditEditor.value)
        joditEditor.events.fire('change')
      },
    }

    const editor = Jodit.make(editorRef.current, {
      language: 'ru',
      showCharsCounter: false,
      showXPathInStatusbar: false,
      processPasteHTML: false,
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
        'fullsize',
      ],
    } as Parameters<typeof Jodit.make>[1])

    const handlePaste = (event: Event) => {
      const clipboardEvent = event as ClipboardEvent
      clipboardEvent.preventDefault()
      const text = clipboardEvent.clipboardData?.getData('text/plain') || ''
      document.execCommand('insertText', false, text)
    }

    const editorElement = editor.editor
    editorElement.addEventListener('paste', handlePaste)
    editor.events.on('change', () => {
      const value = editor.value
      onChangeRef.current?.(isEditorEmpty(value) ? '' : value)
    })

    if (modelValue) {
      editor.value = modelValue
    }

    joditRef.current = editor

    return () => {
      editorElement.removeEventListener('paste', handlePaste)
      editor.destruct()
      joditRef.current = null
    }
  }, [])

  useEffect(() => {
    if (joditRef.current && joditRef.current.value !== modelValue) {
      joditRef.current.value = modelValue
    }
  }, [modelValue])

  return (
    <div
      className={`wyz-editor u-base-wyz-content wyz-editor--mode-${mode}${isError ? ' wyz-editor--is-error' : ''}`}
    >
      <div ref={editorRef} />
    </div>
  )
}
