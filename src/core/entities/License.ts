/**
 * License Entity
 * Сущность лицензии для управления ограничениями бесплатной/платной версии
 *
 * Бизнес-правила:
 * - Бесплатная версия: максимум 5 типов блоков
 * - Платная версия: анлимит типов блоков и самих блоков
 *
 * Проверка ключей лицензии должна проводиться на сервере (server-bb)
 */


export enum TLicenseType {
  FREE = 'free',
  PRO = 'pro'
}

// URL сервера лицензий (встроен в пакет)
const DEFAULT_LICENSE_SERVER_URL = 'https://api.block-builder.ru';

export interface ILicenseConfig {
  type?: TLicenseType; // Прямое указание типа (для удобства)
  key?: string; // Лицензионный ключ
  maxBlockTypes?: number; // Для FREE версии
}

/**
 * Класс для управления лицензией
 * Инкапсулирует бизнес-правила ограничений
 */
export class License {
  private readonly config: ILicenseConfig;
  private licenseType: TLicenseType;
  private isVerifying: boolean = false;
  private verificationPromise?: Promise<TLicenseType>;

  constructor(config: ILicenseConfig) {
    this.config = config;
    // Тип лицензии определяется ТОЛЬКО через явное указание type или ответ сервера
    // Ключ проверяется ИСКЛЮЧИТЕЛЬНО на сервере через метод verifyKey
    this.licenseType = config.type || TLicenseType.FREE;
    this.validateConfig();
  }

  /**
   * Проверка конфигурации лицензии
   */
  private validateConfig(): void {
    // Проверка для FREE лицензии
    if (this.licenseType === TLicenseType.FREE && !this.config.maxBlockTypes) {
      this.config.maxBlockTypes = 5; // Значение по умолчанию
    }

    if (this.config.maxBlockTypes && this.config.maxBlockTypes <= 0) {
      throw new Error('maxBlockTypes must be greater than 0');
    }
  }

  /**
   * Асинхронная проверка лицензионного ключа через сервер (в фоне, не блокирует рендер)
   */
  async verifyKey(key: string): Promise<TLicenseType> {
    // Предотвращаем дублирующие запросы
    if (this.isVerifying && this.verificationPromise) {
      return this.verificationPromise;
    }

    this.isVerifying = true;

    this.verificationPromise = (async () => {
      try {
        const response = await fetch(`${DEFAULT_LICENSE_SERVER_URL}/api/license/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key })
        });

        if (!response.ok) {
          // Если сервер вернул ошибку, ключ неверный - устанавливаем FREE
          this.updateType(TLicenseType.FREE);
          return TLicenseType.FREE;
        }

        const data = await response.json();

        if (data.valid && data.type && data.type.toLowerCase() === 'pro') {
          this.updateType(TLicenseType.PRO);
          return TLicenseType.PRO;
        } else {
          // Ключ неверный или не PRO - устанавливаем FREE
          this.updateType(TLicenseType.FREE);
          return TLicenseType.FREE;
        }
      } catch (error) {
        // При ошибке сети или парсинга - ключ не был проверен, устанавливаем FREE
        this.updateType(TLicenseType.FREE);
        return TLicenseType.FREE;
      } finally {
        this.isVerifying = false;
      }
    })();

    return this.verificationPromise;
  }

  /**
   * Проверить наличие ключа в конфигурации
   */
  hasKey(): boolean {
    return !!this.config.key;
  }

  /**
   * Обновить тип лицензии (после успешной проверки)
   */
  updateType(type: TLicenseType): void {
    this.licenseType = type;
    // При смене на FREE убеждаемся, что maxBlockTypes установлен
    if (type === TLicenseType.FREE && !this.config.maxBlockTypes) {
      this.config.maxBlockTypes = 5; // Значение по умолчанию для FREE
    }
  }

  /**
   * Получить тип лицензии
   */
  getType(): TLicenseType {
    return this.licenseType;
  }

  /**
   * Проверить является ли лицензия PRO
   */
  isPro(): boolean {
    return this.licenseType === TLicenseType.PRO;
  }

  /**
   * Получить максимальное количество типов блоков
   */
  getMaxBlockTypes(): number {
    if (this.isPro()) {
      return Infinity;
    }
    return this.config.maxBlockTypes || 0;
  }

  /**
   * Проверить может ли пользователь добавить еще один тип блока
   * @param currentCount - текущее количество типов блоков
   */
  canAddBlockType(currentCount: number): boolean {
    if (this.isPro()) {
      return true;
    }

    const maxBlockTypes = this.getMaxBlockTypes();
    return currentCount < maxBlockTypes;
  }

  /**
   * Получить оставшееся количество слотов для типов блоков
   * @param currentCount - текущее количество типов блоков
   */
  getRemainingBlockTypeSlots(currentCount: number): number {
    if (this.isPro()) {
      return Infinity;
    }

    const maxBlockTypes = this.getMaxBlockTypes();
    return Math.max(0, maxBlockTypes - currentCount);
  }

  /**
   * Получить сообщение об ошибке лимита
   * @param currentCount - текущее количество типов блоков
   */
  getLimitErrorMessage(currentCount: number, blockType: string): string {
    const maxBlockTypes = this.getMaxBlockTypes();
    const remaining = this.getRemainingBlockTypeSlots(currentCount);

    return `Вы достигли лимита в ${maxBlockTypes} типов блоков. Нельзя добавить "${blockType}". Для снятия ограничений приобретите PRO версию.`;
  }

  /**
   * Получить сообщение о лицензии
   */
  getLicenseInfo(): string {
    if (this.isPro()) {
      return 'PRO Лицензия - Без ограничений';
    }

    const maxBlockTypes = this.getMaxBlockTypes();
    return `FREE Лицензия - Максимум ${maxBlockTypes} типов блоков`;
  }

  /**
   * Создать FREE лицензию с кастомным лимитом
   */
  static createFree(maxBlockTypes: number = 5): License {
    return new License({
      type: TLicenseType.FREE,
      maxBlockTypes
    });
  }

  /**
   * Создать PRO лицензию
   */
  static createPro(): License {
    return new License({
      type: TLicenseType.PRO
    });
  }

  /**
   * Создать лицензию из конфигурации
   */
  static fromConfig(config: ILicenseConfig): License {
    return new License(config);
  }
}

