import { ComponentManagementUseCase } from '../ComponentManagementUseCase';
import { IComponentRegistry } from '../../ports/ComponentRegistry';

describe('ComponentManagementUseCase', () => {
  let useCase: ComponentManagementUseCase;
  let mockRegistry: jest.Mocked<IComponentRegistry>;

  beforeEach(() => {
  mockRegistry = {
    register: jest.fn(),
    get: jest.fn(),
    has: jest.fn(),
    getAll: jest.fn(),
    unregister: jest.fn(),
    clear: jest.fn()
  };

  useCase = new ComponentManagementUseCase(mockRegistry);
  });

  describe('registerComponent', () => {
  const validComponent = {
    name: 'TestComponent',
    template: '<div>Test</div>'
  };

  test('должен зарегистрировать валидный компонент', () => {
    useCase.registerComponent('TestComponent', validComponent);

    expect(mockRegistry.register).toHaveBeenCalledWith('TestComponent', validComponent);
  });

  test('должен бросить ошибку если имя не указано', () => {
    expect(() => {
      useCase.registerComponent('', validComponent);
    }).toThrow('Component name must be a non-empty string');
  });

  test('должен бросить ошибку если имя не строка', () => {
    expect(() => {
      useCase.registerComponent(123 as any, validComponent);
    }).toThrow('Component name must be a non-empty string');
  });

  test('должен бросить ошибку если имя с пробелами в начале/конце', () => {
    expect(() => {
      useCase.registerComponent(' TestComponent ', validComponent);
    }).toThrow('Component name cannot have leading or trailing whitespace');
  });

  test('должен бросить ошибку для невалидного формата имени', () => {
    expect(() => {
      useCase.registerComponent('123Component', validComponent);
    }).toThrow('Component name must start with a letter and contain only letters, numbers, underscores, and hyphens');
  });

  test('должен бросить ошибку для имени с пробелами', () => {
    expect(() => {
      useCase.registerComponent('Test Component', validComponent);
    }).toThrow('Component name must start with a letter and contain only letters, numbers, underscores, and hyphens');
  });

  test('должен принять имя с дефисами', () => {
    useCase.registerComponent('test-component', validComponent);

    expect(mockRegistry.register).toHaveBeenCalledWith('test-component', validComponent);
  });

  test('должен принять имя с подчеркиваниями', () => {
    useCase.registerComponent('test_component', validComponent);

    expect(mockRegistry.register).toHaveBeenCalledWith('test_component', validComponent);
  });

  test('должен принять имя с цифрами', () => {
    useCase.registerComponent('Component123', validComponent);

    expect(mockRegistry.register).toHaveBeenCalledWith('Component123', validComponent);
  });

  test('должен бросить ошибку если компонент не указан', () => {
    expect(() => {
      useCase.registerComponent('Test', null as any);
    }).toThrow('Component must be provided');
  });

  test('должен бросить ошибку если компонент не объект', () => {
    expect(() => {
      useCase.registerComponent('Test', 'not-an-object' as any);
    }).toThrow('Component must be a Vue component object');
  });

  test('должен бросить ошибку если компонент не имеет обязательных полей', () => {
    expect(() => {
      useCase.registerComponent('Test', {} as any);
    }).toThrow('Component must have at least one of: name, setup, render, or template');
  });

  test('должен принять компонент с setup', () => {
    const componentWithSetup = { setup: () => ({}) };
    useCase.registerComponent('TestSetup', componentWithSetup);

    expect(mockRegistry.register).toHaveBeenCalled();
  });

  test('должен принять компонент с render', () => {
    const componentWithRender = { render: () => null };
    useCase.registerComponent('TestRender', componentWithRender);

    expect(mockRegistry.register).toHaveBeenCalled();
  });
  });

  describe('getComponent', () => {
  test('должен получить компонент', () => {
    const component = { name: 'Test', template: '<div>Test</div>' };
    mockRegistry.get.mockReturnValue(component);

    const result = useCase.getComponent('Test');

    expect(result).toEqual(component);
    expect(mockRegistry.get).toHaveBeenCalledWith('Test');
  });

  test('должен вернуть null если компонент не найден', () => {
    mockRegistry.get.mockReturnValue(null);

    const result = useCase.getComponent('NonExistent');

    expect(result).toBeNull();
  });
  });

  describe('hasComponent', () => {
  test('должен вернуть true если компонент существует', () => {
    mockRegistry.has.mockReturnValue(true);

    const result = useCase.hasComponent('Test');

    expect(result).toBe(true);
    expect(mockRegistry.has).toHaveBeenCalledWith('Test');
  });

  test('должен вернуть false если компонент не существует', () => {
    mockRegistry.has.mockReturnValue(false);

    const result = useCase.hasComponent('NonExistent');

    expect(result).toBe(false);
  });
  });

  describe('getAllComponents', () => {
  test('должен получить все компоненты', () => {
    const components = {
      Comp1: { name: 'Comp1', template: '<div>1</div>' },
      Comp2: { name: 'Comp2', template: '<div>2</div>' }
    };
    mockRegistry.getAll.mockReturnValue(components);

    const result = useCase.getAllComponents();

    expect(result).toEqual(components);
    expect(mockRegistry.getAll).toHaveBeenCalled();
  });

  test('должен вернуть пустой объект если компонентов нет', () => {
    mockRegistry.getAll.mockReturnValue({});

    const result = useCase.getAllComponents();

    expect(result).toEqual({});
  });
  });

  describe('unregisterComponent', () => {
  test('должен удалить компонент', () => {
    mockRegistry.unregister.mockReturnValue(true);

    const result = useCase.unregisterComponent('Test');

    expect(result).toBe(true);
    expect(mockRegistry.unregister).toHaveBeenCalledWith('Test');
  });

  test('должен вернуть false если компонент не найден', () => {
    mockRegistry.unregister.mockReturnValue(false);

    const result = useCase.unregisterComponent('NonExistent');

    expect(result).toBe(false);
  });
  });

  describe('clearComponents', () => {
  test('должен очистить все компоненты', () => {
    useCase.clearComponents();

    expect(mockRegistry.clear).toHaveBeenCalled();
  });
  });

  describe('registerComponents', () => {
  test('должен зарегистрировать множество компонентов', () => {
    const components = {
      Comp1: { name: 'Comp1', template: '<div>1</div>' },
      Comp2: { name: 'Comp2', template: '<div>2</div>' },
      Comp3: { name: 'Comp3', template: '<div>3</div>' }
    };

    useCase.registerComponents(components);

    expect(mockRegistry.register).toHaveBeenCalledTimes(3);
    expect(mockRegistry.register).toHaveBeenCalledWith('Comp1', components.Comp1);
    expect(mockRegistry.register).toHaveBeenCalledWith('Comp2', components.Comp2);
    expect(mockRegistry.register).toHaveBeenCalledWith('Comp3', components.Comp3);
  });

  test('должен обработать пустой объект', () => {
    useCase.registerComponents({});

    expect(mockRegistry.register).not.toHaveBeenCalled();
  });

  test('должен выбросить ошибку при невалидном компоненте в batch', () => {
    const components = {
      Valid: { name: 'Valid', template: '<div>Valid</div>' },
      Invalid: {} as any
    };

    expect(() => {
      useCase.registerComponents(components);
    }).toThrow();

    // Первый компонент должен быть зарегистрирован до ошибки
    expect(mockRegistry.register).toHaveBeenCalledWith('Valid', components.Valid);
  });
  });
});

