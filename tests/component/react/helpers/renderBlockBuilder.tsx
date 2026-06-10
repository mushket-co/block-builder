import { render, type RenderResult } from '@testing-library/react';

import { BlockBuilderComponent } from '../../../../src/react';
import type { ITestBlockTypeConfig } from '../../../fixtures/minimal-block-configs';
import {
  linkBlockType,
  minimalTextBlockType,
  nestedRepeaterBlockType,
  repeaterBlockType,
  repeaterToggleBlockType,
  toggleGroupBlockType,
} from '../../../fixtures/minimal-block-configs';
import { createTestBlockManagementUseCase } from '../../helpers/mockUseCases';
import { cleanupReactTestHost } from './cleanupReactTestHost';

export interface IRenderBlockBuilderOptions {
  blockTypes?: ITestBlockTypeConfig[];
  isEdit?: boolean;
}

export type TRenderBlockBuilderResult = RenderResult & { host: HTMLElement };

export function renderBlockBuilder(
  options: IRenderBlockBuilderOptions = {}
): TRenderBlockBuilderResult {
  const host = document.createElement('div');
  document.body.appendChild(host);

  const blockManagementUseCase = createTestBlockManagementUseCase();
  const blockTypes = options.blockTypes ?? [minimalTextBlockType];

  const result = render(
    <BlockBuilderComponent
      config={{
        availableBlockTypes: blockTypes,
      }}
      blockManagementUseCase={blockManagementUseCase}
      isEdit={options.isEdit ?? true}
      onSave={async () => true}
    />,
    { container: host }
  );

  return { ...result, host };
}

export { cleanupReactTestHost };

export {
  linkBlockType,
  minimalTextBlockType,
  nestedRepeaterBlockType,
  repeaterBlockType,
  repeaterToggleBlockType,
  toggleGroupBlockType,
};
