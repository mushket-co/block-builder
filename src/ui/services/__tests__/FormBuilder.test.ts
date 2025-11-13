import { FormBuilder, TFieldConfig } from '../FormBuilder';

describe('FormBuilder', () => {
  let formBuilder: FormBuilder;

  beforeEach(() => {
  formBuilder = new FormBuilder();
  });

  describe('generateCreateFormHTML', () => {
  test('должен сгенерировать HTML для текстового поля', () => {
    const fields: TFieldConfig[] = [
      {
        field: 'name',
        label: 'Имя',
        type: 'text',
        placeholder: 'Введите имя'
      }
    ];

    const html = formBuilder.generateCreateFormHTML(fields);

    expect(html).toContain('name="name"');
    expect(html).toContain('placeholder="Введите имя"');
    expect(html).toContain('Имя');
    expect(html).toContain('type="text"');
  });

  test('должен использовать defaultValue', () => {
    const fields: TFieldConfig[] = [
      {
        field: 'title',
        label: 'Заголовок',
        type: 'text',
        defaultValue: 'Default Title'
      }
    ];

    const html = formBuilder.generateCreateFormHTML(fields);

    expect(html).toContain('value="Default Title"');
  });

  test('должен отметить обязательные поля', () => {
    const fields: TFieldConfig[] = [
      {
        field: 'email',
        label: 'Email',
        type: 'text',
        rules: [{ type: 'required', message: 'Email обязателен' }]
      }
    ];

    const html = formBuilder.generateCreateFormHTML(fields);

    expect(html).toContain('required');
    expect(html).toContain('<span class="required">*</span>');
  });

  test('должен сгенерировать HTML для нескольких полей', () => {
    const fields: TFieldConfig[] = [
      {
        field: 'firstName',
        label: 'Имя',
        type: 'text'
      },
      {
        field: 'lastName',
        label: 'Фамилия',
        type: 'text'
      }
    ];

    const html = formBuilder.generateCreateFormHTML(fields);

    expect(html).toContain('name="firstName"');
    expect(html).toContain('name="lastName"');
    expect(html).toContain('Имя');
    expect(html).toContain('Фамилия');
  });
  });

  describe('generateEditFormHTML', () => {
  test('должен использовать текущие значения props', () => {
    const fields: TFieldConfig[] = [
      {
        field: 'name',
        label: 'Имя',
        type: 'text'
      }
    ];
    const currentProps = { name: 'John Doe' };

    const html = formBuilder.generateEditFormHTML(fields, currentProps);

    expect(html).toContain('value="John Doe"');
  });

  test('должен использовать defaultValue если prop отсутствует', () => {
    const fields: TFieldConfig[] = [
      {
        field: 'name',
        label: 'Имя',
        type: 'text',
        defaultValue: 'Default Name'
      }
    ];
    const currentProps = {};

    const html = formBuilder.generateEditFormHTML(fields, currentProps);

    expect(html).toContain('value="Default Name"');
  });

  test('должен предпочесть currentProps над defaultValue', () => {
    const fields: TFieldConfig[] = [
      {
        field: 'title',
        label: 'Заголовок',
        type: 'text',
        defaultValue: 'Default'
      }
    ];
    const currentProps = { title: 'Current Title' };

    const html = formBuilder.generateEditFormHTML(fields, currentProps);

    expect(html).toContain('value="Current Title"');
    expect(html).not.toContain('value="Default"');
  });
  });

  describe('Типы полей', () => {
  describe('text', () => {
    test('должен сгенерировать input type="text"', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'username',
          label: 'Username',
          type: 'text'
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).toContain('type="text"');
      expect(html).toContain('name="username"');
    });
  });

  describe('textarea', () => {
    test('должен сгенерировать textarea', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'description',
          label: 'Описание',
          type: 'textarea',
          placeholder: 'Введите описание'
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).toContain('<textarea');
      expect(html).toContain('name="description"');
      expect(html).toContain('placeholder="Введите описание"');
      expect(html).toContain('rows="3"');
    });

    test('должен включить значение в textarea', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'bio',
          label: 'Биография',
          type: 'textarea',
          defaultValue: 'My bio'
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).toContain('>My bio</textarea>');
    });
  });

  describe('number', () => {
    test('должен сгенерировать input type="number"', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'age',
          label: 'Возраст',
          type: 'number'
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).toContain('type="number"');
      expect(html).toContain('name="age"');
    });

    test('должен включить числовое значение', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'rating',
          label: 'Рейтинг',
          type: 'number',
          defaultValue: 5
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).toContain('value="5"');
    });
  });

  describe('color', () => {
    test('должен сгенерировать input type="color"', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'bgColor',
          label: 'Цвет фона',
          type: 'color',
          defaultValue: '#ff0000'
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).toContain('type="color"');
      expect(html).toContain('name="bgColor"');
      expect(html).toContain('value="#ff0000"');
    });
  });

  describe('url', () => {
    test('должен сгенерировать input type="url"', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'website',
          label: 'Веб-сайт',
          type: 'url',
          placeholder: 'https://example.com'
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).toContain('type="url"');
      expect(html).toContain('name="website"');
      expect(html).toContain('placeholder="https://example.com"');
    });
  });

  describe('checkbox', () => {
    test('должен сгенерировать checkbox', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'subscribe',
          label: 'Подписаться на рассылку',
          type: 'checkbox'
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).toContain('type="checkbox"');
      expect(html).toContain('name="subscribe"');
    });

    test('должен отметить checkbox если значение true', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'agreed',
          label: 'Согласен',
          type: 'checkbox',
          defaultValue: true
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).toContain('checked');
    });

    test('не должен отмечать checkbox если значение false', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'agreed',
          label: 'Согласен',
          type: 'checkbox',
          defaultValue: false
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).not.toContain('checked');
    });
  });

  describe('select', () => {
    test('должен сгенерировать select с options', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'country',
          label: 'Страна',
          type: 'select',
          options: [
            { value: 'ru', label: 'Россия' },
            { value: 'us', label: 'США' },
            { value: 'uk', label: 'Великобритания' }
          ]
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).toContain('select-placeholder');
      expect(html).toContain('data-field-name="country"');
      expect(html).toContain('data-field-id');
    });

    test('должен выбрать option по значению', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'country',
          label: 'Страна',
          type: 'select',
          defaultValue: 'us',
          options: [
            { value: 'ru', label: 'Россия' },
            { value: 'us', label: 'США' }
          ]
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).toContain('select-placeholder');
      expect(html).toContain('data-field-name="country"');
    });

    test('должен работать без options', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'category',
          label: 'Категория',
          type: 'select'
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).toContain('select-placeholder');
      expect(html).toContain('data-field-name="category"');
    });
  });

  describe('spacing', () => {
    test('должен создать placeholder для spacing контрола', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'padding',
          label: 'Отступы',
          type: 'spacing'
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).toContain('data-field-name="padding"');
      expect(html).toContain('data-field-type="spacing"');
      expect(html).toContain('Отступы');
    });
  });

  describe('repeater', () => {
    test('должен создать placeholder для repeater контрола', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'items',
          label: 'Элементы',
          type: 'repeater'
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).toContain('data-field-name="items"');
      expect(html).toContain('data-field-type="repeater"');
      expect(html).toContain('Элементы');
    });
  });

  describe('api-select', () => {
    test('должен создать placeholder для api-select контрола', () => {
      const fields: TFieldConfig[] = [
        {
          field: 'author',
          label: 'Автор',
          type: 'api-select',
          apiConfig: {
            url: 'https://api.example.com/authors',
            method: 'GET'
          }
        }
      ];

      const html = formBuilder.generateCreateFormHTML(fields);

      expect(html).toContain('data-field-name="author"');
      expect(html).toContain('data-field-type="api-select"');
      expect(html).toContain('Автор');
    });
  });
  });

  describe('Валидация полей', () => {
  test('должен добавить required атрибут для обязательных полей', () => {
    const fields: TFieldConfig[] = [
      {
        field: 'name',
        label: 'Имя',
        type: 'text',
        rules: [{ type: 'required', message: 'Обязательно' }]
      }
    ];

    const html = formBuilder.generateCreateFormHTML(fields);

    expect(html).toContain('required');
  });

  test('не должен добавлять required если нет правила', () => {
    const fields: TFieldConfig[] = [
      {
        field: 'nickname',
        label: 'Псевдоним',
        type: 'text'
      }
    ];

    const html = formBuilder.generateCreateFormHTML(fields);

    expect(html).not.toContain('required');
  });
  });

  describe('HTML структура', () => {
  test('каждое поле должно быть обернуто в block-builder-form-group', () => {
    const fields: TFieldConfig[] = [
      {
        field: 'test',
        label: 'Тест',
        type: 'text'
      }
    ];

    const html = formBuilder.generateCreateFormHTML(fields);

    expect(html).toContain('class="block-builder-form-group"');
    expect(html).toContain('data-field-name="test"');
  });

  test('каждое поле должно иметь label', () => {
    const fields: TFieldConfig[] = [
      {
        field: 'field1',
        label: 'Поле 1',
        type: 'text'
      }
    ];

    const html = formBuilder.generateCreateFormHTML(fields);

    expect(html).toContain('<label');
    expect(html).toContain('class="block-builder-form-label"');
    expect(html).toContain('Поле 1');
  });

  test('input должен иметь класс block-builder-form-control', () => {
    const fields: TFieldConfig[] = [
      {
        field: 'test',
        label: 'Тест',
        type: 'text'
      }
    ];

    const html = formBuilder.generateCreateFormHTML(fields);

    expect(html).toContain('class="block-builder-form-control"');
  });
  });

  describe('Пустые значения', () => {
  test('должен обработать пустой массив полей', () => {
    const html = formBuilder.generateCreateFormHTML([]);

    expect(html).toBe('');
  });

  test('должен обработать поле без placeholder', () => {
    const fields: TFieldConfig[] = [
      {
        field: 'test',
        label: 'Тест',
        type: 'text'
      }
    ];

    const html = formBuilder.generateCreateFormHTML(fields);

    expect(html).toContain('placeholder=""');
  });

  test('должен обработать поле без defaultValue', () => {
    const fields: TFieldConfig[] = [
      {
        field: 'test',
        label: 'Тест',
        type: 'text'
      }
    ];

    const html = formBuilder.generateCreateFormHTML(fields);

    expect(html).toContain('value=""');
  });
  });
});

