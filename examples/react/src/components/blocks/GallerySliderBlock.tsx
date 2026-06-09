import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface ISlide {
  image?: string | { src?: string; url?: string }
  title?: string
  description?: string
}

interface IGallerySliderBlockProps {
  title?: string
  slides?: ISlide[]
  autoplay?: boolean | string
  autoplayDelay?: number | string
  loop?: boolean | string
  spaceBetween?: number | string
}

function getImageUrl(image: ISlide['image']) {
  if (!image) {
    return ''
  }
  if (typeof image === 'string') {
    return image
  }
  if (typeof image === 'object' && image !== null) {
    return image.src || image.url || ''
  }
  return ''
}

function toBool(value: boolean | string | undefined, defaultValue = true) {
  if (typeof value === 'string') {
    return value === 'on' || value === 'true'
  }
  return value ?? defaultValue
}

function toNumber(value: number | string | undefined, defaultValue: number) {
  return typeof value === 'string' ? Number.parseInt(value, 10) : (value ?? defaultValue)
}

export default function GallerySliderBlock({
  title = 'Галерея изображений',
  slides = [],
  autoplay = true,
  autoplayDelay = 3000,
  loop = true,
  spaceBetween = 30,
}: IGallerySliderBlockProps) {
  const processedSlides = slides
    .map(slide => ({
      ...slide,
      imageUrl: getImageUrl(slide.image),
    }))
    .filter(slide => slide.imageUrl && slide.title)

  const autoplayEnabled = toBool(autoplay)
  const autoplayConfig = autoplayEnabled
    ? { delay: toNumber(autoplayDelay, 3000), disableOnInteraction: false }
    : false

  return (
    <div className="gallery-slider-block" style={{ background: '#f8f9fa', borderRadius: 8 }}>
      <div className="container">
        {title ? <h2 className="gallery-title">{title}</h2> : null}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          slidesPerView={2}
          spaceBetween={toNumber(spaceBetween, 30)}
          loop={toBool(loop)}
          autoplay={autoplayConfig}
          pagination={{ clickable: true, dynamicBullets: true }}
          navigation
          effect="slide"
          grabCursor
          className="gallery-swiper"
        >
          {processedSlides.map((slide, index) => (
            <SwiperSlide key={`${slide.title}-${index}`}>
              <div className="slide-content">
                <img src={slide.imageUrl} alt={slide.title} />
                <div className="slide-info">
                  <h3>{slide.title}</h3>
                  <p>{slide.description}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}
