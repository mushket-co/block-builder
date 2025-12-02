import { CSS_CLASSES } from '../../../utils/constants';
import { IControlInitializer, IControlRenderer } from '../IControlRenderer';
import {
  IImageUploadControlConfig,
  ImageUploadControlInitializer,
} from '../ImageUploadControlInitializer';

export class ImageUploadControlInitializerWrapper implements IControlInitializer {
  private initializer: ImageUploadControlInitializer;

  constructor(config: IImageUploadControlConfig) {
    this.initializer = new ImageUploadControlInitializer(config);
  }

  getControlType(): string {
    return 'image-upload';
  }

  canHandle(container: HTMLElement): boolean {
    return container.classList.contains(CSS_CLASSES.IMAGE_UPLOAD_FIELD);
  }

  async initialize(container: HTMLElement): Promise<IControlRenderer | null> {
    this.initializer.initialize(container);
    return {
      render: () => {
        this.initializer.initialize(container);
      },
      destroy: () => {
        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        delete container.dataset.imageInitialized;
      },
      getValue: () => {
        const hiddenInput = container.querySelector(
          'input[type="hidden"][data-image-value="true"]'
        ) as HTMLInputElement;
        if (hiddenInput && hiddenInput.value) {
          try {
            return JSON.parse(hiddenInput.value.replaceAll('&quot;', '"'));
          } catch {
            return hiddenInput.value;
          }
        }
        return null;
      },
      updateErrors: () => {
        // Image upload errors are handled internally
      },
    };
  }
}
