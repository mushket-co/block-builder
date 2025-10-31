/**
 * Тесты для CustomFieldControlRenderer
 */

import { CustomFieldControlRenderer } from '../CustomFieldControlRenderer';
import { ICustomFieldRenderer, ICustomFieldContext, ICustomFieldRenderResult } from '../../../core/ports/CustomFieldRenderer';

// Мок-рендерер для тестов
class MockCustomFieldRenderer implements ICustomFieldRenderer {
  id = 'test-field';
  name = 'Test Field';
  renderCalled = false;
  destroyCalled = false;

  render(container: HTMLElement, context: ICustomFieldContext): ICustomFieldRenderResult {
  this.renderCalled = true;

  const element = document.createElement('input');
  element.type = 'text';
  element.value = context.value || '';
  element.className = 'test-custom-field';

  element.addEventListener('input', (e) => {
    context.onChange((e.target as HTMLInputElement).value);
  });

  return {
    element,
    getValue: () => element.value,
    setValue: (value: any) => {
      element.value = value;
    },
    validate: () => {
      if (context.required && !element.value) {
        return 'Поле обязательно';
      }
      return null;
    },
    destroy: () => {
      this.destroyCalled = true;
      element.remove();
    }
  };
  }
}

describe('CustomFieldControlRenderer', () => {
  let container: HTMLElement;
  let mockRenderer: MockCustomFieldRenderer;
  let onChangeSpy: jest.Mock;
  let onErrorSpy: jest.Mock;

  beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  mockRenderer = new MockCustomFieldRenderer();
  onChangeSpy = jest.fn();
  onErrorSpy = jest.fn();
  });

  afterEach(() => {
  document.body.removeChild(container);
  });

  describe('constructor', () => {
  it('должен инициализировать renderer', async () => {
    const controlRenderer = new CustomFieldControlRenderer(
      container,
      mockRenderer,
      {
        fieldName: 'testField',
        label: 'Test Field',
        value: 'initial value',
        required: false,
        rendererId: 'test-field',
        onChange: onChangeSpy,
        onError: onErrorSpy
      }
    );

    // Ждём асинхронной инициализации
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockRenderer.renderCalled).toBe(true);
    expect(container.querySelector('.test-custom-field')).toBeTruthy();
  });

  it('должен отобразить HTML строку, если renderer возвращает строку', async () => {
    const htmlRenderer: ICustomFieldRenderer = {
      id: 'html-field',
      name: 'HTML Field',
      render: () => ({
        element: '<div class="html-field">HTML Content</div>' as any,
        getValue: () => 'value'
      })
    };

    new CustomFieldControlRenderer(
      container,
      htmlRenderer,
      {
        fieldName: 'testField',
        label: 'Test Field',
        value: '',
        required: false,
        rendererId: 'html-field',
        onChange: onChangeSpy
      }
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(container.innerHTML).toContain('HTML Content');
  });
  });

  describe('getValue', () => {
  it('должен возвращать значение из renderer.getValue()', async () => {
    const controlRenderer = new CustomFieldControlRenderer(
      container,
      mockRenderer,
      {
        fieldName: 'testField',
        label: 'Test Field',
        value: 'test value',
        required: false,
        rendererId: 'test-field',
        onChange: onChangeSpy
      }
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    const value = controlRenderer.getValue();
    expect(value).toBe('test value');
  });

  it('должен возвращать значение из onChange callback, если getValue не предоставлен', async () => {
    const simpleRenderer: ICustomFieldRenderer = {
      id: 'simple',
      name: 'Simple',
      render: (container, context) => {
        setTimeout(() => context.onChange('callback value'), 5);
        return { element: document.createElement('div') };
      }
    };

    const controlRenderer = new CustomFieldControlRenderer(
      container,
      simpleRenderer,
      {
        fieldName: 'testField',
        label: 'Test Field',
        value: 'initial',
        required: false,
        rendererId: 'simple',
        onChange: onChangeSpy
      }
    );

    await new Promise(resolve => setTimeout(resolve, 20));

    const value = controlRenderer.getValue();
    expect(value).toBe('callback value');
  });
  });

  describe('setValue', () => {
  it('должен устанавливать значение через renderer.setValue()', async () => {
    const controlRenderer = new CustomFieldControlRenderer(
      container,
      mockRenderer,
      {
        fieldName: 'testField',
        label: 'Test Field',
        value: 'initial',
        required: false,
        rendererId: 'test-field',
        onChange: onChangeSpy
      }
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    controlRenderer.setValue('new value');

    const value = controlRenderer.getValue();
    expect(value).toBe('new value');
  });

  it('не должен ломаться, если setValue не предоставлен', async () => {
    const simpleRenderer: ICustomFieldRenderer = {
      id: 'simple',
      name: 'Simple',
      render: () => ({
        element: document.createElement('div'),
        getValue: () => 'value'
      })
    };

    const controlRenderer = new CustomFieldControlRenderer(
      container,
      simpleRenderer,
      {
        fieldName: 'testField',
        label: 'Test Field',
        value: 'initial',
        required: false,
        rendererId: 'simple',
        onChange: onChangeSpy
      }
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(() => {
      controlRenderer.setValue('new value');
    }).not.toThrow();
  });
  });

  describe('validate', () => {
  it('должен вызывать renderer.validate() и возвращать ошибку', async () => {
    const controlRenderer = new CustomFieldControlRenderer(
      container,
      mockRenderer,
      {
        fieldName: 'testField',
        label: 'Test Field',
        value: '',
        required: true,
        rendererId: 'test-field',
        onChange: onChangeSpy
      }
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    const error = controlRenderer.validate();
    expect(error).toBe('Поле обязательно');
  });

  it('должен возвращать null при успешной валидации', async () => {
    const controlRenderer = new CustomFieldControlRenderer(
      container,
      mockRenderer,
      {
        fieldName: 'testField',
        label: 'Test Field',
        value: 'valid value',
        required: true,
        rendererId: 'test-field',
        onChange: onChangeSpy
      }
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    const error = controlRenderer.validate();
    expect(error).toBeNull();
  });

  it('должен возвращать null, если validate не предоставлен', async () => {
    const simpleRenderer: ICustomFieldRenderer = {
      id: 'simple',
      name: 'Simple',
      render: () => ({
        element: document.createElement('div'),
        getValue: () => 'value'
      })
    };

    const controlRenderer = new CustomFieldControlRenderer(
      container,
      simpleRenderer,
      {
        fieldName: 'testField',
        label: 'Test Field',
        value: '',
        required: true,
        rendererId: 'simple',
        onChange: onChangeSpy
      }
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    const error = controlRenderer.validate();
    expect(error).toBeNull();
  });
  });

  describe('destroy', () => {
  it('должен вызывать renderer.destroy()', async () => {
    const controlRenderer = new CustomFieldControlRenderer(
      container,
      mockRenderer,
      {
        fieldName: 'testField',
        label: 'Test Field',
        value: 'test',
        required: false,
        rendererId: 'test-field',
        onChange: onChangeSpy
      }
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    controlRenderer.destroy();

    expect(mockRenderer.destroyCalled).toBe(true);
  });

  it('не должен ломаться, если destroy не предоставлен', async () => {
    const simpleRenderer: ICustomFieldRenderer = {
      id: 'simple',
      name: 'Simple',
      render: () => ({
        element: document.createElement('div'),
        getValue: () => 'value'
      })
    };

    const controlRenderer = new CustomFieldControlRenderer(
      container,
      simpleRenderer,
      {
        fieldName: 'testField',
        label: 'Test Field',
        value: 'test',
        required: false,
        rendererId: 'simple',
        onChange: onChangeSpy
      }
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(() => {
      controlRenderer.destroy();
    }).not.toThrow();
  });
  });

  describe('onChange callback', () => {
  it('должен вызывать внешний onChange при изменении значения', async () => {
    new CustomFieldControlRenderer(
      container,
      mockRenderer,
      {
        fieldName: 'testField',
        label: 'Test Field',
        value: 'initial',
        required: false,
        rendererId: 'test-field',
        onChange: onChangeSpy
      }
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    const input = container.querySelector('.test-custom-field') as HTMLInputElement;
    input.value = 'new value';
    input.dispatchEvent(new Event('input'));

    expect(onChangeSpy).toHaveBeenCalledWith('new value');
  });
  });

  describe('error handling', () => {
  it('должен отображать ошибку при сбое инициализации', async () => {
    const errorRenderer: ICustomFieldRenderer = {
      id: 'error-field',
      name: 'Error Field',
      render: () => {
        throw new Error('Render error');
      }
    };

    new CustomFieldControlRenderer(
      container,
      errorRenderer,
      {
        fieldName: 'testField',
        label: 'Test Field',
        value: '',
        required: false,
        rendererId: 'error-field',
        onChange: onChangeSpy
      }
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    // Проверяем, что ошибка отображена в контейнере
    expect(container.textContent).toContain('Ошибка инициализации поля');
  });
  });
});

