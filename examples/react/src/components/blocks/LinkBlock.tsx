interface ILinkBlockProps {
  text?: string
  url?: string
  linkTarget?: '_self' | '_blank'
  hasBackground?: boolean
  backgroundColor?: string
  padding?: string
}

function scrollToBlockAnchor(url: string) {
  if (!url.startsWith('#')) {
    return false
  }

  const blockId = url.slice(1)
  const target = document.querySelector(`[data-block-id="${blockId}"]`)
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return true
}

export default function LinkBlock({
  text = 'Ссылка',
  url = '#',
  linkTarget = '_self',
  hasBackground = false,
  backgroundColor = '#f0f0f0',
  padding = '12px 24px',
}: ILinkBlockProps) {
  const blockStyle: React.CSSProperties = {}
  if (hasBackground) {
    blockStyle.backgroundColor = backgroundColor
    blockStyle.padding = padding
    blockStyle.borderRadius = '8px'
  }

  return (
    <div className="link-block" style={{ textAlign: 'center', margin: '20px 0', ...blockStyle }}>
      <div className="container">
        <a
          href={url}
          target={linkTarget}
          rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
          className="link-block__link"
          style={{
            color: 'var(--bb-color-primary, #0066cc)',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 500,
          }}
          onClick={event => {
            if (scrollToBlockAnchor(url)) {
              event.preventDefault()
            }
          }}
        >
          {text}
        </a>
      </div>
    </div>
  )
}
