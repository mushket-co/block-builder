import { IBlockRepository } from '../ports/BlockRepository';

/**
 * Use Case: Удаление блока
 * Инкапсулирует бизнес-логику удаления блока
 */
export class DeleteBlockUseCase {
  constructor(private blockRepository: IBlockRepository) {}

  async execute(blockId: string): Promise<boolean> {
  // Проверка существования блока
  const block = await this.blockRepository.getById(blockId);
  if (!block) {
    return false;
  }

  // Проверка возможности удаления
  if (block.locked) {
    throw new Error('Cannot delete locked block');
  }

  // Удаление дочерних блоков (рекурсивно)
  await this.deleteChildrenRecursively(blockId);

  // Удаление самого блока
  await this.blockRepository.delete(blockId);

  return true;
  }

  private async deleteChildrenRecursively(parentId: string, visited: Set<string> = new Set()): Promise<void> {
  // Защита от циклических ссылок
  if (visited.has(parentId)) {
    return;
  }

  visited.add(parentId);

  const children = await this.blockRepository.getChildren(parentId);
  
  // Итеративный подход вместо рекурсии для большей производительности
  for (const child of children) {
    // Рекурсивно удаляем дочерние блоки
    await this.deleteChildrenRecursively(child.id, visited);
    
    // Удаляем дочерний блок
    await this.blockRepository.delete(child.id);
  }

  visited.delete(parentId);
  }
}