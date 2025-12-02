import { computed, ref } from 'vue';

import { LicenseFeatureChecker } from '../../core/services/LicenseFeatureChecker';
import { LicenseFeature } from '../../core/services/LicenseFeatureChecker';
import { LicenseService } from '../../core/services/LicenseService';

export function useLicense(
  licenseService: LicenseService | undefined,
  licenseKey: string | undefined,
  availableBlockTypesCount: number
) {
  const internalLicenseService = ref<LicenseService | null>(null);
  const licenseState = ref<{
    isPro: boolean;
    maxBlockTypes: number;
    currentTypesCount: number;
  } | null>(null);

  if (licenseKey && !licenseService) {
    const service = new LicenseService({ key: licenseKey });
    internalLicenseService.value = service;
    licenseState.value = service.getLicenseInfo(0);
    service.onLicenseChange(async info => {
      licenseState.value = info;
    });
  }

  const licenseInfoComputed = computed(() => {
    if (licenseService) {
      return licenseService.getLicenseInfo(availableBlockTypesCount);
    }
    if (licenseState.value) {
      return {
        ...licenseState.value,
        currentTypesCount: availableBlockTypesCount,
      };
    }
    const internalService = internalLicenseService.value;
    if (internalService) {
      return internalService.getLicenseInfo(availableBlockTypesCount);
    }
    return {
      isPro: false,
      maxBlockTypes: 5,
      currentTypesCount: availableBlockTypesCount,
    };
  });

  const getLicenseFeatureChecker = computed((): LicenseFeatureChecker | null => {
    const service = licenseService || internalLicenseService.value;
    return service ? service.getFeatureChecker() : null;
  });

  const getApiSelectRestrictionMessage = (): string => {
    const checker = getLicenseFeatureChecker.value;
    if (checker) {
      return checker.getFeatureRestrictionMessage(LicenseFeature.API_SELECT);
    }
    return 'API Select поля доступны только в PRO версии. Для снятия ограничений приобретите PRO версию.';
  };

  const getCustomFieldsRestrictionMessage = (): string => {
    const checker = getLicenseFeatureChecker.value;
    if (checker) {
      return checker.getFeatureRestrictionMessage(LicenseFeature.CUSTOM_FIELDS);
    }
    return 'Кастомные поля доступны только в PRO версии. Для снятия ограничений приобретите PRO версию.';
  };

  const isApiSelectAvailable = (): boolean => {
    const checker = getLicenseFeatureChecker.value;
    return checker ? checker.canUseApiSelect() : false;
  };

  const isCustomFieldAvailable = (): boolean => {
    const checker = getLicenseFeatureChecker.value;
    return checker ? checker.canUseCustomFields() : false;
  };

  return {
    licenseInfoComputed,
    getLicenseFeatureChecker,
    getApiSelectRestrictionMessage,
    getCustomFieldsRestrictionMessage,
    isApiSelectAvailable,
    isCustomFieldAvailable,
    internalLicenseService,
  };
}
