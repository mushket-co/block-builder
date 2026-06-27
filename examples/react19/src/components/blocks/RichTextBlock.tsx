interface IRichTextBlockProps {
  content?: string
  fontSize?: number
  textColor?: string
  textAlign?: React.CSSProperties['textAlign']
  padding?: string
}

export default function RichTextBlock({
  content = '',
  fontSize = 16,
  textColor = '#333333',
  textAlign = 'left',
  padding = '20px',
}: IRichTextBlockProps) {
  return (
    <div className="rich-text-block">
      <div
        className="container"
        style={{ fontSize: `${fontSize}px`, color: textColor, padding, textAlign }}
      >
        <div className="rich-text-block__content" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  )
}
