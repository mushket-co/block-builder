import {
  IFormData,
  IFormFieldConfig,
  IFormGenerationConfig,
  IRepeaterItemFieldConfig,
  IValidationResult,
  IValidationRule,
} from '../core/types';
import { UI_STRINGS } from './constants';

export type {
  IFormData,
  IFormFieldConfig,
  IFormGenerationConfig,
  IValidationResult,
  IValidationRule,
  TValidationRuleType,
} from '../core/types';
export const UniversalValidator = {
  validateField<T = unknown>(value: T, rules: IValidationRule[]): string[] {
    const errors: string[] = [];
    for (const rule of rules) {
      switch (rule.type) {
        case 'required': {
          let isEmpty = false;
          if (value === null || value === undefined || value === '') {
            isEmpty = true;
          } else if (Array.isArray(value) && value.length === 0) {
            isEmpty = true;
          } else if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === '') {
              isEmpty = true;
            } else {
              const hasHtmlTags = /<[^>]+>/.test(trimmed);
              if (hasHtmlTags) {
                const textContent = trimmed
                  .replaceAll(/<[^>]*>/g, '')
                  .replaceAll('&nbsp;', ' ')
                  .replaceAll('&amp;', '&')
                  .replaceAll('&lt;', '<')
                  .replaceAll('&gt;', '>')
                  .replaceAll('&quot;', '"')
                  .replaceAll('&#39;', "'")
                  .trim();
                if (
                  textContent === '' ||
                  textContent === '<br>' ||
                  trimmed === '<p></p>' ||
                  trimmed === '<p><br></p>'
                ) {
                  isEmpty = true;
                }
              }
            }
          }
          if (isEmpty) {
            errors.push(rule.message || 'Поле обязательно для заполнения');
          }
          break;
        }
        case 'email':
          if (typeof value === 'string' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(rule.message || 'Некорректный email адрес');
          }
          break;
        case 'url':
          if (typeof value === 'string' && value) {
            try {
              new URL(value);
            } catch {
              errors.push(rule.message || 'Некорректный URL');
            }
          }
          break;
        case 'min':
          if (rule.value !== undefined && typeof rule.value === 'number') {
            if (typeof value === 'number' && value < rule.value) {
              errors.push(rule.message || `Значение должно быть не менее ${rule.value}`);
            }
            if (typeof value === 'string' && Number.parseFloat(value) < rule.value) {
              errors.push(rule.message || `Значение должно быть не менее ${rule.value}`);
            }
          }
          break;
        case 'max':
          if (rule.value !== undefined && typeof rule.value === 'number') {
            if (typeof value === 'number' && value > rule.value) {
              errors.push(rule.message || `Значение должно быть не более ${rule.value}`);
            }
            if (typeof value === 'string' && Number.parseFloat(value) > rule.value) {
              errors.push(rule.message || `Значение должно быть не более ${rule.value}`);
            }
          }
          break;
        case 'minLength':
          if (
            rule.value !== undefined &&
            typeof rule.value === 'number' &&
            (typeof value === 'string' || Array.isArray(value)) &&
            value.length < rule.value
          ) {
            errors.push(rule.message || `Длина должна быть не менее ${rule.value} символов`);
          }
          break;
        case 'maxLength':
          if (
            rule.value !== undefined &&
            typeof rule.value === 'number' &&
            (typeof value === 'string' || Array.isArray(value)) &&
            value.length > rule.value
          ) {
            errors.push(rule.message || `Длина должна быть не более ${rule.value} символов`);
          }
          break;
        case 'pattern':
          if (typeof value === 'string' && value) {
            if (rule.value === undefined || rule.value === null) {
              break;
            }
            let pattern: RegExp;
            if (rule.value instanceof RegExp) {
              pattern = rule.value;
            } else if (typeof rule.value === 'string') {
              const patternString: string = rule.value;
              pattern = new RegExp(patternString);
            } else {
              break;
            }
            if (!pattern.test(value)) {
              errors.push(rule.message || 'Значение не соответствует формату');
            }
          }
          break;
        case 'custom':
          if (typeof rule.validator === 'function' && !rule.validator(value)) {
            errors.push(rule.message || 'Значение не прошло валидацию');
          }
          break;
      }
    }
    return errors;
  },

  validateForm(formData: IFormData, formFields: IFormFieldConfig[]): IValidationResult {
    const formErrors: Record<string, string[]> = {};
    let isValid = true;
    for (const fieldConfig of formFields) {
      if (fieldConfig.rules && fieldConfig.rules.length > 0) {
        const errors = this.validateField(formData[fieldConfig.field], fieldConfig.rules);
        if (errors.length > 0) {
          formErrors[fieldConfig.field] = errors;
          isValid = false;
        }
      }
      if (fieldConfig.type === 'repeater' && fieldConfig.repeaterConfig) {
        const arrayValue = formData[fieldConfig.field];
        if (Array.isArray(arrayValue)) {
          this.validateRepeaterRecursive(
            fieldConfig.field,
            arrayValue,
            fieldConfig.repeaterConfig.fields || [],
            formErrors,
            ''
          );
          if (Object.keys(formErrors).some(key => key.startsWith(fieldConfig.field))) {
            isValid = false;
          }
        }
      }
    }
    return {
      isValid,
      errors: formErrors,
    };
  },
  createFieldValidator(rules: IValidationRule[]) {
    return (value: unknown) => this.validateField(value, rules);
  },
  createFormValidator(formFields: IFormFieldConfig[]) {
    return (formData: IFormData) => this.validateForm(formData, formFields);
  },

  validateRepeaterRecursive(
    baseFieldPath: string,
    arrayValue: any[],
    repeaterFields: IRepeaterItemFieldConfig[],
    formErrors: Record<string, string[]>,
    parentPath: string = ''
  ): void {
    const fullPath = parentPath ? `${parentPath}.${baseFieldPath}` : baseFieldPath;

    arrayValue.forEach((item, index) => {
      for (const repeaterField of repeaterFields) {
        const fieldPath = `${fullPath}[${index}].${repeaterField.field}`;

        if (repeaterField.rules && repeaterField.rules.length > 0) {
          const fieldErrors = this.validateField(item[repeaterField.field], repeaterField.rules);
          if (fieldErrors.length > 0) {
            formErrors[fieldPath] = fieldErrors;
          }
        }

        if (repeaterField.type === 'repeater' && repeaterField.repeaterConfig) {
          const nestedArrayValue = item[repeaterField.field];
          if (Array.isArray(nestedArrayValue)) {
            this.validateRepeaterRecursive(
              repeaterField.field,
              nestedArrayValue,
              repeaterField.repeaterConfig.fields || [],
              formErrors,
              `${fullPath}[${index}]`
            );
          }
        }
      }
    });
  },
};
export const FormUtils = {
  initializeFormData(fields: IFormFieldConfig[]): IFormData {
    const formData: IFormData = {};
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        formData[field.field] = field.defaultValue;
      } else {
        switch (field.type) {
          case 'checkbox':
            formData[field.field] = false;
            break;
          case 'number':
            formData[field.field] = 0;
            break;
          default:
            formData[field.field] = '';
        }
      }
    });
    return formData;
  },
  clearErrors(errors: Record<string, string[]>): void {
    Object.keys(errors).forEach(key => delete errors[key]);
  },
  hasErrors(errors: Record<string, string[]>): boolean {
    return Object.keys(errors).length > 0;
  },
  getAllErrors(errors: Record<string, string[]>): string[] {
    const allErrors: string[] = [];
    Object.values(errors).forEach(fieldErrors => {
      allErrors.push(...fieldErrors);
    });
    return allErrors;
  },
};
export const BlockFormConfigs = {
  getTextBlockConfig(): IFormGenerationConfig {
    return {
      title: UI_STRINGS.blockTextTitle,
      description: UI_STRINGS.blockTextDescription,
      fields: [
        {
          field: 'content',
          label: UI_STRINGS.textBlockContentLabel,
          type: 'textarea',
          placeholder: UI_STRINGS.blockTextPlaceholder,
          rules: [
            { type: 'required', field: 'content', message: UI_STRINGS.requiredText },
            {
              type: 'minLength',
              field: 'content',
              value: 1,
              message: UI_STRINGS.textCannotBeEmpty,
            },
          ],
          defaultValue: '',
        },
        {
          field: 'fontSize',
          label: UI_STRINGS.textBlockFontSizeLabel,
          type: 'number',
          rules: [
            { type: 'required', field: 'fontSize', message: UI_STRINGS.fontSizeRequired },
            { type: 'min', field: 'fontSize', value: 8, message: UI_STRINGS.minFontSize },
            { type: 'max', field: 'fontSize', value: 72, message: UI_STRINGS.maxFontSize },
          ],
          defaultValue: 16,
        },
        {
          field: 'color',
          label: UI_STRINGS.textBlockColorLabel,
          type: 'color',
          rules: [{ type: 'required', field: 'color', message: UI_STRINGS.colorRequired }],
          defaultValue: '#333333',
        },
        {
          field: 'textAlign',
          label: UI_STRINGS.textBlockTextAlignLabel,
          type: 'select',
          options: [
            { value: 'left', label: UI_STRINGS.textAlignLeft },
            { value: 'center', label: UI_STRINGS.textAlignCenter },
            { value: 'right', label: UI_STRINGS.textAlignRight },
            { value: 'justify', label: UI_STRINGS.textAlignJustify },
          ],
          rules: [{ type: 'required', field: 'textAlign', message: UI_STRINGS.textAlignRequired }],
          defaultValue: 'left',
        },
      ],
      submitButtonText: UI_STRINGS.create,
      cancelButtonText: UI_STRINGS.cancel,
    };
  },
  getImageBlockConfig(): IFormGenerationConfig {
    return {
      title: UI_STRINGS.blockImageTitle,
      description: UI_STRINGS.blockImageDescription,
      fields: [
        {
          field: 'image',
          label: UI_STRINGS.imageBlockSrcLabel,
          type: 'image',
          rules: [{ type: 'required', field: 'image', message: UI_STRINGS.imageSrcRequired }],
          defaultValue: '',
        },
        {
          field: 'alt',
          label: UI_STRINGS.imageBlockAltLabel,
          type: 'text',
          placeholder: UI_STRINGS.imageBlockAltPlaceholder,
          rules: [{ type: 'required', field: 'alt', message: UI_STRINGS.altRequired }],
          defaultValue: '',
        },
        {
          field: 'borderRadius',
          label: UI_STRINGS.imageBlockBorderRadiusLabel,
          type: 'number',
          rules: [
            {
              type: 'min',
              field: 'borderRadius',
              value: 0,
              message: UI_STRINGS.borderRadiusCannotBeNegative,
            },
            { type: 'max', field: 'borderRadius', value: 50, message: UI_STRINGS.maxBorderRadius },
          ],
          defaultValue: 0,
        },
      ],
      submitButtonText: UI_STRINGS.create,
      cancelButtonText: UI_STRINGS.cancel,
    };
  },
  getButtonBlockConfig(): IFormGenerationConfig {
    return {
      title: UI_STRINGS.buttonBlockTitle,
      description: UI_STRINGS.buttonBlockDescription,
      fields: [
        {
          field: 'text',
          label: UI_STRINGS.buttonBlockTextLabel,
          type: 'text',
          placeholder: UI_STRINGS.buttonBlockTextPlaceholder,
          rules: [
            { type: 'required', field: 'text', message: UI_STRINGS.buttonTextRequired },
            {
              type: 'minLength',
              field: 'text',
              value: 1,
              message: UI_STRINGS.buttonTextCannotBeEmpty,
            },
          ],
          defaultValue: 'Кнопка',
        },
        {
          field: 'backgroundColor',
          label: UI_STRINGS.buttonBlockBackgroundColorLabel,
          type: 'color',
          rules: [
            {
              type: 'required',
              field: 'backgroundColor',
              message: UI_STRINGS.backgroundColorRequired,
            },
          ],
          defaultValue: '#007bff',
        },
        {
          field: 'color',
          label: UI_STRINGS.buttonBlockColorLabel,
          type: 'color',
          rules: [{ type: 'required', field: 'color', message: UI_STRINGS.textColorRequired }],
          defaultValue: '#ffffff',
        },
        {
          field: 'borderRadius',
          label: UI_STRINGS.buttonBlockBorderRadiusLabel,
          type: 'number',
          rules: [
            {
              type: 'min',
              field: 'borderRadius',
              value: 0,
              message: UI_STRINGS.borderRadiusCannotBeNegative,
            },
            { type: 'max', field: 'borderRadius', value: 50, message: UI_STRINGS.maxBorderRadius },
          ],
          defaultValue: 4,
        },
        {
          field: 'padding',
          label: UI_STRINGS.buttonBlockPaddingLabel,
          type: 'text',
          placeholder: UI_STRINGS.buttonBlockPaddingPlaceholder,
          rules: [{ type: 'required', field: 'padding', message: UI_STRINGS.paddingRequired }],
          defaultValue: '8px 16px',
        },
        {
          field: 'onClick',
          label: UI_STRINGS.buttonBlockOnClickLabel,
          type: 'text',
          placeholder: UI_STRINGS.buttonBlockOnClickPlaceholder,
          rules: [{ type: 'required', field: 'onClick', message: UI_STRINGS.onClickRequired }],
          defaultValue: 'alert("Привет!")',
        },
      ],
      submitButtonText: UI_STRINGS.create,
      cancelButtonText: UI_STRINGS.cancel,
    };
  },
  getCardListBlockConfig(): IFormGenerationConfig {
    return {
      title: UI_STRINGS.cardListBlockTitle,
      description: UI_STRINGS.cardListBlockDescription,
      fields: [
        {
          field: 'title',
          label: UI_STRINGS.cardListBlockTitleLabel,
          type: 'text',
          placeholder: UI_STRINGS.cardListBlockTitlePlaceholder,
          rules: [
            { type: 'required', field: 'title', message: UI_STRINGS.cardListTitleRequired },
            {
              type: 'minLength',
              field: 'title',
              value: 1,
              message: UI_STRINGS.cardListTitleCannotBeEmpty,
            },
          ],
          defaultValue: 'Наши услуги',
        },
        {
          field: 'card1_title',
          label: UI_STRINGS.card1TitleLabel,
          type: 'text',
          placeholder: UI_STRINGS.card1TitlePlaceholder,
          rules: [
            { type: 'required', field: 'card1_title', message: UI_STRINGS.card1TitleRequired },
          ],
          defaultValue: 'Веб-разработка',
        },
        {
          field: 'card1_text',
          label: UI_STRINGS.card1TextLabel,
          type: 'textarea',
          placeholder: UI_STRINGS.card1TextPlaceholder,
          rules: [{ type: 'required', field: 'card1_text', message: UI_STRINGS.card1TextRequired }],
          defaultValue: 'Создание современных веб-приложений',
        },
        {
          field: 'card1_button',
          label: UI_STRINGS.card1ButtonLabel,
          type: 'text',
          placeholder: UI_STRINGS.card1ButtonPlaceholder,
          rules: [
            { type: 'required', field: 'card1_button', message: UI_STRINGS.card1ButtonRequired },
          ],
          defaultValue: 'Подробнее',
        },
        {
          field: 'card1_link',
          label: UI_STRINGS.card1LinkLabel,
          type: 'url',
          placeholder: UI_STRINGS.card1LinkPlaceholder,
          rules: [{ type: 'required', field: 'card1_link', message: UI_STRINGS.card1LinkRequired }],
          defaultValue: 'https://example.com',
        },
        {
          field: 'card1_image',
          label: UI_STRINGS.card1ImageLabel,
          type: 'url',
          placeholder: UI_STRINGS.card1ImagePlaceholder,
          rules: [
            { type: 'required', field: 'card1_image', message: UI_STRINGS.card1ImageRequired },
          ],
          defaultValue: 'https://i.pinimg.com/736x/ca/9a/12/ca9a123b7269fba0574726629bad42b9.jpg',
        },
        {
          field: 'card2_title',
          label: UI_STRINGS.card2TitleLabel,
          type: 'text',
          placeholder: UI_STRINGS.card2TitlePlaceholder,
          rules: [
            { type: 'required', field: 'card2_title', message: UI_STRINGS.card2TitleRequired },
          ],
          defaultValue: 'Мобильные приложения',
        },
        {
          field: 'card2_text',
          label: UI_STRINGS.card2TextLabel,
          type: 'textarea',
          placeholder: UI_STRINGS.card2TextPlaceholder,
          rules: [{ type: 'required', field: 'card2_text', message: UI_STRINGS.card2TextRequired }],
          defaultValue: 'Разработка мобильных приложений для iOS и Android',
        },
        {
          field: 'card2_button',
          label: UI_STRINGS.card2ButtonLabel,
          type: 'text',
          placeholder: UI_STRINGS.card2ButtonPlaceholder,
          rules: [
            { type: 'required', field: 'card2_button', message: UI_STRINGS.card2ButtonRequired },
          ],
          defaultValue: 'Узнать больше',
        },
        {
          field: 'card2_link',
          label: UI_STRINGS.card2LinkLabel,
          type: 'url',
          placeholder: UI_STRINGS.card2LinkPlaceholder,
          rules: [{ type: 'required', field: 'card2_link', message: UI_STRINGS.card2LinkRequired }],
          defaultValue: 'https://example.com',
        },
        {
          field: 'card2_image',
          label: UI_STRINGS.card2ImageLabel,
          type: 'url',
          placeholder: UI_STRINGS.card2ImagePlaceholder,
          rules: [
            { type: 'required', field: 'card2_image', message: UI_STRINGS.card2ImageRequired },
          ],
          defaultValue: 'https://i.pinimg.com/736x/ca/9a/12/ca9a123b7269fba0574726629bad42b9.jpg',
        },
        {
          field: 'card3_title',
          label: UI_STRINGS.card3TitleLabel,
          type: 'text',
          placeholder: UI_STRINGS.card3TitlePlaceholder,
          rules: [
            { type: 'required', field: 'card3_title', message: UI_STRINGS.card3TitleRequired },
          ],
          defaultValue: 'Дизайн',
        },
        {
          field: 'card3_text',
          label: UI_STRINGS.card3TextLabel,
          type: 'textarea',
          placeholder: UI_STRINGS.card3TextPlaceholder,
          rules: [{ type: 'required', field: 'card3_text', message: UI_STRINGS.card3TextRequired }],
          defaultValue: 'Создание уникального дизайна для вашего бренда',
        },
        {
          field: 'card3_button',
          label: UI_STRINGS.card3ButtonLabel,
          type: 'text',
          placeholder: UI_STRINGS.card3ButtonPlaceholder,
          rules: [
            { type: 'required', field: 'card3_button', message: UI_STRINGS.card3ButtonRequired },
          ],
          defaultValue: 'Посмотреть работы',
        },
        {
          field: 'card3_link',
          label: UI_STRINGS.card3LinkLabel,
          type: 'url',
          placeholder: UI_STRINGS.card3LinkPlaceholder,
          rules: [{ type: 'required', field: 'card3_link', message: UI_STRINGS.card3LinkRequired }],
          defaultValue: 'https://example.com',
        },
        {
          field: 'card3_image',
          label: UI_STRINGS.card3ImageLabel,
          type: 'url',
          placeholder: UI_STRINGS.card3ImagePlaceholder,
          rules: [
            { type: 'required', field: 'card3_image', message: UI_STRINGS.card3ImageRequired },
          ],
          defaultValue: 'https://i.pinimg.com/736x/ca/9a/12/ca9a123b7269fba0574726629bad42b9.jpg',
        },
        {
          field: 'cardBackground',
          label: UI_STRINGS.cardListBlockCardBackgroundLabel,
          type: 'color',
          rules: [
            {
              type: 'required',
              field: 'cardBackground',
              message: UI_STRINGS.cardBackgroundRequired,
            },
          ],
          defaultValue: '#ffffff',
        },
        {
          field: 'cardTextColor',
          label: UI_STRINGS.cardListBlockCardTextColorLabel,
          type: 'color',
          rules: [
            { type: 'required', field: 'cardTextColor', message: UI_STRINGS.cardTextColorRequired },
          ],
          defaultValue: '#333333',
        },
        {
          field: 'cardBorderRadius',
          label: UI_STRINGS.cardListBlockCardBorderRadiusLabel,
          type: 'number',
          rules: [
            {
              type: 'min',
              field: 'cardBorderRadius',
              value: 0,
              message: UI_STRINGS.borderRadiusCannotBeNegative,
            },
            {
              type: 'max',
              field: 'cardBorderRadius',
              value: 50,
              message: UI_STRINGS.maxBorderRadius,
            },
          ],
          defaultValue: 8,
        },
        {
          field: 'columns',
          label: UI_STRINGS.cardListBlockColumnsLabel,
          type: 'select',
          options: [
            { value: '1', label: UI_STRINGS.columnsOne },
            { value: '2', label: UI_STRINGS.columnsTwo },
            { value: '3', label: UI_STRINGS.columnsThree },
            { value: '4', label: UI_STRINGS.columnsFour },
          ],
          rules: [{ type: 'required', field: 'columns', message: UI_STRINGS.columnsRequired }],
          defaultValue: '3',
        },
        {
          field: 'gap',
          label: UI_STRINGS.cardListBlockGapLabel,
          type: 'number',
          rules: [
            { type: 'min', field: 'gap', value: 0, message: UI_STRINGS.gapCannotBeNegative },
            { type: 'max', field: 'gap', value: 50, message: UI_STRINGS.maxGap },
          ],
          defaultValue: 16,
        },
      ],
      submitButtonText: UI_STRINGS.createCardList,
      cancelButtonText: UI_STRINGS.cancel,
    };
  },

  getConfigForBlockType(blockType: string): IFormGenerationConfig {
    switch (blockType) {
      case 'text':
        return this.getTextBlockConfig();
      case 'image':
        return this.getImageBlockConfig();
      case 'button':
        return this.getButtonBlockConfig();
      case 'cardlist':
        return this.getCardListBlockConfig();
      default:
        throw new Error(`Неизвестный тип блока: ${blockType}`);
    }
  },

  createEditConfig(blockType: string, blockData: IFormData): IFormGenerationConfig {
    const config = this.getConfigForBlockType(blockType);
    config.title = `Редактирование ${config.title.toLowerCase().replace('настройка ', '')}`;
    config.submitButtonText = 'Сохранить изменения';
    config.fields.forEach(field => {
      if (blockData[field.field] !== undefined) {
        field.defaultValue = blockData[field.field];
      }
    });
    return config;
  },
};
