import type { BlockManagementUseCase } from '../core/use-cases/BlockManagementUseCase';
import type { IBlock } from '../core/types';
import {
  enrichBlockForDisplay,
  type IBlockTypeRenderConfig,
} from './blockDisplayHelpers';

export async function seedRepositoryFromBlocks(
  blockService: BlockManagementUseCase,
  blocks: IBlock[],
  getBlockTypeConfig: (type: string) => IBlockTypeRenderConfig | undefined
): Promise<void> {
  if (blocks.length === 0) {
    return;
  }

  const existingBlocks = await blockService.getAllBlocks();
  if (existingBlocks.length > 0) {
    return;
  }

  for (let order = 0; order < blocks.length; order++) {
    const block = enrichBlockForDisplay(blocks[order], getBlockTypeConfig);
    const typeConfig = getBlockTypeConfig(block.type);

    await blockService.createBlock({
      id: block.id,
      type: block.type,
      props: block.props ?? {},
      settings: block.settings ?? {},
      render: block.render ?? typeConfig?.render,
      visible: block.visible ?? true,
      locked: block.locked ?? false,
      order,
      metadata: block.metadata,
    } as IBlock);
  }
}
