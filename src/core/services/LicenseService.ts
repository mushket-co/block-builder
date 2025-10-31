/**
 * LicenseService - единый сервис для управления лицензией
 * Централизует всю логику проверки лицензии и фильтрации по ограничениям
 *
 * Принцип единственной ответственности: только управление лицензией
 */

import { License, ILicenseConfig, TLicenseType } from '../entities/License';
import { LicenseFeatureChecker, LicenseFeature } from './LicenseFeatureChecker';

export interface ILicenseInfo {
  isPro: boolean;
  maxBlockTypes: number;
  currentTypesCount: number;
}

export class LicenseService {
  private license: License;
  private onLicenseChangeCallbacks: Set<(info: ILicenseInfo) => void> = new Set();
  private featureChecker: LicenseFeatureChecker;

  constructor(config?: ILicenseConfig) {
    this.license = config
      ? License.fromConfig(config)
      : License.createFree(5);

    // Инициализируем проверку функций
    this.featureChecker = new LicenseFeatureChecker(this.license);

    // Асинхронная проверка лицензионного ключа в фоне (если передан)
    if (config?.key) {
      this.verifyKey(config.key).catch(() => {
        // Ошибка проверки лицензии игнорируется
      });
    }
  }

  /**
   * Проверка лицензионного ключа
   */
  async verifyKey(key: string): Promise<TLicenseType> {
    const type = await this.license.verifyKey(key);

    // Пересоздаем feature checker с новой лицензией
    this.featureChecker = new LicenseFeatureChecker(this.license);

    // Уведомляем подписчиков об изменении лицензии
    if (type === TLicenseType.PRO) {
      this.notifyLicenseChange();
    }

    return type;
  }

  /**
   * Получить информацию о лицензии для UI
   */
  getLicenseInfo(currentTypesCount: number = 0): ILicenseInfo {
    return {
      isPro: this.license.isPro(),
      maxBlockTypes: this.license.getMaxBlockTypes(),
      currentTypesCount
    };
  }

  /**
   * Проверить, может ли пользователь добавить еще один тип блока
   */
  canAddBlockType(currentCount: number): boolean {
    return this.license.canAddBlockType(currentCount);
  }

  /**
   * Получить список разрешенных типов блоков
   */
  getAllowedBlockTypes(allBlockTypes: string[]): string[] {
    if (this.license.isPro()) {
      return allBlockTypes;
    }

    const maxBlockTypes = this.license.getMaxBlockTypes();
    return allBlockTypes.slice(0, maxBlockTypes);
  }

  /**
   * Фильтровать блоки по лицензии
   */
  filterBlocksByLicense<T extends { type: string }>(blocks: T[], allowedTypes: string[]): T[] {
    if (this.license.isPro()) {
      return blocks;
    }

    return blocks.filter(block => allowedTypes.includes(block.type));
  }

  /**
   * Получить сообщение об ошибке лимита
   */
  getLimitErrorMessage(currentCount: number, blockType: string): string {
    return this.license.getLimitErrorMessage(currentCount, blockType);
  }

  /**
   * Получить текущий экземпляр License
   */
  getLicense(): License {
    return this.license;
  }

  /**
   * Получить проверку функций лицензии
   */
  getFeatureChecker(): LicenseFeatureChecker {
    return this.featureChecker;
  }

  /**
   * Проверить доступна ли функция (удобный метод)
   */
  isFeatureAvailable(feature: LicenseFeature): boolean {
    return this.featureChecker.isFeatureAvailable(feature);
  }

  /**
   * Проверить может ли быть использовано кастомное поле
   */
  canUseCustomFields(): boolean {
    return this.featureChecker.canUseCustomFields();
  }

  /**
   * Проверить может ли быть использовано API Select поле
   */
  canUseApiSelect(): boolean {
    return this.featureChecker.canUseApiSelect();
  }

  /**
   * Фильтровать поля конфигурации блока по лицензии
   */
  filterFieldsByLicense<T extends { type: string; [key: string]: any }>(fields: T[]): T[] {
    return this.featureChecker.filterFieldsByLicense(fields);
  }

  /**
   * Подписка на изменение лицензии
   */
  onLicenseChange(callback: (info: ILicenseInfo) => void): () => void {
    this.onLicenseChangeCallbacks.add(callback);

    // Возвращаем функцию для отписки
    return () => {
      this.onLicenseChangeCallbacks.delete(callback);
    };
  }

  /**
   * Уведомление подписчиков об изменении лицензии
   */
  private notifyLicenseChange(): void {
    const info = this.getLicenseInfo();
    this.onLicenseChangeCallbacks.forEach(callback => {
      try {
        callback(info);
      } catch (error) {
        // Игнорируем ошибки в колбэках
      }
    });
  }
}

