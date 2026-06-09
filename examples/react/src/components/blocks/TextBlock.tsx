interface ITextBlockProps {
  content: string
  fontSize?: number
  color?: string
  textAlign?: React.CSSProperties['textAlign']
}

export default function TextBlock({
  content,
  fontSize = 16,
  color = '#333333',
  textAlign = 'left',
}: ITextBlockProps) {
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
        {content}
      </div>
    </div>
  )
}
