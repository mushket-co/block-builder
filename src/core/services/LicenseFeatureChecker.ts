/**
 * LicenseFeatureChecker - система проверки доступности функций по лицензии
 * Расширяемая архитектура для добавления новых типов ограничений
 *
 * Принцип Open/Closed: открыт для расширения, закрыт для модификации
 */

import { License } from '../entities/License';

/**
 * Типы функций, которые могут быть ограничены лицензией
 */
export enum LicenseFeature {
  CUSTOM_FIELDS = 'customFields',      // Кастомные поля (только PRO)
  API_SELECT = 'apiSelect',            // API Select поля (только PRO)
  UNLIMITED_BLOCK_TYPES = 'unlimitedBlockTypes', // Неограниченное количество типов блоков (только PRO)
  ADVANCED_SPACING = 'advancedSpacing', // Продвинутые настройки spacing (только PRO)
  // Можно легко добавлять новые функции здесь
}

/**
 * Конфигурация доступности функций для разных типов лицензий
 */
interface IFeatureAvailability {
  [LicenseFeature.CUSTOM_FIELDS]: boolean;
  [LicenseFeature.API_SELECT]: boolean;
  [LicenseFeature.UNLIMITED_BLOCK_TYPES]: boolean;
  [LicenseFeature.ADVANCED_SPACING]: boolean;
}

/**
 * Конфигурация функций по умолчанию для FREE лицензии
 */
const FREE_FEATURES: IFeatureAvailability = {
  [LicenseFeature.CUSTOM_FIELDS]: false,
  [LicenseFeature.API_SELECT]: false,
  [LicenseFeature.UNLIMITED_BLOCK_TYPES]: false,
  [LicenseFeature.ADVANCED_SPACING]: false,
};

/**
 * Конфигурация функций для PRO лицензии (все доступно)
 */
const PRO_FEATURES: IFeatureAvailability = {
  [LicenseFeature.CUSTOM_FIELDS]: true,
  [LicenseFeature.API_SELECT]: true,
  [LicenseFeature.UNLIMITED_BLOCK_TYPES]: true,
  [LicenseFeature.ADVANCED_SPACING]: true,
};

/**
 * Сервис для проверки доступности функций по лицензии
 */
export class LicenseFeatureChecker {
  private license: License;

  constructor(license: License) {
    this.license = license;
  }

  /**
   * Проверить доступна ли функция
   */
  isFeatureAvailable(feature: LicenseFeature): boolean {
    const features = this.license.isPro() ? PRO_FEATURES : FREE_FEATURES;
    return features[feature] || false;
  }

  /**
   * Получить сообщение об ограничении для функции
   */
  getFeatureRestrictionMessage(feature: LicenseFeature): string {
    const featureNames: Record<LicenseFeature, string> = {
      [LicenseFeature.CUSTOM_FIELDS]: 'Кастомные поля',
      [LicenseFeature.API_SELECT]: 'API Select поля',
      [LicenseFeature.UNLIMITED_BLOCK_TYPES]: 'Неограниченное количество типов блоков',
      [LicenseFeature.ADVANCED_SPACING]: 'Продвинутые настройки spacing',
    };

    return `${featureNames[feature]} доступны только в PRO версии. Для снятия ограничений приобретите PRO версию.`;
  }

  /**
   * Проверить может ли быть использовано кастомное поле
   */
  canUseCustomFields(): boolean {
    return this.isFeatureAvailable(LicenseFeature.CUSTOM_FIELDS);
  }

  /**
   * Проверить может ли быть использовано API Select поле
   */
  canUseApiSelect(): boolean {
    return this.isFeatureAvailable(LicenseFeature.API_SELECT);
  }

  /**
   * Проверить доступны ли неограниченные типы блоков
   */
  hasUnlimitedBlockTypes(): boolean {
    return this.isFeatureAvailable(LicenseFeature.UNLIMITED_BLOCK_TYPES);
  }

  /**
   * Проверить доступны ли продвинутые настройки spacing
   */
  hasAdvancedSpacing(): boolean {
    return this.isFeatureAvailable(LicenseFeature.ADVANCED_SPACING);
  }

  /**
   * Фильтровать поля конфигурации блока по лицензии
   * Убирает поля, которые недоступны в FREE версии
   */
  filterFieldsByLicense<T extends { type: string; [key: string]: any }>(fields: T[]): T[] {
    return fields.filter(field => {
      // Фильтруем api-select поля
      if (field.type === 'api-select' && !this.canUseApiSelect()) {
        return false;
      }

      // Фильтруем кастомные поля
      if (field.type === 'custom' && !this.canUseCustomFields()) {
        return false;
      }

      return true;
    });
  }

  /**
   * Получить все недоступные функции в виде списка
   */
  getUnavailableFeatures(): LicenseFeature[] {
    return Object.values(LicenseFeature).filter(
      feature => !this.isFeatureAvailable(feature)
    );
  }

  /**
   * Получить информацию о доступных функциях
   */
  getAvailableFeaturesInfo(): Record<string, boolean> {
    const info: Record<string, boolean> = {};
    Object.values(LicenseFeature).forEach(feature => {
      info[feature] = this.isFeatureAvailable(feature);
    });
    return info;
  }
}

