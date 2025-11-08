import { ModalManager, IModalOptions } from '../ModalManager';

describe('ModalManager', () => {
  let modalManager: ModalManager;
  let mockOnSubmit: jest.Mock;
  let mockOnCancel: jest.Mock;

  beforeEach(() => {
  modalManager = new ModalManager();
  mockOnSubmit = jest.fn();
  mockOnCancel = jest.fn();
  document.body.innerHTML = '';
  });

  afterEach(() => {
  modalManager.closeModal();
  });

  const createBasicOptions = (): IModalOptions => ({
  title: 'Тест модалка',
  bodyHTML: '<p>Тестовый контент</p>',
  onSubmit: mockOnSubmit,
  onCancel: mockOnCancel
  });

  describe('showModal', () => {
  test('должен создать модальное окно в DOM', () => {
    const options = createBasicOptions();
    modalManager.showModal(options);

    const modal = document.getElementById('block-builder-modal');

    expect(modal).toBeTruthy();
    expect(modal?.classList.contains('block-builder-modal')).toBe(true);
  });

  test('должен отобразить заголовок', () => {
    const options = createBasicOptions();
    modalManager.showModal(options);

    const header = document.querySelector('.block-builder-modal-header h3');

    expect(header?.textContent).toBe('Тест модалка');
  });

  test('должен отобразить контент', () => {
    const options = createBasicOptions();
    modalManager.showModal(options);

    const body = document.querySelector('.block-builder-modal-body');

    expect(body?.innerHTML).toContain('<p>Тестовый контент</p>');
  });

  test('должен отобразить кнопки Submit и Cancel по умолчанию', () => {
    const options = createBasicOptions();
    modalManager.showModal(options);

    const footer = document.querySelector('.block-builder-modal-footer');
    const buttons = footer?.querySelectorAll('button');

    expect(buttons?.length).toBe(2);
    expect(buttons?.[0].textContent?.trim()).toBe('Отмена');
    expect(buttons?.[1].textContent?.trim()).toBe('Сохранить');
  });

  test('должен использовать кастомные тексты кнопок', () => {
    const options: IModalOptions = {
      ...createBasicOptions(),
      submitButtonText: 'Создать',
      cancelButtonText: 'Закрыть'
    };
    modalManager.showModal(options);

    const footer = document.querySelector('.block-builder-modal-footer');
    const buttons = footer?.querySelectorAll('button');

    expect(buttons?.[0].textContent?.trim()).toBe('Закрыть');
    expect(buttons?.[1].textContent?.trim()).toBe('Создать');
  });

  test('должен скрыть кнопку Submit если hideSubmitButton = true', () => {
    const options: IModalOptions = {
      ...createBasicOptions(),
      hideSubmitButton: true
    };
    modalManager.showModal(options);

    const footer = document.querySelector('.block-builder-modal-footer');

    expect(footer).toBeNull();
  });

  test('должен сохранить обработчики и вызывать их при submit', () => {
    const options = createBasicOptions();
    modalManager.showModal(options);

    modalManager.submitModal();
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);

    modalManager.closeModal();
    modalManager.showModal(options);
    modalManager.submitModal();
    expect(mockOnSubmit).toHaveBeenCalledTimes(2);
  });

  test('должен заменить существующее модальное окно', () => {
    modalManager.showModal(createBasicOptions());
    const firstModal = document.getElementById('block-builder-modal');

    modalManager.showModal({
      title: 'Второе окно',
      bodyHTML: '<p>Второй контент</p>',
      onSubmit: jest.fn(),
      onCancel: jest.fn()
    });

    const modals = document.querySelectorAll('#block-builder-modal');
    const header = document.querySelector('.block-builder-modal-header h3');

    expect(modals.length).toBe(1);
    expect(header?.textContent).toBe('Второе окно');
  });
  });

  describe('closeModal', () => {
  test('должен удалить модальное окно из DOM', () => {
    modalManager.showModal(createBasicOptions());
    expect(document.getElementById('block-builder-modal')).toBeTruthy();

    modalManager.closeModal();

    expect(document.getElementById('block-builder-modal')).toBeNull();
  });

  test('должен очистить обработчики после закрытия', () => {
    modalManager.showModal(createBasicOptions());

    modalManager.submitModal();
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);

    modalManager.closeModal();

    modalManager.submitModal();
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  test('должен работать если модальное окно не открыто', () => {
    expect(() => {
      modalManager.closeModal();
    }).not.toThrow();
  });
  });

  describe('submitModal', () => {
  test('должен вызвать onSubmit обработчик', () => {
    modalManager.showModal(createBasicOptions());

    modalManager.submitModal();

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  test('не должен бросить ошибку если обработчик не определен', () => {
    expect(() => {
      modalManager.submitModal();
    }).not.toThrow();
  });
  });

  describe('isModalOpen', () => {
  test('должен вернуть false если модальное окно закрыто', () => {
    expect(modalManager.isModalOpen()).toBe(false);
  });

  test('должен вернуть true если модальное окно открыто', () => {
    modalManager.showModal(createBasicOptions());

    expect(modalManager.isModalOpen()).toBe(true);
  });

  test('должен вернуть false после закрытия', () => {
    modalManager.showModal(createBasicOptions());
    modalManager.closeModal();

    expect(modalManager.isModalOpen()).toBe(false);
  });
  });

  describe('getFormData', () => {
  test('должен извлечь данные из формы', () => {
    const formHTML = `
      <form id="test-form">
        <input type="text" name="name" value="John" />
        <input type="email" name="email" value="john@example.com" />
        <input type="number" name="age" value="30" />
      </form>
    `;

    modalManager.showModal({
      ...createBasicOptions(),
      bodyHTML: formHTML
    });

    const formData = modalManager.getFormData('test-form');

    expect(formData.name).toBe('John');
    expect(formData.email).toBe('john@example.com');
    expect(formData.age).toBe('30');
  });

  test('должен вернуть пустой объект для несуществующей формы', () => {
    const formData = modalManager.getFormData('non-existent-form');

    expect(formData).toEqual({});
  });

  test('должен вернуть пустой объект для пустой формы', () => {
    modalManager.showModal({
      ...createBasicOptions(),
      bodyHTML: '<form id="empty-form"></form>'
    });

    const formData = modalManager.getFormData('empty-form');

    expect(formData).toEqual({});
  });

  test('должен обработать множественные поля с одинаковым name', () => {
    const formHTML = `
      <form id="multi-form">
        <input type="checkbox" name="tags" value="tag1" checked />
        <input type="checkbox" name="tags" value="tag2" checked />
        <input type="text" name="name" value="Test" />
      </form>
    `;

    modalManager.showModal({
      ...createBasicOptions(),
      bodyHTML: formHTML
    });

    const formData = modalManager.getFormData('multi-form');

    expect(formData.name).toBe('Test');
    expect(formData.tags).toBeDefined();
  });
  });

  describe('Интеграция', () => {
  test('полный цикл работы с модальным окном', () => {
    expect(modalManager.isModalOpen()).toBe(false);

    modalManager.showModal(createBasicOptions());
    expect(modalManager.isModalOpen()).toBe(true);
    expect(document.getElementById('block-builder-modal')).toBeTruthy();

    modalManager.submitModal();
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);

    modalManager.closeModal();
    expect(modalManager.isModalOpen()).toBe(false);
    expect(document.getElementById('block-builder-modal')).toBeNull();
  });

  test('открытие нового окна должно закрыть предыдущее', () => {
    const firstOnSubmit = jest.fn();
    modalManager.showModal({
      ...createBasicOptions(),
      onSubmit: firstOnSubmit
    });

    const secondOnSubmit = jest.fn();
    modalManager.showModal({
      ...createBasicOptions(),
      title: 'Второе окно',
      onSubmit: secondOnSubmit
    });

    modalManager.submitModal();

    expect(firstOnSubmit).not.toHaveBeenCalled();
    expect(secondOnSubmit).toHaveBeenCalledTimes(1);
  });
  });
});

