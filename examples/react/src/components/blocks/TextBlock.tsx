import { useMemo } from 'react'

function resolveUploadUrl(value: unknown): string {
  if (!value) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return String(record.src || record.url || '')
  }
  return ''
}

function resolveUploadUrls(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(resolveUploadUrl).filter(Boolean)
  }
  const single = resolveUploadUrl(value)
  return single ? [single] : []
}

const TOPIC_LABELS: Record<string, string> = {
  dev: 'Разработка',
  design: 'Дизайн',
  marketing: 'Маркетинг',
  analytics: 'Аналитика',
}

interface ITextBlockProps {
  content: string
  fontSize?: number
  color?: string
  textAlign?: React.CSSProperties['textAlign']
  image?: unknown
  images?: unknown[]
  file?: unknown
  files?: unknown[]
  topics?: Array<string | number>
}

export default function TextBlock({
  content,
  fontSize = 16,
  color = '#333333',
  textAlign = 'left',
  image = '',
  images = [],
  file = '',
  files = [],
  topics = [],
}: ITextBlockProps) {
  const imageUrl = resolveUploadUrl(image)
  const imageUrls = resolveUploadUrls(images)
  const fileUrl = resolveUploadUrl(file)
  const fileUrls = resolveUploadUrls(files)
  const topicLabels = useMemo(
    () =>
      (Array.isArray(topics) ? topics : [])
        .map(value => TOPIC_LABELS[String(value)] || String(value))
        .filter(Boolean),
    [topics]
  )

  return (
    <div className="text-block">
      <div
        className="container"
        style={{
          textAlign,
          fontSize: `${fontSize}px`,
          color,
          padding: '10px',
          border: '1px solid #e9ecef',
          borderRadius: '4px',
          background: '#f8f9fa',
        }}
      >
        <p style={{ margin: '0 0 12px' }}>{content}</p>

        {topicLabels.length > 0 ? (
          <div style={{ marginTop: 16, textAlign: 'left' }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#6c757d' }}>
              Темы (select, multiple)
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {topicLabels.map(label => (
                <span
                  key={label}
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: '#e7f1ff',
                    color: '#0b5ed7',
                    fontSize: 13,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {imageUrl ? (
          <div style={{ marginTop: 16, textAlign: 'left' }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#6c757d' }}>
              Изображение
            </p>
            <img
              src={imageUrl}
              alt=""
              style={{ display: 'block', maxWidth: '100%', height: 'auto', borderRadius: 4 }}
            />
          </div>
        ) : null}

        {imageUrls.length > 0 ? (
          <div style={{ marginTop: 16, textAlign: 'left' }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#6c757d' }}>
              Изображения
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {imageUrls.map((url, index) => (
                <img
                  key={`image-${index}`}
                  src={url}
                  alt=""
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 4,
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}

        {fileUrl ? (
          <div style={{ marginTop: 16, textAlign: 'left' }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#6c757d' }}>
              Файл
            </p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--bb-color-primary, #0066cc)', fontSize: 14 }}
            >
              Скачать файл
            </a>
          </div>
        ) : null}

        {fileUrls.length > 0 ? (
          <div style={{ marginTop: 16, textAlign: 'left' }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#6c757d' }}>
              Файлы
            </p>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {fileUrls.map((url, index) => (
                <li key={`file-${index}`}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--bb-color-primary, #0066cc)', fontSize: 14 }}
                  >
                    Файл {index + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
