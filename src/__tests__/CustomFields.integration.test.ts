import { BlockBuilderFacade } from '../BlockBuilderFacade';
import { ICustomFieldRenderer, ICustomFieldContext } from '../core/ports/CustomFieldRenderer';
class TestCustomFieldRenderer implements ICustomFieldRenderer {
  id = 'test-custom-field';
  name = 'Test Custom Field';
  render(container: HTMLElement, context: ICustomFieldContext) {
  const wrapper = document.createElement('div');
  wrapper.className = 'test-custom-field-wrapper';
  const input = document.createElement('input');
  input.type = 'text';
  input.value = context.value || '';
  input.className = 'test-custom-field-input';
  input.placeholder = context.label;
  input.addEventListener('input', (e) => {
    const newValue = (e.target as HTMLInputElement).value;
    context.onChange(newValue);
  });
  wrapper.appendChild(input);
  return {
    element: wrapper,
    getValue: () => input.value,
    setValue: (value: any) => {
      input.value = value;
    },
    validate: () => {
      if (context.required && !input.value.trim()) {
        return 'Поле обязательно';
      }
      if (input.value.length < 3) {
        return 'Минимум 3 символа';
      }
      return null;
    },
    destroy: () => {
      wrapper.remove();
    }
  };
  }
}
describe('Custom Fields Integration', () => {
  let facade: BlockBuilderFacade;
  let testRenderer: TestCustomFieldRenderer;
  beforeEach(() => {
  testRenderer = new TestCustomFieldRenderer();
  const blockConfigs = {
    testBlock: {
      title: 'Test Block',
      icon: '🧪',
      description: 'Block with custom field',
      render: {
        kind: 'html',
        template: (props: any) => `<div>${props.customField}</div>`
      },
      fields: [
        {
          field: 'customField',
          label: 'Custom Field',
          type: 'custom',
          customFieldConfig: {
            rendererId: 'test-custom-field',
            options: { mode: 'test' }
          },
          rules: [
            { type: 'required', message: 'Поле обязательно' }
          ],
          defaultValue: ''
        }
      ]
    }
  };
  facade = new BlockBuilderFacade({
    blockConfigs,
    autoInit: false
  });
  });
  afterEach(() => {
  });
  describe('registerCustomFieldRenderer', () => {
  it('должен регистрировать кастомный renderer', () => {
    facade.registerCustomFieldRenderer(testRenderer);
    expect(facade.hasCustomFieldRenderer('test-custom-field')).toBe(true);
  });
  it('должен возвращать зарегистрированный renderer', () => {
    facade.registerCustomFieldRenderer(testRenderer);
    const retrieved = facade.getCustomFieldRenderer('test-custom-field');
    expect(retrieved).toBe(testRenderer);
  });
  });
  describe('registerCustomFieldRenderers', () => {
  it('должен регистрировать несколько renderer\'ов', () => {
    const renderer2 = {
      ...testRenderer,
      id: 'test-custom-field-2',
      name: 'Test Custom Field 2'
    };
    facade.registerCustomFieldRenderers([testRenderer, renderer2]);
    expect(facade.hasCustomFieldRenderer('test-custom-field')).toBe(true);
    expect(facade.hasCustomFieldRenderer('test-custom-field-2')).toBe(true);
  });
  });
  describe('unregisterCustomFieldRenderer', () => {
  it('должен удалять зарегистрированный renderer', () => {
    facade.registerCustomFieldRenderer(testRenderer);
    expect(facade.hasCustomFieldRenderer('test-custom-field')).toBe(true);
    const result = facade.unregisterCustomFieldRenderer('test-custom-field');
    expect(result).toBe(true);
    expect(facade.hasCustomFieldRenderer('test-custom-field')).toBe(false);
  });
  it('должен возвращать false при удалении несуществующего renderer', () => {
    const result = facade.unregisterCustomFieldRenderer('non-existent');
    expect(result).toBe(false);
  });
  });
  describe('getAllCustomFieldRenderers', () => {
  it('должен возвращать все зарегистрированные renderer\'ы', () => {
    const renderer2 = {
      ...testRenderer,
      id: 'test-custom-field-2',
      name: 'Test Custom Field 2'
    };
    facade.registerCustomFieldRenderers([testRenderer, renderer2]);
    const all = facade.getAllCustomFieldRenderers();
    expect(all.size).toBe(2);
    expect(all.get('test-custom-field')).toBe(testRenderer);
    expect(all.get('test-custom-field-2')).toBe(renderer2);
  });
  });
  describe('Workflow', () => {
  it('должен корректно работать полный workflow: регистрация -> использование -> удаление', () => {
    facade.registerCustomFieldRenderer(testRenderer);
    expect(facade.hasCustomFieldRenderer('test-custom-field')).toBe(true);
    const retrieved = facade.getCustomFieldRenderer('test-custom-field');
    expect(retrieved).toBe(testRenderer);
    facade.unregisterCustomFieldRenderer('test-custom-field');
    expect(facade.hasCustomFieldRenderer('test-custom-field')).toBe(false);
  });
  it('должен сохранять renderer\'ы после destroy', () => {
    facade.registerCustomFieldRenderer(testRenderer);
    facade.destroy();
    expect(facade.hasCustomFieldRenderer('test-custom-field')).toBe(true);
    const retrieved = facade.getCustomFieldRenderer('test-custom-field');
    expect(retrieved).toBe(testRenderer);
  });
  });
  describe('Error handling', () => {
  it('должен обрабатывать отсутствующий renderer gracefully', () => {
    expect(() => {
      facade.getCustomFieldRenderer('non-existent');
    }).not.toThrow();
    const result = facade.getCustomFieldRenderer('non-existent');
    expect(result).toBeNull();
  });
  it('должен обрабатывать ошибки в renderer.render()', () => {
    const errorRenderer: ICustomFieldRenderer = {
      id: 'error-renderer',
      name: 'Error Renderer',
      render: () => {
        throw new Error('Test error');
      }
    };
    facade.registerCustomFieldRenderer(errorRenderer);
    expect(() => {
      facade.hasCustomFieldRenderer('error-renderer');
    }).not.toThrow();
  });
  });
  describe('Multiple instances', () => {
  it('должен поддерживать независимые реестры для разных инстансов facade', () => {
    const facade2 = new BlockBuilderFacade({
      blockConfigs: {},
      autoInit: false
    });
    facade.registerCustomFieldRenderer(testRenderer);
    expect(facade.hasCustomFieldRenderer('test-custom-field')).toBe(true);
    expect(facade2.hasCustomFieldRenderer('test-custom-field')).toBe(false);
    facade2.destroy();
  });
  });
});