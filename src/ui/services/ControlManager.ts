import { IControlInitializer } from './IControlRenderer';
import { IControlRenderer } from './IControlRenderer';

export class ControlManager {
  private initializers: Map<string, IControlInitializer> = new Map();
  public readonly activeControls: Map<string, IControlRenderer> = new Map();
  private initializingElements = new Set<HTMLElement>();
  private initializedContainers = new Map<string, HTMLElement>();

  registerInitializer(initializer: IControlInitializer): void {
    this.initializers.set(initializer.getControlType(), initializer);
  }

  async initializeControls(containers: NodeListOf<Element> | Element[]): Promise<void> {
    const containersArray = Array.from(containers) as HTMLElement[];

    for (const container of containersArray) {
      await this.initializeControl(container);
    }
  }

  async initializeControlsInContainer(container: HTMLElement): Promise<void> {
    if (!container) {
      return;
    }

    const spacingContainers = container.querySelectorAll(
      '.bb-spacing-control-container:not([data-control-initialized])'
    );
    await this.initializeControls(spacingContainers);

    const repeaterContainers = container.querySelectorAll(
      '.bb-repeater-control-container:not([data-control-initialized])'
    );
    await this.initializeControls(repeaterContainers);

    const apiSelectContainers = container.querySelectorAll(
      '.bb-api-select-control-container:not([data-control-initialized]), [data-api-select-config]:not([data-control-initialized])'
    );
    await this.initializeControls(apiSelectContainers);

    const customFieldContainers = container.querySelectorAll(
      '.bb-custom-field-control-container:not([data-control-initialized]), [data-custom-field-config]:not([data-control-initialized])'
    );
    await this.initializeControls(customFieldContainers);

    const imageUploadFields = container.querySelectorAll(
      '.bb-image-upload-field:not([data-control-initialized])'
    );
    await this.initializeControls(imageUploadFields);

    const selectContainers = container.querySelectorAll(
      '.bb-select-placeholder:not([data-control-initialized])'
    );
    await this.initializeControls(selectContainers);
  }

  async initializeControl(container: HTMLElement): Promise<IControlRenderer | null> {
    if (this.initializingElements.has(container)) {
      return null;
    }

    if (Object.hasOwn(container.dataset, 'controlInitialized')) {
      return null;
    }

    this.initializingElements.add(container);

    try {
      for (const initializer of this.initializers.values()) {
        if (initializer.canHandle(container)) {
          const controlId = this.getControlId(container);

          const existingControl = this.activeControls.get(controlId);
          if (existingControl) {
            const oldContainer = this.initializedContainers.get(controlId);
            if (oldContainer && oldContainer.isConnected && oldContainer === container) {
              container.dataset.controlInitialized = 'true';
              this.initializedContainers.set(controlId, container);
              this.initializingElements.delete(container);
              return existingControl;
            } else {
              this.destroyControl(controlId);
            }
          }

          const control = await initializer.initialize(container);
          if (control) {
            this.activeControls.set(controlId, control);
            container.dataset.controlInitialized = 'true';
            this.initializedContainers.set(controlId, container);
            return control;
          }
        }
      }
      return null;
    } finally {
      this.initializingElements.delete(container);
    }
  }

  getControl(controlId: string): IControlRenderer | undefined {
    return this.activeControls.get(controlId);
  }

  destroyControl(controlId: string): void {
    const control = this.activeControls.get(controlId);
    if (control) {
      control.destroy();
      this.activeControls.delete(controlId);
    }
    const container = this.initializedContainers.get(controlId);
    if (container) {
      delete container.dataset.controlInitialized;
      this.initializedContainers.delete(controlId);
    }
  }

  private clearInitializedFlag(container: HTMLElement): void {
    delete container.dataset.controlInitialized;
  }

  destroyAll(): void {
    this.activeControls.forEach(control => control.destroy());
    this.activeControls.clear();

    this.initializedContainers.forEach(container => {
      if (container && container.isConnected) {
        delete container.dataset.controlInitialized;
      }
    });
    this.initializedContainers.clear();
  }

  destroyControlsInContainer(container: HTMLElement): void {
    if (!container) {
      return;
    }

    const controlsToDestroy: string[] = [];

    this.initializedContainers.forEach((initializedContainer, controlId) => {
      if (container.contains(initializedContainer)) {
        controlsToDestroy.push(controlId);
      }
    });

    controlsToDestroy.forEach(controlId => {
      this.destroyControl(controlId);
    });
  }

  clearFlagsInContainer(container: HTMLElement): void {
    const allInitialized = container.querySelectorAll('[data-control-initialized]');
    allInitialized.forEach(el => {
      const htmlEl = el as HTMLElement;
      delete htmlEl.dataset.controlInitialized;
    });
  }

  private getControlId(container: HTMLElement): string {
    const fieldName = container.dataset.fieldName || container.dataset.field;
    const repeaterField = container.dataset.repeaterField;
    const repeaterIndex = container.dataset.repeaterIndex;
    const repeaterItemField = container.dataset.repeaterItemField || container.dataset.field;

    if (repeaterField && repeaterIndex !== undefined && repeaterItemField) {
      return `${repeaterField}[${repeaterIndex}].${repeaterItemField}`;
    }

    // Для элементов внутри repeater используем data-field-path если доступен
    const fieldPath = container.dataset.fieldPath;
    if (fieldPath) {
      return fieldPath;
    }

    return fieldName || `control-${Math.random().toString(36).slice(2, 11)}`;
  }
}
