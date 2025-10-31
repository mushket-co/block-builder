import { IBlockDto, ICreateBlockDto } from '../types';
import { IBlockRepository } from '../ports/BlockRepository';

/**
 * Use Case: Создание нового блока
 * Инкапсулирует бизнес-логику создания блока
 */
export class CreateBlockUseCase {
  constructor(private blockRepository: IBlockRepository) {}

  async execute(blockData: ICreateBlockDto): Promise<IBlockDto> {
  // Валидация входных данных
  this.validateBlockData(blockData);

  // Создание блока с метаданными (если они не переданы)
  const blockDataWithMetadata: ICreateBlockDto = {
    ...blockData,
    metadata: blockData.metadata || {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    }
  };

  // Сохранение в репозитории (репозиторий генерирует ID)
  const createdBlock = await this.blockRepository.create(blockDataWithMetadata);

  return createdBlock;
  }

  private validateBlockData(blockData: ICreateBlockDto): void {
    // Валидация типа блока
    if (!blockData.type || typeof blockData.type !== 'string') {
      throw new Error('Block type is required and must be a string');
    }

    if (blockData.type.trim().length === 0) {
      throw new Error('Block type cannot be empty');
    }

    // Валидация settings
    if (blockData.settings && typeof blockData.settings !== 'object') {
      throw new Error('Block settings must be an object');
    }

    // Валидация props
    if (blockData.props && typeof blockData.props !== 'object') {
      throw new Error('Block props must be an object');
    }

    // Валидация style
    if (blockData.style && typeof blockData.style !== 'object') {
      throw new Error('Block style must be an object');
    }

    // Валидация order
    if (blockData.order !== undefined && (!Number.isInteger(blockData.order) || blockData.order < 0)) {
      throw new Error('Block order must be a non-negative integer');
    }

    // Валидация visible
    if (blockData.visible !== undefined && typeof blockData.visible !== 'boolean') {
      throw new Error('Block visible must be a boolean');
    }

    // Валидация locked
    if (blockData.locked !== undefined && typeof blockData.locked !== 'boolean') {
      throw new Error('Block locked must be a boolean');
    }

    // Допускаем различные сценарии отображения через render:
    // 1) HTML template (kind: 'html')
    // 2) Vue/React компонент (kind: 'component')
    // 3) Внешний адаптер (kind: 'external')
    // Поэтому не требуем наличия render в DTO
  }

}
