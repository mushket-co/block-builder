import './FormFeaturesDemoBlock.css'

interface IFilterOption {
  name: string
}

interface IFilter {
  name: string
  options?: IFilterOption[]
}

interface IItem {
  title?: string
  filters?: string[]
}

interface IFormFeaturesDemoBlockProps {
  blockTitle?: string
  showFilterOptions?: boolean
  filterOptions?: IFilter[]
  items?: IItem[]
}

export function FormFeaturesDemoBlock({
  blockTitle = 'Form Features Demo',
  showFilterOptions = false,
  filterOptions = [],
  items = [],
}: IFormFeaturesDemoBlockProps) {
  return (
    <section className="form-features-demo-block">
      <div className="container">
        <h2 className="form-features-demo-block__title">{blockTitle}</h2>
        <p className="form-features-demo-block__hint">
          После save в localStorage нет полей <code>_xlsxImport</code>, <code>_demoHelper</code> —
          только данные ниже.
        </p>

        {showFilterOptions && filterOptions.length > 0 ? (
          <div className="form-features-demo-block__filters">
            <h3>Фильтры</h3>
            <ul>
              {filterOptions.map((filter, index) => (
                <li key={`f-${index}`}>
                  <strong>{filter.name}</strong>:{' '}
                  {(filter.options || []).map(option => option.name).join(', ') || '—'}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {items.length > 0 ? (
          <div className="form-features-demo-block__cards">
            <h3>Карточки</h3>
            {items.map((item, index) => (
              <article key={`item-${index}`} className="form-features-demo-block__card">
                <h4>{item.title || `Карточка ${index + 1}`}</h4>
                {item.filters?.length ? (
                  <p>
                    Фильтры:{' '}
                    {item.filters.map((value, fi) => (
                      <span key={fi} className="form-features-demo-block__tag">
                        {value}
                      </span>
                    ))}
                  </p>
                ) : (
                  <p className="form-features-demo-block__muted">Без привязки к фильтрам</p>
                )}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
