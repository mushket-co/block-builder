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
    this.featureChecker = new LicenseFeatureChecker(this.license);
    if (config?.key) {
      this.verifyKey(config.key).catch(() => {
      });
    }
  }
    async verifyKey(key: string): Promise<TLicenseType> {
    const previousType = this.license.getType();
    
    const type = await this.license.verifyKey(key);
    this.featureChecker = new LicenseFeatureChecker(this.license);
    if (previousType !== type) {
      this.notifyLicenseChange();
    }
    return type;
  }
  
  getLicenseInfo(currentTypesCount: number = 0): ILicenseInfo {
    return {
      isPro: this.license.isPro(),
      maxBlockTypes: this.license.getMaxBlockTypes(),
      currentTypesCount
    };
  }
  
  canAddBlockType(currentCount: number): boolean {
    return this.license.canAddBlockType(currentCount);
  }
  
  getAllowedBlockTypes(allBlockTypes: string[]): string[] {
    if (this.license.isPro()) {
      return allBlockTypes;
    }
    const maxBlockTypes = this.license.getMaxBlockTypes();
    
    if (maxBlockTypes <= 0) {
      return [];
    }
    
    const allowed = allBlockTypes.slice(0, maxBlockTypes);
    return allowed;
  }
  
  filterBlocksByLicense<T extends { type: string }>(blocks: T[], allowedTypes: string[]): T[] {
    if (this.license.isPro()) {
      return blocks;
    }
    return blocks.filter(block => allowedTypes.includes(block.type));
  }
  
  getLimitErrorMessage(currentCount: number, blockType: string): string {
    return this.license.getLimitErrorMessage(currentCount, blockType);
  }
  
  getLicense(): License {
    return this.license;
  }
  
  getFeatureChecker(): LicenseFeatureChecker {
    return this.featureChecker;
  }
  
  isFeatureAvailable(feature: LicenseFeature): boolean {
    return this.featureChecker.isFeatureAvailable(feature);
  }
  
  canUseCustomFields(): boolean {
    return this.featureChecker.canUseCustomFields();
  }
  
  canUseApiSelect(): boolean {
    return this.featureChecker.canUseApiSelect();
  }
  
  filterFieldsByLicense<T extends { type: string; [key: string]: any }>(fields: T[]): T[] {
    return this.featureChecker.filterFieldsByLicense(fields);
  }
  
  onLicenseChange(callback: (info: ILicenseInfo) => void): () => void {
    this.onLicenseChangeCallbacks.add(callback);
    return () => {
      this.onLicenseChangeCallbacks.delete(callback);
    };
  }
  
  private notifyLicenseChange(): void {
    const info = this.getLicenseInfo();
    this.onLicenseChangeCallbacks.forEach(callback => {
      try {
        callback(info);
      } catch (error) {
      }
    });
  }
}