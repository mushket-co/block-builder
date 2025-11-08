import { IBlockRepository } from '../../core/ports/BlockRepository';
import { IBlockDto, ICreateBlockDto, IUpdateBlockDto } from '../../core/types';
import { deepClone } from '../../utils/deepClone';

export class MemoryBlockRepositoryImpl implements IBlockRepository {
  private blocks: Map<string, IBlockDto> = new Map();
  async create(blockData: ICreateBlockDto & { id?: string }): Promise<IBlockDto> {
    const id = blockData.id || this.generateId();
    const block: IBlockDto = {
      id,
      ...blockData,
      visible: blockData.visible ?? true,
      locked: blockData.locked ?? false,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        ...blockData.metadata,
      },
    };
    this.blocks.set(id, block);
    return deepClone(block);
  }
  async getById(id: string): Promise<IBlockDto | null> {
    const block = this.blocks.get(id);
    return block ? deepClone(block) : null;
  }
  async getAll(): Promise<IBlockDto[]> {
    return Array.from(this.blocks.values())
      .sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        const dateA = a.metadata?.createdAt ? new Date(a.metadata.createdAt) : new Date(0);
        const dateB = b.metadata?.createdAt ? new Date(b.metadata.createdAt) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      })
      .map(block => deepClone(block));
  }
  async getByType(type: string): Promise<IBlockDto[]> {
    return Array.from(this.blocks.values())
      .filter(block => block.type === type)
      .map(block => deepClone(block));
  }
  async getChildren(parentId: string): Promise<IBlockDto[]> {
    return Array.from(this.blocks.values())
      .filter(block => block.parent === parentId)
      .map(block => deepClone(block));
  }
  async update(id: string, updates: IUpdateBlockDto): Promise<IBlockDto> {
    const existingBlock = this.blocks.get(id);
    if (!existingBlock) {
      throw new Error(`Block with id ${id} not found`);
    }
    const updatedBlock: IBlockDto = {
      ...existingBlock,
      ...updates,
      style: updates.style
        ? ({ ...existingBlock.style, ...updates.style } as Record<string, string | number>)
        : existingBlock.style,
      metadata: {
        createdAt: existingBlock.metadata?.createdAt || new Date(),
        updatedAt: new Date(),
        version: (existingBlock.metadata?.version || 1) + 1,
        author: existingBlock.metadata?.author,
      },
    };
    this.blocks.set(id, updatedBlock);
    return deepClone(updatedBlock);
  }
  async delete(id: string): Promise<boolean> {
    return this.blocks.delete(id);
  }
  async exists(id: string): Promise<boolean> {
    return this.blocks.has(id);
  }
  async count(): Promise<number> {
    return this.blocks.size;
  }
  async clear(): Promise<void> {
    this.blocks.clear();
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `block_${Date.now()}_${Math.random().toString(36).slice(2, 11)}_${Math.random().toString(36).slice(2, 11)}`;
  }
}
