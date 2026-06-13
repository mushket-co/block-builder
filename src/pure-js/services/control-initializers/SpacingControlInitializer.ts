import { ISpacingFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { parseJSONFromAttribute } from '../../../utils/domSafe';
import type { IControlInitializerFactoryConfig } from '../ControlInitializerFactory';
import { IControlInitializer, IControlRenderer } from '../IControlRenderer';
import { SpacingControlRenderer } from '../SpacingControlRenderer';

export class SpacingControlInitializer implements IControlInitializer {
  constructor(private factoryConfig?: Pick<IControlInitializerFactoryConfig, 'onFieldChange'>) {}

  getControlType(): string {
    return 'spacing';
  }

  canHandle(container: HTMLElement): boolean {
    return container.classList.contains(CSS_CLASSES.SPACING_CONTROL_CONTAINER);
  }

  async initialize(container: HTMLElement): Promise<IControlRenderer | null> {
    const config = container.dataset.spacingConfig;
    if (!config) {
      return null;
    }

    try {
      const spacingConfig = parseJSONFromAttribute(config) as {
        field: string;
        label: string;
        required?: boolean;
        config?: ISpacingFieldConfig;
        value?: unknown;
      };

      const renderer = new SpacingControlRenderer({
        fieldName: spacingConfig.field,
        label: spacingConfig.label,
        required: spacingConfig.required,
        config: spacingConfig.config,
        value: (spacingConfig.value as Record<string, Record<string, number>>) || {},
        onChange: value => {
          container.dataset.spacingValue = JSON.stringify(value);
          this.factoryConfig?.onFieldChange?.();
        },
      });

      renderer.render(container);

      return {
        render: () => renderer.render(container),
        destroy: () => renderer.destroy(),
        getValue: () => renderer.getValue(),
      };
    } catch {
      return null;
    }
  }
}
