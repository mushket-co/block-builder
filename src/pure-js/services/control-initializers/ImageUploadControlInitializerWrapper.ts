import { CSS_CLASSES } from '../../../utils/constants';
import { IControlInitializer, IControlRenderer } from '../IControlRenderer';
import {
  IImageUploadControlConfig,
  ImageUploadControlInitializer,
} from '../ImageUploadControlInitializer';
import { FileUploadControlInitializer } from '../FileUploadControlInitializer';

export class ImageUploadControlInitializerWrapper implements IControlInitializer {
  private imageInitializer: ImageUploadControlInitializer;
  private fileInitializer: FileUploadControlInitializer;

  constructor(config: IImageUploadControlConfig) {
    this.imageInitializer = new ImageUploadControlInitializer(config);
    this.fileInitializer = new FileUploadControlInitializer(config);
  }

  getControlType(): string {
    return 'image-upload';
  }

  canHandle(container: HTMLElement): boolean {
    return (
      container.classList.contains(CSS_CLASSES.IMAGE_UPLOAD_FIELD) ||
      container.classList.contains(CSS_CLASSES.FILE_UPLOAD_FIELD)
    );
  }

  async initialize(container: HTMLElement): Promise<IControlRenderer | null> {
    const isFileField = container.classList.contains(CSS_CLASSES.FILE_UPLOAD_FIELD);
    const initializer = isFileField ? this.fileInitializer : this.imageInitializer;
    const initFlag = isFileField ? 'fileInitialized' : 'imageInitialized';

    initializer.initialize(container);

    return {
      render: () => {
        initializer.initialize(container);
      },
      destroy: () => {
        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        delete container.dataset[initFlag];
      },
      getValue: () => {
        const isMultiple = container.dataset.uploadMultiple === 'true';
        const selector = isFileField
          ? 'input[type="hidden"][data-file-value="true"]'
          : 'input[type="hidden"][data-image-value="true"]';
        const hiddenInput = container.querySelector(selector) as HTMLInputElement;
        if (!hiddenInput?.value) {
          return isMultiple ? [] : '';
        }

        try {
          return JSON.parse(hiddenInput.value.replaceAll('&quot;', '"'));
        } catch {
          return hiddenInput.value;
        }
      },
      updateErrors: () => {
        // Upload errors are handled internally
      },
    };
  }
}
