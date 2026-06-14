import { CSS_CLASSES, FORM_ID_PREFIX } from '../../utils/constants';
import {
  ReactiveFormValidationTracker,
} from '../../utils/reactiveFormValidation';
import { UniversalValidator } from '../../utils/universalValidation';
import { ControlManager } from '../services/ControlManager';
import { FormBuilder, TFieldConfig } from '../services/FormBuilder';
import { ModalManager } from '../services/ModalManager';

export interface IFormControllerConfig {
  formBuilder: FormBuilder;
  modalManager: ModalManager;
  controlManager: ControlManager;
  onFormSubmit?: (data: Record<string, any>) => Promise<boolean>;
  onFormCancel?: () => void;
  onValidationError?: (errors: Record<string, string[]>) => void;
}

export class FormController {
  private formBuilder: FormBuilder;
  private modalManager: ModalManager;
  private controlManager: ControlManager;
  private onFormSubmit?: (data: Record<string, any>) => Promise<boolean>;
  private onFormCancel?: () => void;
  private onValidationError?: (errors: Record<string, string[]>) => void;
  private currentFormFields: Map<string, TFieldConfig> = new Map();
  private activeFields: TFieldConfig[] = [];
  private lastValidationErrors: Record<string, string[]> = {};
  private validationTracker = new ReactiveFormValidationTracker();
  private boundHandleReactiveValidation: (() => void) | null = null;

  constructor(config: IFormControllerConfig) {
    this.formBuilder = config.formBuilder;
    this.modalManager = config.modalManager;
    this.controlManager = config.controlManager;
    this.onFormSubmit = config.onFormSubmit;
    this.onFormCancel = config.onFormCancel;
    this.onValidationError = config.onValidationError;
  }

  triggerReactiveValidation(): void {
    if (!this.validationTracker.isTouched || this.activeFields.length === 0) {
      return;
    }

    const validation = UniversalValidator.validateForm(this.getFormData(), this.activeFields);
    this.showValidationErrors(validation.errors);
  }

  showCreateForm(
    title: string,
    fields: TFieldConfig[],
    onSubmit: (data: Record<string, any>) => Promise<boolean>
  ): void {
    this.activeFields = fields;
    this.currentFormFields.clear();
    fields.forEach(field => {
      this.currentFormFields.set(field.field, field);
    });

    const formHTML = `
      <form id="${FORM_ID_PREFIX}" class="${CSS_CLASSES.FORM}">
        ${this.formBuilder.generateCreateFormHTML(fields)}
      </form>
    `;

    this.modalManager.showModal({
      title,
      bodyHTML: formHTML,
      onSubmit: async () => {
        const success = await this.handleSubmit(fields, onSubmit);
        if (success) {
          this.modalManager.closeModal();
          this.cleanup();
        }
      },
      onCancel: () => {
        this.cleanup();
        this.modalManager.closeModal();
      },
      onValidationErrorNavigate: () => this.navigateToValidationError(),
      submitButtonText: 'Добавить',
      preventBodyScroll: true,
      onAfterModalOpen: () => {
        this.validationTracker.reset();
        this.setupReactiveValidationListeners();
        this.initializeControls();
      },
    });
  }

  showEditForm(
    title: string,
    fields: TFieldConfig[],
    initialData: Record<string, any>,
    onSubmit: (data: Record<string, any>) => Promise<boolean>
  ): void {
    this.activeFields = fields;
    this.currentFormFields.clear();
    fields.forEach(field => {
      this.currentFormFields.set(field.field, field);
    });

    const formHTML = `
      <form id="${FORM_ID_PREFIX}" class="${CSS_CLASSES.FORM}">
        ${this.formBuilder.generateEditFormHTML(fields, initialData)}
      </form>
    `;

    this.modalManager.showModal({
      title,
      bodyHTML: formHTML,
      onSubmit: async () => {
        const success = await this.handleSubmit(fields, onSubmit);
        if (success) {
          this.modalManager.closeModal();
          this.cleanup();
        }
      },
      onCancel: () => {
        this.cleanup();
        this.modalManager.closeModal();
      },
      onValidationErrorNavigate: () => this.navigateToValidationError(),
      submitButtonText: 'Сохранить',
      preventBodyScroll: true,
      onAfterModalOpen: () => {
        this.validationTracker.reset();
        this.setupReactiveValidationListeners();
        this.initializeControls();
      },
    });
  }

  private async handleSubmit(
    fields: TFieldConfig[],
    onSubmit: (data: Record<string, any>) => Promise<boolean>
  ): Promise<boolean> {
    const formData = this.getFormData();
    const validation = UniversalValidator.validateForm(formData, fields);

    if (!validation.isValid) {
      this.validationTracker.touch();
      this.showValidationErrors(validation.errors);
      if (this.onValidationError) {
        this.onValidationError(validation.errors);
      }
      return false;
    }

    try {
      return await onSubmit(formData);
    } catch {
      return false;
    }
  }

  private getFormData(): Record<string, any> {
    const form = document.querySelector(`#${FORM_ID_PREFIX}`) as HTMLFormElement;
    if (!form) {
      return {};
    }

    const formData = new FormData(form);
    const data: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (key.includes('[') && key.includes('].')) {
        continue;
      }

      const uploadHiddenInput = form.querySelector(
        `input[type="hidden"][name="${key}"][data-image-value="true"], input[type="hidden"][name="${key}"][data-file-value="true"]`
      ) as HTMLInputElement | null;

      if (uploadHiddenInput) {
        data[key] = this.readUploadHiddenValue(uploadHiddenInput);
        continue;
      }

      const input = form.querySelector(`[name="${key}"]`) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement;
      if (input) {
        if (input.type === 'checkbox') {
          data[key] = (input as HTMLInputElement).checked;
        } else if (input.type === 'radio') {
          data[key] = value;
        } else if (input.type === 'number') {
          data[key] = input.value ? Number.parseFloat(input.value) : null;
        } else if (input.type === 'file') {
          continue;
        } else {
          data[key] = input.value;
        }
      } else {
        data[key] = value;
      }
    }

    this.applyUploadHiddenValues(form, data);

    const activeControls = (this.controlManager as any).activeControls as Map<string, any>;
    activeControls.forEach((control, controlId) => {
      if (!controlId.includes('[') && control.getValue) {
        data[controlId] = control.getValue();
      }
    });

    return data;
  }

  private readUploadHiddenValue(hiddenInput: HTMLInputElement): unknown {
    const container = hiddenInput.closest(
      `.${CSS_CLASSES.IMAGE_UPLOAD_FIELD}, .${CSS_CLASSES.FILE_UPLOAD_FIELD}`
    ) as HTMLElement | null;
    const isMultiple = container?.dataset.uploadMultiple === 'true';

    if (!hiddenInput.value) {
      return isMultiple ? [] : '';
    }

    try {
      const parsed = JSON.parse(hiddenInput.value.replaceAll('&quot;', '"'));
      if (Array.isArray(parsed)) {
        return parsed;
      }
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    } catch {
      // keep raw string value
    }

    return hiddenInput.value;
  }

  private applyUploadHiddenValues(form: HTMLFormElement, data: Record<string, any>): void {
    const hiddenInputs = form.querySelectorAll(
      `input[type="hidden"][data-image-value="true"], input[type="hidden"][data-file-value="true"]`
    );

    hiddenInputs.forEach(node => {
      const hiddenInput = node as HTMLInputElement;
      const name = hiddenInput.getAttribute('name');
      if (!name || name.includes('[')) {
        return;
      }
      data[name] = this.readUploadHiddenValue(hiddenInput);
    });
  }

  private showValidationErrors(errors: Record<string, string[]>): void {
    this.lastValidationErrors = errors;
    this.clearValidationErrors(false);

    const activeControls = (this.controlManager as any).activeControls as Map<string, any>;
    activeControls.forEach(control => {
      if (control.updateErrors) {
        control.updateErrors(errors);
      }
    });

    Object.entries(errors).forEach(([fieldName, fieldErrors]) => {
      if (fieldName.includes('[') && fieldName.includes(']')) {
        return;
      }

      const input = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
      if (input) {
        input.classList.add(CSS_CLASSES.ERROR);

        const formGroup = input.closest(`.${CSS_CLASSES.FORM_GROUP}`) as HTMLElement;
        if (formGroup) {
          formGroup.classList.add(CSS_CLASSES.ERROR);
        }

        const errorContainer = document.createElement('div');
        errorContainer.className = CSS_CLASSES.FORM_ERRORS;
        errorContainer.dataset.field = fieldName;

        fieldErrors.forEach(error => {
          const errorSpan = document.createElement('span');
          errorSpan.className = CSS_CLASSES.ERROR;
          errorSpan.textContent = error;
          errorContainer.append(errorSpan);
        });

        input.parentElement?.append(errorContainer);
      }
    });

    this.modalManager.updateValidationErrorIndicator(errors);
  }

  private navigateToValidationError(): void {
    if (this.onValidationError && Object.keys(this.lastValidationErrors).length > 0) {
      this.onValidationError(this.lastValidationErrors);
    }
  }

  private clearValidationErrors(updateIndicator: boolean = true): void {
    document
      .querySelectorAll(`.${CSS_CLASSES.FORM_CONTROL}.${CSS_CLASSES.ERROR}`)
      .forEach(input => {
        input.classList.remove(CSS_CLASSES.ERROR);
      });

    document.querySelectorAll(`.${CSS_CLASSES.FORM_GROUP}.${CSS_CLASSES.ERROR}`).forEach(group => {
      group.classList.remove(CSS_CLASSES.ERROR);
    });

    document.querySelectorAll(`.${CSS_CLASSES.FORM_ERRORS}`).forEach(container => {
      container.remove();
    });

    if (updateIndicator) {
      this.lastValidationErrors = {};
      this.modalManager.updateValidationErrorIndicator({});
    }
  }

  private setupReactiveValidationListeners(): void {
    this.teardownReactiveValidationListeners();

    const form = document.querySelector(`#${FORM_ID_PREFIX}`) as HTMLFormElement | null;
    if (!form) {
      return;
    }

    this.boundHandleReactiveValidation = () => {
      this.triggerReactiveValidation();
    };

    form.addEventListener('input', this.boundHandleReactiveValidation);
    form.addEventListener('change', this.boundHandleReactiveValidation);
  }

  private teardownReactiveValidationListeners(): void {
    const form = document.querySelector(`#${FORM_ID_PREFIX}`) as HTMLFormElement | null;
    if (form && this.boundHandleReactiveValidation) {
      form.removeEventListener('input', this.boundHandleReactiveValidation);
      form.removeEventListener('change', this.boundHandleReactiveValidation);
    }

    this.boundHandleReactiveValidation = null;
  }

  private async initializeControls(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 0));

    const modalBody = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;
    if (modalBody && (this.controlManager as any).clearFlagsInContainer) {
      (this.controlManager as any).clearFlagsInContainer(modalBody);
    }

    await this.controlManager.initializeControlsInContainer(modalBody || document.body);
  }

  private cleanup(): void {
    this.teardownReactiveValidationListeners();
    this.validationTracker.reset();
    this.activeFields = [];

    const modalBody = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;
    if (modalBody && (this.controlManager as any).destroyControlsInContainer) {
      (this.controlManager as any).destroyControlsInContainer(modalBody);
    } else {
      this.controlManager.destroyAll();
    }
    this.currentFormFields.clear();
  }

  close(): void {
    this.cleanup();
    this.modalManager.closeModal();
  }
}
