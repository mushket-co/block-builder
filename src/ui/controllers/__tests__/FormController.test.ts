import { CSS_CLASSES } from '../../../utils/constants';
import { ControlManager } from '../../services/ControlManager';
import { FormBuilder, TFieldConfig } from '../../services/FormBuilder';
import { ModalManager } from '../../services/ModalManager';
import { FormController } from '../FormController';

describe('FormController', () => {
  let formController: FormController;
  let modalManager: ModalManager;
  let controlManager: ControlManager;
  let formBuilder: FormBuilder;
  let onValidationError: jest.Mock;

  const textFields: TFieldConfig[] = [
    {
      field: 'title',
      label: 'Заголовок',
      type: 'text',
      rules: [{ type: 'required', message: 'Заголовок обязателен' }],
    },
  ];

  beforeEach(() => {
    modalManager = new ModalManager();
    controlManager = new ControlManager();
    formBuilder = new FormBuilder();
    onValidationError = jest.fn();

    jest.spyOn(controlManager, 'initializeControlsInContainer').mockResolvedValue(undefined);
    jest.spyOn(controlManager, 'destroyControlsInContainer').mockImplementation(() => {});

    formController = new FormController({
      formBuilder,
      modalManager,
      controlManager,
      onValidationError,
    });
  });

  afterEach(() => {
    formController.close();
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  test('submits form data when validation passes', async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);

    formController.showCreateForm('Создать блок', textFields, onSubmit);

    const titleInput = document.querySelector('[name="title"]') as HTMLInputElement;
    titleInput.value = 'Hello';

    modalManager.submitModal();
    await Promise.resolve();
    await Promise.resolve();

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Hello' });
    expect(onValidationError).not.toHaveBeenCalled();
    expect(modalManager.isModalOpen()).toBe(false);
  });

  test('calls onValidationError and keeps modal open when validation fails', async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);

    formController.showCreateForm('Создать блок', textFields, onSubmit);

    modalManager.submitModal();
    await Promise.resolve();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onValidationError).toHaveBeenCalledWith({
      title: ['Заголовок обязателен'],
    });
    expect(modalManager.isModalOpen()).toBe(true);
    expect(document.querySelector(`.${CSS_CLASSES.FORM_ERRORS}[data-field="title"]`)).toBeTruthy();
  });

  test('forwards repeater validation errors to active controls', async () => {
    const updateErrors = jest.fn();
    controlManager.activeControls.set('items', {
      getValue: () => [],
      updateErrors,
    });

    const repeaterFields: TFieldConfig[] = [
      {
        field: 'items',
        label: 'Элементы',
        type: 'repeater',
        rules: [{ type: 'required', message: 'Добавьте элемент' }],
        repeaterConfig: {
          fields: [{ field: 'title', label: 'Заголовок', type: 'text' }],
        },
      },
    ];

    const onSubmit = jest.fn().mockResolvedValue(true);
    formController.showCreateForm('Создать блок', repeaterFields, onSubmit);

    modalManager.submitModal();
    await Promise.resolve();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(updateErrors).toHaveBeenCalledWith({
      items: ['Добавьте элемент'],
    });
    expect(onValidationError).toHaveBeenCalledWith({
      items: ['Добавьте элемент'],
    });
  });
});
