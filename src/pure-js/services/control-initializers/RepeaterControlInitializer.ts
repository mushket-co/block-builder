import { IRepeaterFieldConfig, IRepeaterItemFieldConfig } from '../../../core/types/form';
import { CSS_CLASSES } from '../../../utils/constants';
import { parseJSONFromAttribute } from '../../../utils/domSafe';
import { IControlInitializer, IControlRenderer } from '../IControlRenderer';
import { RepeaterControlRenderer } from '../RepeaterControlRenderer';

export interface IRepeaterControlInitializerConfig {
  onAfterRender?: () => void;
  getRepeaterFieldConfigs?: () => Map<string, Map<string, any>>;
  getRepeaterRenderers?: () => Map<string, RepeaterControlRenderer>;
}

export class RepeaterControlInitializer implements IControlInitializer {
  constructor(private config?: IRepeaterControlInitializerConfig) {}

  getControlType(): string {
    return 'repeater';
  }

  canHandle(container: HTMLElement): boolean {
    return container.classList.contains(CSS_CLASSES.REPEATER_CONTROL_CONTAINER);
  }

  async initialize(container: HTMLElement): Promise<IControlRenderer | null> {
    const config = container.dataset.repeaterConfig;
    if (!config) {
      return null;
    }

    try {
      const parsed = parseJSONFromAttribute(config) as {
        field: string;
        label: string;
        rules?: unknown[];
        value?: unknown[];
        fields?: IRepeaterItemFieldConfig[];
        addButtonText?: string;
        removeButtonText?: string;
        itemTitle?: string;
        countLabelVariants?: {
          one: string;
          few: string;
          many: string;
          zero?: string;
        };
        min?: number;
        max?: number;
        defaultItemValue?: Record<string, unknown>;
      };

      if (!parsed.field || !parsed.label) {
        return null;
      }

      const repeaterFieldConfig: IRepeaterFieldConfig = {
        fields: (parsed.fields || []) as IRepeaterItemFieldConfig[],
        addButtonText: parsed.addButtonText,
        removeButtonText: parsed.removeButtonText,
        itemTitle: parsed.itemTitle,
        countLabelVariants: parsed.countLabelVariants,
        min: parsed.min,
        max: parsed.max,
        defaultItemValue: parsed.defaultItemValue,
      };

      const renderer = new RepeaterControlRenderer({
        fieldName: parsed.field,
        label: parsed.label,
        rules: (parsed.rules as Array<{ type: string; message?: string; value?: unknown }>) || [],
        config: repeaterFieldConfig,
        value: (parsed.value as unknown[]) || [],
        onChange: value => {
          container.dataset.repeaterValue = JSON.stringify(value);
        },
        onAfterRender: () => {
          this.config?.onAfterRender?.();
        },
      });

      renderer.render(container as HTMLElement);

      if (this.config?.getRepeaterRenderers) {
        this.config.getRepeaterRenderers().set(parsed.field, renderer);
      }

      return {
        render: () => renderer.render(container as HTMLElement),
        destroy: () => renderer.destroy(),
        getValue: () => renderer.getValue(),
        updateErrors: (errors: Record<string, string[]>) => {
          renderer.updateErrors(errors);
        },
      };
    } catch {
      return null;
    }
  }
}
