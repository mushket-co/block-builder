import { IBlockDto, IUpdateBlockDto } from '../types';
import { IBlockRepository } from '../ports/BlockRepository';
export class UpdateBlockUseCase {
  constructor(private blockRepository: IBlockRepository) {}
  async execute(
  blockId: string,
  updates: IUpdateBlockDto
  ): Promise<IBlockDto | null> {
  const existingBlock = await this.blockRepository.getById(blockId);
  if (!existingBlock) {
    return null;
  }
  this.validateUpdates(updates);
  const updatedBlock = await this.blockRepository.update(blockId, updates);
  return updatedBlock;
  }
  private validateUpdates(updates: IUpdateBlockDto): void {
  if (updates.settings) {
    this.validateSettings(updates.settings);
  }
  if (updates.props) {
    this.validateProps(updates.props);
  }
  if (updates.style) {
    this.validateStyle(updates.style);
  }
  }
  private validateSettings(settings: Partial<Record<string, any>>): void {
  Object.entries(settings).forEach(([key, value]) => {
    if (value !== null && typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      throw new Error(`Invalid setting value for key '${key}': must be primitive type`);
    }
  });
  }
  private validateProps(props: Partial<Record<string, any>>): void {
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'spacing') {
      return;
    }
    
    if (Array.isArray(value)) {
      return;
    }
    
    if (value !== null && typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      throw new Error(`Invalid prop value for key '${key}': must be primitive type`);
    }
  });
  }
  private validateStyle(style: Partial<Record<string, string | number>>): void {
  Object.entries(style).forEach(([key, value]) => {
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new Error(`Invalid style value for key '${key}': must be string or number`);
    }
  });
  }
}