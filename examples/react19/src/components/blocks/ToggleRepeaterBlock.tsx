interface IToggleRepeaterItem {
  name?: string
  url?: string
}

interface IToggleRepeaterBlockProps {
  showLogos?: boolean
  logos?: IToggleRepeaterItem[]
  showLinks?: boolean
  links?: IToggleRepeaterItem[]
}

export default function ToggleRepeaterBlock({
  showLogos = false,
  logos = [],
  showLinks = false,
  links = [],
}: IToggleRepeaterBlockProps) {
  return (
    <div className="toggle-repeater-block" style={{ padding: '16px 0' }}>
      <div className="container">
        <p
          style={{
            margin: '0 0 16px',
            padding: '12px 16px',
            borderRadius: 8,
            background: '#fff8e6',
            border: '1px solid #f0d78c',
            color: '#6b5a1e',
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          Regression: включите «Основные логотипы» или «Ссылки» — в форме должен появиться repeater внутри
          toggle-group.
        </p>

        {showLogos && logos.length > 0 ? (
          <section style={{ marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Логотипы</h3>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {logos.map((item, index) => (
                <li key={`logo-${index}`}>
                  <strong>{item.name || `Логотип ${index + 1}`}</strong>
                  {item.url ? ` — ${item.url}` : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {showLinks && links.length > 0 ? (
          <section>
            <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Ссылки</h3>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {links.map((item, index) => (
                <li key={`link-${index}`}>
                  {item.url ? (
                    <a
                      href={item.url}
                      style={{ color: 'var(--bb-color-primary, #0066cc)', textDecoration: 'none' }}
                    >
                      {item.name || item.url}
                    </a>
                  ) : (
                    item.name || `Ссылка ${index + 1}`
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  )
}
