import { IBlockDto, ICreateBlockDto } from '../types';
import { IBlockRepository } from '../ports/BlockRepository';
export class DuplicateBlockUseCase {
  constructor(private blockRepository: IBlockRepository) {}
  async execute(blockId: string): Promise<IBlockDto | null> {
  const originalBlock = await this.blockRepository.getById(blockId);
  if (!originalBlock) {
    return null;
  }
  const duplicatedBlock = this.createDuplicate(originalBlock);
  const createdBlock = await this.blockRepository.create(duplicatedBlock);
  await this.duplicateChildren(originalBlock.id, createdBlock.id);
  return createdBlock;
  }
  private createDuplicate(originalBlock: IBlockDto): ICreateBlockDto {
  return {
    type: originalBlock.type,
    settings: { ...originalBlock.settings },
    props: { ...originalBlock.props },
    style: originalBlock.style ? { ...originalBlock.style } : undefined,
    render: originalBlock.render,
    parent: originalBlock.parent,
    visible: originalBlock.visible,
    locked: false,
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    }
  };
  }
  private async duplicateChildren(originalParentId: string, newParentId: string): Promise<void> {
  const children = await this.blockRepository.getChildren(originalParentId);
  for (const child of children) {
    const duplicatedChild = this.createDuplicate(child);
    duplicatedChild.parent = newParentId;
    const createdChild = await this.blockRepository.create(duplicatedChild);
    await this.duplicateChildren(child.id, createdChild.id);
  }
  }
}