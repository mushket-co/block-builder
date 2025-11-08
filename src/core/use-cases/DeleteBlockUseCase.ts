import { IBlockRepository } from '../ports/BlockRepository';

export class DeleteBlockUseCase {
  constructor(private blockRepository: IBlockRepository) {}
  async execute(blockId: string): Promise<boolean> {
    const block = await this.blockRepository.getById(blockId);
    if (!block) {
      return false;
    }
    if (block.locked) {
      throw new Error('Cannot delete locked block');
    }
    await this.deleteChildrenRecursively(blockId);
    await this.blockRepository.delete(blockId);
    return true;
  }
  private async deleteChildrenRecursively(
    parentId: string,
    visited: Set<string> = new Set()
  ): Promise<void> {
    if (visited.has(parentId)) {
      return;
    }
    visited.add(parentId);
    const children = await this.blockRepository.getChildren(parentId);

    for (const child of children) {
      await this.deleteChildrenRecursively(child.id, visited);

      await this.blockRepository.delete(child.id);
    }
    visited.delete(parentId);
  }
}
