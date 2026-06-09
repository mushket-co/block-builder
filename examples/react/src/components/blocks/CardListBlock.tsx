import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

interface ICard {
  title?: string
  text?: string
  button?: string
  link?: string
  image?: string | { src?: string }
}

interface ICardListBlockProps {
  title?: string
  cards?: ICard[]
  cardBackground?: string
  cardTextColor?: string
  cardBorderRadius?: number
  columns?: string | number
  gap?: number
}

function getImageUrl(image?: ICard['image']) {
  if (!image) {
    return ''
  }
  if (typeof image === 'string') {
    return image
  }
  return image.src || ''
}

export default function CardListBlock({
  title = 'Наши услуги',
  cards = [],
  cardBackground = '#ffffff',
  cardTextColor = '#333333',
  cardBorderRadius = 8,
  columns = '3',
  gap = 16,
}: ICardListBlockProps) {
  const [selectedCard, setSelectedCard] = useState<ICard | null>(null)

  const containerStyle = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: `${gap}px`,
      padding: '20px 0',
    }),
    [columns, gap]
  )

  const cardStyle = {
    backgroundColor: cardBackground,
    color: cardTextColor,
    borderRadius: `${cardBorderRadius}px`,
    padding: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  }

  return (
    <div className="card-list-block">
      <div className="container">
        {title ? <h2 className="list-title">{title}</h2> : null}
        <div className="cards-container" style={containerStyle}>
          {cards.map((card, index) => (
            <div
              key={`${card.title}-${index}`}
              className="card"
              style={cardStyle}
              onClick={event => {
                event.preventDefault()
                setSelectedCard(card)
              }}
            >
              {card.image ? (
                <div className="card-image">
                  <img src={getImageUrl(card.image)} alt={card.title} />
                </div>
              ) : null}
              <h3 className="card-title">{card.title}</h3>
              <p className="card-text">{card.text}</p>
              {card.button && card.link ? <span className="card-button">{card.button}</span> : null}
            </div>
          ))}
        </div>
      </div>

      {selectedCard
        ? createPortal(
            <div className="card-modal-overlay" onClick={() => setSelectedCard(null)}>
              <div className="card-modal-content" onClick={event => event.stopPropagation()}>
                <div className="modal-header">
                  <h3>{selectedCard.title}</h3>
                  <button type="button" className="close-button" onClick={() => setSelectedCard(null)}>
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  {selectedCard.image ? (
                    <img src={getImageUrl(selectedCard.image)} alt={selectedCard.title} />
                  ) : null}
                  <h4>{selectedCard.title}</h4>
                  <p>{selectedCard.text}</p>
                  {selectedCard.link ? (
                    <div className="modal-actions">
                      <button
                        type="button"
                        className="action-button"
                        onClick={() => {
                          window.open(selectedCard.link, '_blank')
                          setSelectedCard(null)
                        }}
                      >
                        {selectedCard.button}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
