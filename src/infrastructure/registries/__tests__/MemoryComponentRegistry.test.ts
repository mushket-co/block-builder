import { MemoryComponentRegistry } from '../MemoryComponentRegistry';
describe('MemoryComponentRegistry', () => {
  let registry: MemoryComponentRegistry;
  beforeEach(() => {
  registry = new MemoryComponentRegistry();
  });
  describe('register', () => {
  test('должен зарегистрировать компонент', () => {
    const component = { name: 'Test', template: '<div>Test</div>' };
    expect(() => {
      registry.register('TestComponent', component);
    }).not.toThrow();
  });
  test('должен бросить ошибку если имя не указано', () => {
    const component = { name: 'Test' };
    expect(() => {
      registry.register('', component);
    }).toThrow('Component name must be a non-empty string');
  });
  test('должен бросить ошибку если имя не строка', () => {
    const component = { name: 'Test' };
    expect(() => {
      registry.register(123 as any, component);
    }).toThrow('Component name must be a non-empty string');
  });
  test('должен бросить ошибку если компонент не указан', () => {
    expect(() => {
      registry.register('Test', null as any);
    }).toThrow('Component must be provided');
  });
  test('должен перезаписать существующий компонент', () => {
    const component1 = { name: 'Test1' };
    const component2 = { name: 'Test2' };
    registry.register('Test', component1);
    registry.register('Test', component2);
    const retrieved = registry.get('Test');
    expect(retrieved).toEqual(component2);
  });
  });
  describe('get', () => {
  test('должен получить зарегистрированный компонент', () => {
    const component = { name: 'Test', template: '<div>Test</div>' };
    registry.register('TestComponent', component);
    const retrieved = registry.get('TestComponent');
    expect(retrieved).toEqual(component);
  });
  test('должен вернуть null для незарегистрированного компонента', () => {
    const retrieved = registry.get('NonExistent');
    expect(retrieved).toBeNull();
  });
  });
  describe('has', () => {
  test('должен вернуть true для зарегистрированного компонента', () => {
    const component = { name: 'Test' };
    registry.register('TestComponent', component);
    expect(registry.has('TestComponent')).toBe(true);
  });
  test('должен вернуть false для незарегистрированного компонента', () => {
    expect(registry.has('NonExistent')).toBe(false);
  });
  });
  describe('getAll', () => {
  test('должен получить все компоненты', () => {
    const comp1 = { name: 'Test1' };
    const comp2 = { name: 'Test2' };
    const comp3 = { name: 'Test3' };
    registry.register('Comp1', comp1);
    registry.register('Comp2', comp2);
    registry.register('Comp3', comp3);
    const all = registry.getAll();
    expect(Object.keys(all)).toHaveLength(3);
    expect(all['Comp1']).toEqual(comp1);
    expect(all['Comp2']).toEqual(comp2);
    expect(all['Comp3']).toEqual(comp3);
  });
  test('должен вернуть пустой объект если нет компонентов', () => {
    const all = registry.getAll();
    expect(all).toEqual({});
  });
  });
  describe('unregister', () => {
  test('должен удалить компонент', () => {
    const component = { name: 'Test' };
    registry.register('TestComponent', component);
    const result = registry.unregister('TestComponent');
    expect(result).toBe(true);
    expect(registry.has('TestComponent')).toBe(false);
  });
  test('должен вернуть false для незарегистрированного компонента', () => {
    const result = registry.unregister('NonExistent');
    expect(result).toBe(false);
  });
  });
  describe('clear', () => {
  test('должен очистить все компоненты', () => {
    registry.register('Comp1', { name: 'Test1' });
    registry.register('Comp2', { name: 'Test2' });
    registry.clear();
    expect(registry.has('Comp1')).toBe(false);
    expect(registry.has('Comp2')).toBe(false);
    expect(registry.getAll()).toEqual({});
  });
  test('должен работать на пустом реестре', () => {
    expect(() => registry.clear()).not.toThrow();
  });
  });
});