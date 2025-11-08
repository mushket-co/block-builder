export enum TLicenseType {
  FREE = 'free',
  PRO = 'pro'
}
const DEFAULT_LICENSE_SERVER_URL = 'https://api.block-builder.ru';
export interface ILicenseConfig {
  type?: TLicenseType;
  key?: string;
  maxBlockTypes?: number;
}
export class License {
  private readonly config: ILicenseConfig;
  private licenseType: TLicenseType;
  private isVerifying: boolean = false;
  private verificationPromise?: Promise<TLicenseType>;
  constructor(config: ILicenseConfig) {
    this.config = config;
    this.licenseType = config.type || TLicenseType.FREE;
    this.validateConfig();
  }
    private validateConfig(): void {
    if (this.licenseType === TLicenseType.FREE && !this.config.maxBlockTypes) {
      this.config.maxBlockTypes = 5;
    }
    if (this.config.maxBlockTypes && this.config.maxBlockTypes <= 0) {
      throw new Error('maxBlockTypes must be greater than 0');
    }
  }
  
  async verifyKey(key: string): Promise<TLicenseType> {
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
          this.updateType(TLicenseType.FREE);
          return TLicenseType.FREE;
        }
        const data = await response.json();
        if (data.valid && data.type && data.type.toLowerCase() === 'pro') {
          this.updateType(TLicenseType.PRO);
          return TLicenseType.PRO;
        } else {
          this.updateType(TLicenseType.FREE);
          return TLicenseType.FREE;
        }
      } catch (error) {
        this.updateType(TLicenseType.FREE);
        return TLicenseType.FREE;
      } finally {
        this.isVerifying = false;
      }
    })();
    return this.verificationPromise;
  }
  
  hasKey(): boolean {
    return !!this.config.key;
  }
  
  updateType(type: TLicenseType): void {
    this.licenseType = type;
    if (type === TLicenseType.FREE && !this.config.maxBlockTypes) {
      this.config.maxBlockTypes = 5;
    }
  }
  
  getType(): TLicenseType {
    return this.licenseType;
  }
  
  isPro(): boolean {
    return this.licenseType === TLicenseType.PRO;
  }
  
  getMaxBlockTypes(): number {
    if (this.isPro()) {
      return Infinity;
    }
    return this.config.maxBlockTypes || 0;
  }
  
  canAddBlockType(currentCount: number): boolean {
    if (this.isPro()) {
      return true;
    }
    const maxBlockTypes = this.getMaxBlockTypes();
    return currentCount < maxBlockTypes;
  }
  
  getRemainingBlockTypeSlots(currentCount: number): number {
    if (this.isPro()) {
      return Infinity;
    }
    const maxBlockTypes = this.getMaxBlockTypes();
    return Math.max(0, maxBlockTypes - currentCount);
  }
  
  getLimitErrorMessage(currentCount: number, blockType: string): string {
    const maxBlockTypes = this.getMaxBlockTypes();
    const remaining = this.getRemainingBlockTypeSlots(currentCount);
    return `Вы достигли лимита в ${maxBlockTypes} типов блоков. Нельзя добавить "${blockType}". Для снятия ограничений приобретите PRO версию.`;
  }
  
  getLicenseInfo(): string {
    if (this.isPro()) {
      return 'PRO Лицензия - Без ограничений';
    }
    const maxBlockTypes = this.getMaxBlockTypes();
    return `FREE Лицензия - Максимум ${maxBlockTypes} типов блоков`;
  }
  
  static createFree(maxBlockTypes: number = 5): License {
    return new License({
      type: TLicenseType.FREE,
      maxBlockTypes
    });
  }
  
  static createPro(): License {
    return new License({
      type: TLicenseType.PRO
    });
  }
  
  static fromConfig(config: ILicenseConfig): License {
    return new License(config);
  }
}