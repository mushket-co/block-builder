import { ICustomFieldRendererRegistry } from '../../core/ports/CustomFieldRenderer';
import { LicenseService } from '../../core/services/LicenseService';
import { ApiSelectUseCase } from '../../core/use-cases/ApiSelectUseCase';
import {
  ApiSelectControlInitializer,
  IApiSelectControlInitializerConfig,
} from './control-initializers/ApiSelectControlInitializer';
import {
  CustomFieldControlInitializer,
  ICustomFieldControlInitializerConfig,
} from './control-initializers/CustomFieldControlInitializer';
import { ImageUploadControlInitializerWrapper } from './control-initializers/ImageUploadControlInitializerWrapper';
import {
  IRepeaterControlInitializerConfig,
  RepeaterControlInitializer,
} from './control-initializers/RepeaterControlInitializer';
import {
  ISelectControlInitializerConfig,
  SelectControlInitializer,
} from './control-initializers/SelectControlInitializer';
import { SpacingControlInitializer } from './control-initializers/SpacingControlInitializer';
import { ControlManager } from './ControlManager';
import { TFieldConfig } from './FormBuilder';
import { IControlInitializer } from './IControlRenderer';
import { IImageUploadControlConfig } from './ImageUploadControlInitializer';

export interface IControlInitializerFactoryConfig {
  licenseService: LicenseService;
  apiSelectUseCase: ApiSelectUseCase;
  customFieldRendererRegistry?: ICustomFieldRendererRegistry;
  getCurrentFormFields: () => Map<string, TFieldConfig>;
  getRepeaterFieldConfigs: () => Map<string, Map<string, TFieldConfig>>;
  getRepeaterRenderers: () => Map<string, any>;
  findNestedRepeaterRenderer?: (fieldPath: string) => any;
  onAfterRepeaterRender?: () => void;
}

export const ControlInitializerFactory = {
  createInitializers(config: IControlInitializerFactoryConfig): IControlInitializer[] {
    const licenseFeatureChecker = config.licenseService.getFeatureChecker();
    const initializers: IControlInitializer[] = [];

    initializers.push(new SpacingControlInitializer(licenseFeatureChecker));

    const repeaterConfig: IRepeaterControlInitializerConfig = {
      onAfterRender: config.onAfterRepeaterRender,
      getRepeaterFieldConfigs: config.getRepeaterFieldConfigs,
      getRepeaterRenderers: config.getRepeaterRenderers,
    };
    initializers.push(new RepeaterControlInitializer(repeaterConfig));

    const apiSelectConfig: IApiSelectControlInitializerConfig = {
      apiSelectUseCase: config.apiSelectUseCase,
      licenseFeatureChecker,
      getRepeaterFieldConfigs: config.getRepeaterFieldConfigs,
      getRepeaterRenderers: config.getRepeaterRenderers,
    };
    initializers.push(new ApiSelectControlInitializer(apiSelectConfig));

    const selectConfig: ISelectControlInitializerConfig = {
      getCurrentFormFields: config.getCurrentFormFields,
    };
    initializers.push(new SelectControlInitializer(selectConfig));

    if (config.customFieldRendererRegistry) {
      const customFieldConfig: ICustomFieldControlInitializerConfig = {
        customFieldRendererRegistry: config.customFieldRendererRegistry,
        licenseFeatureChecker,
        getRepeaterRenderers: config.getRepeaterRenderers,
      };
      initializers.push(new CustomFieldControlInitializer(customFieldConfig));
    }

    if (config.findNestedRepeaterRenderer) {
      const imageUploadConfig: IImageUploadControlConfig = {
        getCurrentFormFields: config.getCurrentFormFields,
        getRepeaterFieldConfigs: config.getRepeaterFieldConfigs,
        getRepeaterRenderers: config.getRepeaterRenderers,
        findNestedRepeaterRenderer: config.findNestedRepeaterRenderer,
      };
      initializers.push(new ImageUploadControlInitializerWrapper(imageUploadConfig));
    }

    return initializers;
  },

  setupControlManager(
    controlManager: ControlManager,
    config: IControlInitializerFactoryConfig
  ): void {
    const initializers = this.createInitializers(config);
    initializers.forEach(initializer => {
      controlManager.registerInitializer(initializer);
    });
  },
};
