/**
 * Демо ICustomFieldRenderer — показывает context.formScope (BB 1.8.0)
 */

export class FormScopeDemoFieldRenderer {
  constructor() {
    this.id = 'form-scope-demo'
    this.name = 'Form Scope Demo'
  }

  render(container, context) {
    const root = document.createElement('div')
    root.className = 'form-scope-demo-field'

    const paint = () => {
      const formScope = context.formScope
      if (!formScope) {
        root.innerHTML =
          '<p class="form-scope-demo-field__warn">formScope недоступен (нужен BB ≥ 1.8.0)</p>'
        return
      }

      const filterOptions = formScope.formData.filterOptions
      const filterCount = Array.isArray(filterOptions) ? filterOptions.length : 0
      const repeaterLabel = formScope.repeater
        ? `${formScope.repeater.fieldName}[${formScope.repeater.index}]`
        : 'верхний уровень формы'

      root.innerHTML = `
        <div class="form-scope-demo-field__box">
          <p><strong>formScope</strong> · ${repeaterLabel}</p>
          <p>filterOptions в formData: <strong>${filterCount}</strong></p>
          <button type="button" class="form-scope-demo-field__btn">Добавить фильтр через setField</button>
        </div>
      `

      root.querySelector('button')?.addEventListener('click', () => {
        const current = Array.isArray(formScope.formData.filterOptions)
          ? [...formScope.formData.filterOptions]
          : []
        const n = current.length + 1
        current.push({
          name: `Фильтр ${n}`,
          options: [{ name: `Вариант ${n}A` }, { name: `Вариант ${n}B` }],
        })
        formScope.setField('filterOptions', current)
        formScope.setField('showFilterOptions', true)
        paint()
      })
    }

    container.innerHTML = ''
    container.appendChild(root)
    paint()

    return {
      element: root,
      destroy: () => root.remove(),
    }
  }
}
