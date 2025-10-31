// Файл src/utils/validation.ts больше не нужен — весь legacy-валидатор удалён.

/**
 * Генератор форм для чистого JavaScript
 */
export class JavaScriptFormGenerator {
  /**
   * Генерирует HTML форму
   */
  static generateForm(config: any, onSubmit: (data: FormData) => void): string {
  const formId = `form_${Date.now()}`;

  let html = `
    <form id="${formId}" class="naberika-form">
      <div class="form-header">
        <h3>${config.title}</h3>
        ${config.description ? `<p>${config.description}</p>` : ''}
      </div>
      <div class="form-fields">
  `;

  for (const field of config.fields) {
    html += this.generateField(field);
  }

  html += `
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          ${config.submitButtonText || 'Сохранить'}
        </button>
        <button type="button" class="btn btn-secondary" onclick="this.closest('form').reset()">
          ${config.cancelButtonText || 'Отмена'}
        </button>
      </div>
    </form>
  `;

  // Добавляем стили
  html += this.generateStyles();

  // Добавляем JavaScript для валидации
  html += this.generateValidationScript(formId, config.fields, onSubmit);

  return html;
  }

  /**
   * Генерирует HTML для одного поля
   */
  private static generateField(field: any): string {
  const fieldId = `field_${field.field}`;

  switch (field.type) {
    case 'textarea':
      return `
        <div class="form-group">
          <label for="${fieldId}">${field.label}</label>
          <textarea
            id="${fieldId}"
            name="${field.field}"
            placeholder="${field.placeholder || ''}"
            class="form-control"
          >${field.defaultValue || ''}</textarea>
          <div class="field-errors" id="errors_${field.field}"></div>
        </div>
      `;

    case 'select': {
      const options = field.options?.map((opt: { value: string; label: string }) =>
        `<option value="${opt.value}">${opt.label}</option>`
      ).join('') || '';
      return `
        <div class="form-group">
          <label for="${fieldId}">${field.label}</label>
          <select id="${fieldId}" name="${field.field}" class="form-control">
            <option value="">Выберите...</option>
            ${options}
          </select>
          <div class="field-errors" id="errors_${field.field}"></div>
        </div>
      `;
    }

    case 'checkbox':
      return `
        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              id="${fieldId}"
              name="${field.field}"
              ${field.defaultValue ? 'checked' : ''}
              class="form-checkbox"
            />
            ${field.label}
          </label>
          <div class="field-errors" id="errors_${field.field}"></div>
        </div>
      `;

    case 'color':
      return `
        <div class="form-group">
          <label for="${fieldId}">${field.label}</label>
          <input
            type="color"
            id="${fieldId}"
            name="${field.field}"
            value="${field.defaultValue || '#000000'}"
            class="form-control"
          />
          <div class="field-errors" id="errors_${field.field}"></div>
        </div>
      `;

    case 'file':
      return `
        <div class="form-group">
          <label for="${fieldId}">${field.label}</label>
          <input
            type="file"
            id="${fieldId}"
            name="${field.field}"
            class="form-control"
          />
          <div class="field-errors" id="errors_${field.field}"></div>
        </div>
      `;

    default: // text, number, email, url
      return `
        <div class="form-group">
          <label for="${fieldId}">${field.label}</label>
          <input
            type="${field.type}"
            id="${fieldId}"
            name="${field.field}"
            placeholder="${field.placeholder || ''}"
            value="${field.defaultValue || ''}"
            class="form-control"
          />
          <div class="field-errors" id="errors_${field.field}"></div>
        </div>
      `;
  }
  }

  /**
   * Генерирует CSS стили для формы
   */
  private static generateStyles(): string {
  return `
    <style>
      .naberika-form {
        max-width: 500px;
        margin: 0 auto;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }

      .form-header h3 {
        margin: 0 0 10px 0;
        color: #333;
      }

      .form-header p {
        margin: 0 0 20px 0;
        color: #666;
        font-size: 14px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
        color: #333;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        cursor: pointer;
      }

      .checkbox-label input {
        margin-right: 8px;
      }

      .form-control {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        transition: border-color 0.2s;
      }

      .form-control:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
      }

      .form-control.error {
        border-color: #dc3545;
      }

      .field-errors {
        margin-top: 5px;
        font-size: 12px;
        color: #dc3545;
      }

      .field-errors .error {
        display: block;
        margin-bottom: 2px;
      }

      .form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s;
      }

      .btn-primary {
        background: #007bff;
        color: white;
      }

      .btn-primary:hover {
        background: #0056b3;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background: #545b62;
      }
    </style>
  `;
  }

  /**
   * Генерирует JavaScript для валидации
   */
  private static generateValidationScript(formId: string, fields: any[], onSubmit: (data: FormData) => void): string {
  return `
    <script>
      (function() {
        const form = document.getElementById('${formId}');
        if (!form) return;

        // Правила валидации
        const rules = ${JSON.stringify(fields.map(f => f.rules).flat())};

        // Валидация поля
        function validateField(fieldName, value) {
          const fieldRules = rules.filter(rule => rule.field === fieldName);
          const errors = [];

          for (const rule of fieldRules) {
            switch (rule.type) {
              case 'required':
                if (!value || value === '') {
                  errors.push(rule.message);
                }
                break;
              case 'email':
                if (value && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
                  errors.push(rule.message);
                }
                break;
              case 'url':
                if (value) {
                  try {
                    new URL(value);
                  } catch {
                    errors.push(rule.message);
                  }
                }
                break;
              case 'min':
                if (value && parseFloat(value) < rule.value) {
                  errors.push(rule.message);
                }
                break;
              case 'max':
                if (value && parseFloat(value) > rule.value) {
                  errors.push(rule.message);
                }
                break;
              case 'minLength':
                if (value && value.length < rule.value) {
                  errors.push(rule.message);
                }
                break;
              case 'maxLength':
                if (value && value.length > rule.value) {
                  errors.push(rule.message);
                }
                break;
              case 'pattern':
                if (value && !rule.value.test(value)) {
                  errors.push(rule.message);
                }
                break;
            }
          }

          return errors;
        }

        // Показать ошибки
        function showErrors(fieldName, errors) {
          const errorContainer = document.getElementById('errors_' + fieldName);
          if (errorContainer) {
            errorContainer.innerHTML = errors.map(error =>
              '<div class="error">' + error + '</div>'
            ).join('');
          }

          const field = form.querySelector('[name="' + fieldName + '"]');
          if (field) {
            field.classList.toggle('error', errors.length > 0);
          }
        }

        // Очистить ошибки
        function clearErrors(fieldName) {
          const errorContainer = document.getElementById('errors_' + fieldName);
          if (errorContainer) {
            errorContainer.innerHTML = '';
          }

          const field = form.querySelector('[name="' + fieldName + '"]');
          if (field) {
            field.classList.remove('error');
          }
        }

        // Валидация всей формы
        function validateForm() {
          let isValid = true;
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());

          for (const field of ${JSON.stringify(fields)}) {
            const value = data[field.field];
            const errors = validateField(field.field, value);

            if (errors.length > 0) {
              showErrors(field.field, errors);
              isValid = false;
            } else {
              clearErrors(field.field);
            }
          }

          return { isValid, data };
        }

        // Обработчик отправки формы
        form.addEventListener('submit', function(e) {
          e.preventDefault();

          const { isValid, data } = validateForm();

          if (isValid) {
            // Преобразуем данные
            const processedData = {};
            for (const [key, value] of Object.entries(data)) {
              const field = ${JSON.stringify(fields)}.find(f => f.field === key);
              if (field) {
                if (field.type === 'number') {
                  processedData[key] = parseFloat(value) || 0;
                } else if (field.type === 'checkbox') {
                  processedData[key] = !!value;
                } else {
                  processedData[key] = value;
                }
              }
            }

            ${onSubmit.toString()}(processedData);
          }
        });

        // Валидация в реальном времени
        form.addEventListener('input', function(e) {
          if (e.target.name) {
            const errors = validateField(e.target.name, e.target.value);
            if (errors.length > 0) {
              showErrors(e.target.name, errors);
            } else {
              clearErrors(e.target.name);
            }
          }
        });
      })();
    </script>
  `;
  }
}
