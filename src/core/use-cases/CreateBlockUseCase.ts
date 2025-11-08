import { IBlockRepository } from '../ports/BlockRepository';
import { IBlockDto, ICreateBlockDto } from '../types';

export class CreateBlockUseCase {
  constructor(private blockRepository: IBlockRepository) {}
  async execute(blockData: ICreateBlockDto): Promise<IBlockDto> {
    this.validateBlockData(blockData);
    const blockDataWithMetadata: ICreateBlockDto = {
      ...blockData,
      metadata: blockData.metadata || {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      },
    };
    const createdBlock = await this.blockRepository.create(blockDataWithMetadata);
    return createdBlock;
  }
  private validateBlockData(blockData: ICreateBlockDto): void {
    if (!blockData.type || typeof blockData.type !== 'string') {
      throw new Error('Block type is required and must be a string');
    }
    if (blockData.type.trim().length === 0) {
      throw new Error('Block type cannot be empty');
    }
    if (blockData.settings && typeof blockData.settings !== 'object') {
      throw new Error('Block settings must be an object');
    }
    if (blockData.props && typeof blockData.props !== 'object') {
      throw new Error('Block props must be an object');
    }
    if (blockData.style && typeof blockData.style !== 'object') {
      throw new Error('Block style must be an object');
    }
    if (
      blockData.order !== undefined &&
      (!Number.isInteger(blockData.order) || blockData.order < 0)
    ) {
      throw new Error('Block order must be a non-negative integer');
    }
    if (blockData.visible !== undefined && typeof blockData.visible !== 'boolean') {
      throw new Error('Block visible must be a boolean');
    }
    if (blockData.locked !== undefined && typeof blockData.locked !== 'boolean') {
      throw new Error('Block locked must be a boolean');
    }
  }
}
