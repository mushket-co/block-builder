import { useState } from 'react'

interface IButtonBlockProps {
  text: string
  backgroundColor?: string
  color?: string
  borderRadius?: number
  padding?: string
}

export default function ButtonBlock({
  text,
  backgroundColor = '#007bff',
  color = '#ffffff',
  borderRadius = 4,
  padding = '8px 16px',
}: IButtonBlockProps) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="button-block" style={{ textAlign: 'center', margin: '20px 0' }}>
      <div className="container">
        <button
          type="button"
          className="custom-button"
          disabled={isLoading}
          style={{
            backgroundColor,
            color,
            borderRadius: `${borderRadius}px`,
            padding,
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 500,
          }}
          onClick={() => {
            setIsLoading(true)
            setTimeout(() => setIsLoading(false), 1000)
          }}
        >
          {isLoading ? 'Загрузка...' : text}
        </button>
      </div>
    </div>
  )
}
