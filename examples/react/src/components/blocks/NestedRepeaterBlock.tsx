import './NestedRepeaterBlock.css'

interface IProduct {
  name?: string
  description?: string
  price?: number | string
  image?: string | { src?: string }
  thumbnail?: string | { src?: string }
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
                  <div key={`${product.name}-${productIndex}`} className="product">
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
                      <h4 className="product-name">
                        {product.name || `Товар ${productIndex + 1}`}
                      </h4>
                      {product.description ? (
                        <p className="product-description">{product.description}</p>
                      ) : null}
                      {product.price ? (
                        <div className="product-price">{formatPrice(product.price)}</div>
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
