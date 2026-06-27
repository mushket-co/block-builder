import './NestedRepeaterBlock.css'

interface ITag {
  name?: string
}

interface IProduct {
  name?: string
  description?: string
  price?: number | string
  image?: string | { src?: string }
  thumbnail?: string | { src?: string }
  contactEmail?: string
  productUrl?: string
  status?: string
  deliveryType?: string
  inStock?: boolean
  hasDiscount?: boolean
  discountPrice?: number | string
  accentColor?: string
  tags?: Array<ITag | string>
  customContent?: string
}

interface ICategory {
  name?: string
  description?: string
  products?: IProduct[]
}

interface INestedRepeaterBlockProps {
  title?: string
  description?: string
  categories?: ICategory[]
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

function formatPrice(price: number | string) {
  if (typeof price === 'number') {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(price)
  }
  return price
}

function formatStatus(status: string) {
  const map: Record<string, string> = {
    draft: 'Черновик',
    published: 'Опубликован',
    archived: 'В архиве',
  }
  return map[status] || status
}

function formatDelivery(type: string) {
  const map: Record<string, string> = {
    pickup: 'Самовывоз',
    courier: 'Курьер',
    post: 'Почта',
  }
  return map[type] || type
}

export default function NestedRepeaterBlock({
  title = 'Каталог товаров',
  description = '',
  categories = [],
}: INestedRepeaterBlockProps) {
  return (
    <div className="nested-repeater-block">
      <div className="container">
        {title ? <h2 className="block-title">{title}</h2> : null}
        {description ? <p className="block-description">{description}</p> : null}

        <div className="categories">
          {categories.map((category, categoryIndex) => (
            <div key={`${category.name}-${categoryIndex}`} className="category">
              <div className="category-header">
                <h3 className="category-title">
                  {category.name || `Категория ${categoryIndex + 1}`}
                </h3>
                {category.description ? (
                  <p className="category-description">{category.description}</p>
                ) : null}
              </div>

              <div className="products">
                {(category.products || []).map((product, productIndex) => (
                  <div
                    key={`${product.name}-${productIndex}`}
                    className="product"
                    style={
                      product.accentColor
                        ? { borderLeftColor: product.accentColor, borderLeftWidth: 4, borderLeftStyle: 'solid' }
                        : undefined
                    }
                  >
                    {product.image || product.thumbnail ? (
                      <div className="product-images">
                        {product.image ? (
                          <div className="product-image">
                            <img src={getImageUrl(product.image)} alt={product.name} />
                          </div>
                        ) : null}
                        {product.thumbnail ? (
                          <div className="product-thumbnail">
                            <img
                              src={getImageUrl(product.thumbnail)}
                              alt={`${product.name} - миниатюра`}
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="product-info">
                      <div className="product-head">
                        <h4 className="product-name">
                          {product.name || `Товар ${productIndex + 1}`}
                        </h4>
                        {product.inStock === false ? (
                          <span className="product-badge product-badge--out">Нет в наличии</span>
                        ) : product.inStock ? (
                          <span className="product-badge product-badge--in">В наличии</span>
                        ) : null}
                      </div>

                      {product.description ? (
                        <p className="product-description">{product.description}</p>
                      ) : null}

                      {product.tags?.length ? (
                        <div className="product-tags">
                          {product.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="product-tag">
                              {typeof tag === 'string' ? tag : tag.name}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="product-meta">
                        {product.status ? (
                          <span className="product-meta-item">
                            Статус: {formatStatus(product.status)}
                          </span>
                        ) : null}
                        {product.deliveryType ? (
                          <span className="product-meta-item">
                            Доставка: {formatDelivery(product.deliveryType)}
                          </span>
                        ) : null}
                      </div>

                      {product.contactEmail || product.productUrl ? (
                        <div className="product-links">
                          {product.contactEmail ? (
                            <a href={`mailto:${product.contactEmail}`}>{product.contactEmail}</a>
                          ) : null}
                          {product.productUrl ? (
                            <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                              Страница товара
                            </a>
                          ) : null}
                        </div>
                      ) : null}

                      {product.hasDiscount && product.discountPrice ? (
                        <div className="product-price-row">
                          <span className="product-price product-price--old">
                            {formatPrice(product.price ?? '')}
                          </span>
                          <span className="product-price">{formatPrice(product.discountPrice)}</span>
                        </div>
                      ) : product.price ? (
                        <div className="product-price">{formatPrice(product.price)}</div>
                      ) : null}

                      {product.customContent ? (
                        <div
                          className="product-custom"
                          dangerouslySetInnerHTML={{ __html: product.customContent }}
                        />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
