import { License } from '../entities/License';
export enum LicenseFeature {
  CUSTOM_FIELDS = 'customFields',
  API_SELECT = 'apiSelect',
  UNLIMITED_BLOCK_TYPES = 'unlimitedBlockTypes',
  ADVANCED_SPACING = 'advancedSpacing',
}
interface IFeatureAvailability {
  [LicenseFeature.CUSTOM_FIELDS]: boolean;
  [LicenseFeature.API_SELECT]: boolean;
  [LicenseFeature.UNLIMITED_BLOCK_TYPES]: boolean;
  [LicenseFeature.ADVANCED_SPACING]: boolean;
}
const FREE_FEATURES: IFeatureAvailability = {
  [LicenseFeature.CUSTOM_FIELDS]: false,
  [LicenseFeature.API_SELECT]: false,
  [LicenseFeature.UNLIMITED_BLOCK_TYPES]: false,
  [LicenseFeature.ADVANCED_SPACING]: false,
};
const PRO_FEATURES: IFeatureAvailability = {
  [LicenseFeature.CUSTOM_FIELDS]: true,
  [LicenseFeature.API_SELECT]: true,
  [LicenseFeature.UNLIMITED_BLOCK_TYPES]: true,
  [LicenseFeature.ADVANCED_SPACING]: true,
};
export class LicenseFeatureChecker {
  private license: License;
  constructor(license: License) {
    this.license = license;
  }

  isFeatureAvailable(feature: LicenseFeature): boolean {
    const features = this.license.isPro() ? PRO_FEATURES : FREE_FEATURES;
    return features[feature] || false;
  }

  getFeatureRestrictionMessage(feature: LicenseFeature): string {
    const featureNames: Record<LicenseFeature, string> = {
      [LicenseFeature.CUSTOM_FIELDS]: 'Кастомные поля',
      [LicenseFeature.API_SELECT]: 'API Select поля',
      [LicenseFeature.UNLIMITED_BLOCK_TYPES]: 'Неограниченное количество типов блоков',
      [LicenseFeature.ADVANCED_SPACING]: 'Продвинутые настройки spacing',
    };
    return `${featureNames[feature]} доступны только в PRO версии. Для снятия ограничений приобретите PRO версию.`;
  }

  canUseCustomFields(): boolean {
    return this.isFeatureAvailable(LicenseFeature.CUSTOM_FIELDS);
  }

  canUseApiSelect(): boolean {
    return this.isFeatureAvailable(LicenseFeature.API_SELECT);
  }

  hasUnlimitedBlockTypes(): boolean {
    return this.isFeatureAvailable(LicenseFeature.UNLIMITED_BLOCK_TYPES);
  }

  hasAdvancedSpacing(): boolean {
    return this.isFeatureAvailable(LicenseFeature.ADVANCED_SPACING);
  }

  filterFieldsByLicense<T extends { type: string; [key: string]: any }>(fields: T[]): T[] {
    return fields.filter(field => {
      if (field.type === 'api-select' && !this.canUseApiSelect()) {
        return false;
      }
      if (field.type === 'custom' && !this.canUseCustomFields()) {
        return false;
      }
      return true;
    });
  }

  getUnavailableFeatures(): LicenseFeature[] {
    return Object.values(LicenseFeature).filter(
      feature => !this.isFeatureAvailable(feature)
    );
  }

  getAvailableFeaturesInfo(): Record<string, boolean> {
    const info: Record<string, boolean> = {};
    Object.values(LicenseFeature).forEach(feature => {
      info[feature] = this.isFeatureAvailable(feature);
    });
    return info;
  }
}
