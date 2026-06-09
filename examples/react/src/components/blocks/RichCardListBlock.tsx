import './RichCardListBlock.css'

interface ICard {
  title?: string
  subtitle?: string
  text?: string
  detailedText?: string
  link?: string
  linkTarget?: string
  buttonText?: string
  image?: string | { src?: string }
  imageMobile?: string | { src?: string }
  imageAlt?: string
  backgroundColor?: string
  textColor?: string
  meetingPlace?: string
  meetingTime?: string
  participantsCount?: string
  relatedArticle?: { id?: number; name?: string } | number | string
}

interface IRichCardListBlockProps {
  sectionTitle?: string
  titleColor?: string
  titleSize?: number
  titleAlign?: React.CSSProperties['textAlign']
  cards?: ICard[]
  cardMinWidth?: number
  gap?: number
  cardDefaultBg?: string
  cardDefaultTextColor?: string
  cardBorderRadius?: number
  cardShadow?: string
  buttonColor?: string
  buttonTextColor?: string
  buttonBorderRadius?: number
}

function getImageUrl(image?: string | { src?: string }) {
  if (!image) {
    return ''
  }
  if (typeof image === 'string') {
    return image
  }
  return image.src || ''
}

export default function RichCardListBlock({
  sectionTitle,
  titleColor = '#333333',
  titleSize = 32,
  titleAlign = 'center',
  cards = [],
  cardMinWidth = 300,
  gap = 24,
  cardDefaultBg = '#ffffff',
  cardDefaultTextColor = '#333333',
  cardBorderRadius = 12,
  cardShadow = '0 4px 12px rgba(0, 0, 0, 0.1)',
  buttonColor = '#667eea',
  buttonTextColor = '#ffffff',
  buttonBorderRadius = 6,
}: IRichCardListBlockProps) {
  return (
    <div className="rich-card-list">
      <div className="container">
        {sectionTitle ? (
          <h2
            className="rich-card-list__title"
            style={{ color: titleColor, fontSize: `${titleSize}px`, textAlign: titleAlign }}
          >
            {sectionTitle}
          </h2>
        ) : null}

        <div
          className="rich-card-list__grid"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(${cardMinWidth}px, 1fr))`,
            gap: `${gap}px`,
          }}
        >
          {cards.map((card, index) => (
            <div
              key={`${card.title}-${index}`}
              className="rich-card"
              style={{
                backgroundColor: card.backgroundColor || cardDefaultBg,
                color: card.textColor || cardDefaultTextColor,
                borderRadius: `${cardBorderRadius}px`,
                boxShadow: cardShadow === 'none' ? 'none' : cardShadow,
              }}
            >
              {card.image || card.imageMobile ? (
                <div className="rich-card__image-wrapper">
                  <picture>
                    {card.imageMobile ? (
                      <source
                        srcSet={getImageUrl(card.imageMobile)}
                        media="(max-width: 768px)"
                      />
                    ) : null}
                    <img
                      src={getImageUrl(card.image || card.imageMobile)}
                      alt={card.imageAlt || card.title}
                      className="rich-card__image"
                    />
                  </picture>
                </div>
              ) : null}

              <div className="rich-card__content">
                {card.title ? <h3 className="rich-card__title">{card.title}</h3> : null}
                {card.subtitle ? <h4 className="rich-card__subtitle">{card.subtitle}</h4> : null}
                {card.text ? <p className="rich-card__text">{card.text}</p> : null}
                {card.detailedText ? (
                  <div
                    className="rich-card__detailed-text"
                    dangerouslySetInnerHTML={{ __html: card.detailedText }}
                  />
                ) : null}
                {card.relatedArticle ? (
                  <div className="rich-card__related-article">
                    <span className="rich-card__related-label">📰 Связанная статья:</span>
                    <span className="rich-card__related-value">
                      {typeof card.relatedArticle === 'object' && card.relatedArticle !== null
                        ? card.relatedArticle.name || card.relatedArticle.id
                        : card.relatedArticle}
                    </span>
                  </div>
                ) : null}
                {card.meetingPlace || card.meetingTime || card.participantsCount ? (
                  <div className="rich-card__meeting-info">
                    {card.meetingPlace ? (
                      <div className="rich-card__meeting-item">
                        <span className="rich-card__meeting-label">📍 Место:</span>
                        <span className="rich-card__meeting-value">{card.meetingPlace}</span>
                      </div>
                    ) : null}
                    {card.meetingTime ? (
                      <div className="rich-card__meeting-item">
                        <span className="rich-card__meeting-label">🕐 Время:</span>
                        <span className="rich-card__meeting-value">{card.meetingTime}</span>
                      </div>
                    ) : null}
                    {card.participantsCount ? (
                      <div className="rich-card__meeting-item">
                        <span className="rich-card__meeting-label">👥 Участников:</span>
                        <span className="rich-card__meeting-value">{card.participantsCount}</span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {card.link && card.buttonText ? (
                  <a
                    href={card.link}
                    target={card.linkTarget || '_self'}
                    rel={card.linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
                    className="rich-card__button"
                    style={{
                      backgroundColor: buttonColor,
                      color: buttonTextColor,
                      borderRadius: `${buttonBorderRadius}px`,
                    }}
                  >
                    {card.buttonText}
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
