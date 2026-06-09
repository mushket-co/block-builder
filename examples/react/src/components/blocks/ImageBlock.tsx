interface IImageBlockProps {
  image: string | { src?: string }
  alt?: string
  borderRadius?: number
}

function getImageUrl(image: IImageBlockProps['image']) {
  if (typeof image === 'string') {
    return image
  }
  if (typeof image === 'object' && image !== null) {
    return image.src || ''
  }
  return ''
}

export default function ImageBlock({ image, alt = '', borderRadius = 0 }: IImageBlockProps) {
  return (
    <div className="image-block" style={{ textAlign: 'center', margin: '20px 0' }}>
      <div className="container">
        <img
          src={getImageUrl(image)}
          alt={alt}
          style={{
            borderRadius: `${borderRadius}px`,
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'cover',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          }}
        />
      </div>
    </div>
  )
}
