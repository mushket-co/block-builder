/**
 * Тесты для CustomFieldRendererRegistry
 */

import { CustomFieldRendererRegistry } from '../CustomFieldRendererRegistry';
import { ICustomFieldRenderer, ICustomFieldContext } from '../../../core/ports/CustomFieldRenderer';

// Мок-рендерер для тестов
class MockCustomFieldRenderer implements ICustomFieldRenderer {
  id: string;
  name: string;

  constructor(id: string, name: string) {
  this.id = id;
  this.name = name;
  }

  render(container: HTMLElement, context: ICustomFieldContext) {
  const element = document.createElement('div');
  element.textContent = `Mock Field: ${context.label}`;
  return {
    element,
    getValue: () => context.value,
    setValue: (value: any) => {},
    validate: () => null,
    destroy: () => {}
  };
  }
}

describe('CustomFieldRendererRegistry', () => {
  let registry: CustomFieldRendererRegistry;
  let mockRenderer1: ICustomFieldRenderer;
  let mockRenderer2: ICustomFieldRenderer;

  beforeEach(() => {
  registry = new CustomFieldRendererRegistry();
  mockRenderer1 = new MockCustomFieldRenderer('test-field-1', 'Test Field 1');
  mockRenderer2 = new MockCustomFieldRenderer('test-field-2', 'Test Field 2');
  });

  describe('register', () => {
  it('должен регистрировать новый renderer', () => {
    registry.register(mockRenderer1);

    expect(registry.has('test-field-1')).toBe(true);
    expect(registry.get('test-field-1')).toBe(mockRenderer1);
  });

  it('должен перезаписывать renderer с тем же ID', () => {
    registry.register(mockRenderer1);
    const newRenderer = new MockCustomFieldRenderer('test-field-1', 'Updated Field');
    registry.register(newRenderer);

    expect(registry.get('test-field-1')).toBe(newRenderer);
  });

  it('должен регистрировать несколько renderer\'ов', () => {
    registry.register(mockRenderer1);
    registry.register(mockRenderer2);

    expect(registry.has('test-field-1')).toBe(true);
    expect(registry.has('test-field-2')).toBe(true);
  });
  });

  describe('unregister', () => {
  it('должен удалять зарегистрированный renderer', () => {
    registry.register(mockRenderer1);
    expect(registry.has('test-field-1')).toBe(true);

    const result = registry.unregister('test-field-1');

    expect(result).toBe(true);
    expect(registry.has('test-field-1')).toBe(false);
  });

  it('должен возвращать false при удалении несуществующего renderer', () => {
    const result = registry.unregister('non-existent');

    expect(result).toBe(false);
  });
  });

  describe('get', () => {
  it('должен возвращать зарегистрированный renderer', () => {
    registry.register(mockRenderer1);

    const result = registry.get('test-field-1');

    expect(result).toBe(mockRenderer1);
  });

  it('должен возвращать null для несуществующего renderer', () => {
    const result = registry.get('non-existent');

    expect(result).toBeNull();
  });
  });

  describe('has', () => {
  it('должен возвращать true для зарегистрированного renderer', () => {
    registry.register(mockRenderer1);

    expect(registry.has('test-field-1')).toBe(true);
  });

  it('должен возвращать false для незарегистрированного renderer', () => {
    expect(registry.has('non-existent')).toBe(false);
  });
  });

  describe('getAll', () => {
  it('должен возвращать пустую Map для нового registry', () => {
    const all = registry.getAll();

    expect(all).toBeInstanceOf(Map);
    expect(all.size).toBe(0);
  });

  it('должен возвращать все зарегистрированные renderer\'ы', () => {
    registry.register(mockRenderer1);
    registry.register(mockRenderer2);

    const all = registry.getAll();

    expect(all.size).toBe(2);
    expect(all.get('test-field-1')).toBe(mockRenderer1);
    expect(all.get('test-field-2')).toBe(mockRenderer2);
  });

  it('должен возвращать копию Map (изменения не влияют на registry)', () => {
    registry.register(mockRenderer1);

    const all = registry.getAll();
    all.delete('test-field-1');

    // Оригинальный registry не должен измениться
    expect(registry.has('test-field-1')).toBe(true);
  });
  });
});

