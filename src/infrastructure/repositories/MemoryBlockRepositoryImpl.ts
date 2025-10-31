import { IBlockDto, ICreateBlockDto, IUpdateBlockDto } from '../../core/types';
import { IBlockRepository } from '../../core/ports/BlockRepository';
import { deepClone } from '../../utils/deepClone';

/**
 * Реализация репозитория блоков в памяти
 * Реализует порт BlockRepository
 */
export class MemoryBlockRepositoryImpl implements IBlockRepository {
  private blocks: Map<string, IBlockDto> = new Map();

  async create(blockData: ICreateBlockDto & { id?: string }): Promise<IBlockDto> {
    // Используем переданный ID, если он есть (для восстановления сохраненных блоков)
    // Иначе генерируем новый ID
    const id = blockData.id || this.generateId();
    const block: IBlockDto = {
      id,
      ...blockData,
      visible: blockData.visible ?? true, // По умолчанию видимые
      locked: blockData.locked ?? false, // По умолчанию не заблокированные
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        ...blockData.metadata
      }
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
        // Сортируем по полю order, если оно есть, иначе по дате создания
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
      style: updates.style ? { ...existingBlock.style, ...updates.style } as Record<string, string | number> : existingBlock.style,
      metadata: {
        ...existingBlock.metadata!,
        updatedAt: new Date(),
        version: (existingBlock.metadata?.version || 1) + 1
      }
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

  /**
   * Генерирует уникальный идентификатор для блока
   * Использует crypto.randomUUID если доступен, иначе комбинацию timestamp и случайных символов
   * @returns Уникальный идентификатор
   */
  private generateId(): string {
    // Используем crypto.randomUUID если доступен (более надежно)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback для старых браузеров - добавляем дополнительную случайность
    return `block_${Date.now()}_${Math.random().toString(36).substring(2, 11)}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
