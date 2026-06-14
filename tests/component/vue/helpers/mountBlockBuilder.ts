import { mount, type VueWrapper } from '@vue/test-utils';

import { BlockBuilderComponent } from '../../../../src/vue';
import {
  dualRepeaterCheckboxBlockType,
  linkBlockType,
  minimalTextBlockType,
  nestedRepeaterBlockType,
  repeaterBlockType,
  repeaterToggleBlockType,
  toggleGroupBlockType,
  toggleRepeaterBlockType,
} from '../../../fixtures/minimal-block-configs';
import { createTestBlockManagementUseCase } from '../../helpers/mockUseCases';

export interface IMountBlockBuilderOptions {
  blockTypes?: Array<typeof minimalTextBlockType>;
  isEdit?: boolean;
}

export function mountBlockBuilder(options: IMountBlockBuilderOptions = {}): VueWrapper {
  const blockManagementUseCase = createTestBlockManagementUseCase();
  const blockTypes = options.blockTypes ?? [minimalTextBlockType];

  return mount(BlockBuilderComponent, {
    props: {
      config: {
        availableBlockTypes: blockTypes,
      },
      blockManagementUseCase,
      isEdit: options.isEdit ?? true,
      onSave: async () => true,
    },
    attachTo: document.body,
  });
}

export {
  linkBlockType,
  minimalTextBlockType,
  nestedRepeaterBlockType,
  repeaterBlockType,
  repeaterToggleBlockType,
  toggleGroupBlockType,
  toggleRepeaterBlockType,
  dualRepeaterCheckboxBlockType,
};
