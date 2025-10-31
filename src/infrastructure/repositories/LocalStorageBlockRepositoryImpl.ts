import { IBlockDto, ICreateBlockDto, IUpdateBlockDto } from '../../core/types';
import { IBlockRepository } from '../../core/ports/BlockRepository';
import { STORAGE_KEY_BLOCKS, ERROR_MESSAGES } from '../../utils/constants';

/**
 * Реализация репозитория блоков с использованием LocalStorage
 * Реализует порт BlockRepository
 */
export class LocalStorageBlockRepositoryImpl implements IBlockRepository {
  private readonly storageKey = STORAGE_KEY_BLOCKS;

  /**
   * Проверяет доступность localStorage
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private getBlocksFromStorage(): Map<string, IBlockDto> {
    if (!this.isLocalStorageAvailable()) {
      return new Map();
    }
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return new Map();

      const blocksArray = JSON.parse(stored) as IBlockDto[];
      // Нормализуем даты (они приходят как строки из JSON)
      const normalizedBlocks = blocksArray.map(block => ({
        ...block,
        metadata: block.metadata ? {
          ...block.metadata,
          createdAt: new Date(block.metadata.createdAt),
          updatedAt: new Date(block.metadata.updatedAt)
        } : undefined
      }));
      return new Map(normalizedBlocks.map(block => [block.id, block]));
    } catch (error) {
      // Возвращаем пустой Map, чтобы не сломать работу приложения
      return new Map();
    }
  }

  private saveBlocksToStorage(blocks: Map<string, IBlockDto>): void {
    if (!this.isLocalStorageAvailable()) {
      throw new Error('localStorage недоступен');
    }

    try {
      const blocksArray = Array.from(blocks.values());
      localStorage.setItem(this.storageKey, JSON.stringify(blocksArray));
    } catch (error) {
      // Проверяем, не превышена ли квота
      if (error instanceof DOMException && error.code === error.QUOTA_EXCEEDED_ERR) {
        throw new Error(ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED);
      }
      throw error;
    }
  }

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

    const blocks = this.getBlocksFromStorage();
    blocks.set(id, block);
    this.saveBlocksToStorage(blocks);

    return { ...block };
  }

  async getById(id: string): Promise<IBlockDto | null> {
    const blocks = this.getBlocksFromStorage();
    const block = blocks.get(id);
    return block ? { ...block } : null;
  }

  async getAll(): Promise<IBlockDto[]> {
    const blocks = this.getBlocksFromStorage();
    return Array.from(blocks.values())
      .sort((a, b) => {
        // Сортируем по полю order, если оно есть, иначе по дате создания
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        const dateA = a.metadata?.createdAt ? new Date(a.metadata.createdAt) : new Date(0);
        const dateB = b.metadata?.createdAt ? new Date(b.metadata.createdAt) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      })
      .map(block => ({ ...block }));
  }

  async getByType(type: string): Promise<IBlockDto[]> {
    const blocks = this.getBlocksFromStorage();
    return Array.from(blocks.values())
      .filter(block => block.type === type)
      .map(block => ({ ...block }));
  }

  async getChildren(parentId: string): Promise<IBlockDto[]> {
    const blocks = this.getBlocksFromStorage();
    return Array.from(blocks.values())
      .filter(block => block.parent === parentId)
      .map(block => ({ ...block }));
  }

  async update(id: string, updates: IUpdateBlockDto): Promise<IBlockDto> {
    const blocks = this.getBlocksFromStorage();
    const existingBlock = blocks.get(id);

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

    blocks.set(id, updatedBlock);
    this.saveBlocksToStorage(blocks);

    return { ...updatedBlock };
  }

  async delete(id: string): Promise<boolean> {
    const blocks = this.getBlocksFromStorage();
    const deleted = blocks.delete(id);
    this.saveBlocksToStorage(blocks);
    return deleted;
  }

  async exists(id: string): Promise<boolean> {
    const blocks = this.getBlocksFromStorage();
    return blocks.has(id);
  }

  async count(): Promise<number> {
    const blocks = this.getBlocksFromStorage();
    return blocks.size;
  }

  async clear(): Promise<void> {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Генерирует уникальный идентификатор для блока
   * Использует crypto.randomUUID если доступен, иначе комбинацию timestamp и случайных символов
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
