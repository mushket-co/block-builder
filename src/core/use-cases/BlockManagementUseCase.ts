import { IBlockDto, ICreateBlockDto, IUpdateBlockDto } from '../types';
import { IBlockRepository } from '../ports/BlockRepository';
import { IComponentRegistry } from '../ports/ComponentRegistry';
import { CreateBlockUseCase } from './CreateBlockUseCase';
import { UpdateBlockUseCase } from './UpdateBlockUseCase';
import { DeleteBlockUseCase } from './DeleteBlockUseCase';
import { DuplicateBlockUseCase } from './DuplicateBlockUseCase';
import { ComponentManagementUseCase } from './ComponentManagementUseCase';
export class BlockManagementUseCase {
  private createBlockUseCase: CreateBlockUseCase;
  private updateBlockUseCase: UpdateBlockUseCase;
  private deleteBlockUseCase: DeleteBlockUseCase;
  private duplicateBlockUseCase: DuplicateBlockUseCase;
  private componentManagementUseCase: ComponentManagementUseCase;
  constructor(
  private blockRepository: IBlockRepository,
  private componentRegistry: IComponentRegistry
  ) {
  this.createBlockUseCase = new CreateBlockUseCase(blockRepository);
  this.updateBlockUseCase = new UpdateBlockUseCase(blockRepository);
  this.deleteBlockUseCase = new DeleteBlockUseCase(blockRepository);
  this.duplicateBlockUseCase = new DuplicateBlockUseCase(blockRepository);
  this.componentManagementUseCase = new ComponentManagementUseCase(componentRegistry);
  }
    async createBlock(blockData: ICreateBlockDto): Promise<IBlockDto> {
  return this.createBlockUseCase.execute(blockData);
  }
    async getBlock(blockId: string): Promise<IBlockDto | null> {
  return this.blockRepository.getById(blockId);
  }
    async getAllBlocks(): Promise<IBlockDto[]> {
  return this.blockRepository.getAll();
  }
    async updateBlock(blockId: string, updates: IUpdateBlockDto): Promise<IBlockDto | null> {
  return this.updateBlockUseCase.execute(blockId, updates);
  }
    async deleteBlock(blockId: string): Promise<boolean> {
  return this.deleteBlockUseCase.execute(blockId);
  }
    async duplicateBlock(blockId: string): Promise<IBlockDto | null> {
  return this.duplicateBlockUseCase.execute(blockId);
  }
    async setBlockLocked(blockId: string, locked: boolean): Promise<IBlockDto | null> {
  return this.updateBlockUseCase.execute(blockId, { locked });
  }
    async setBlockVisible(blockId: string, visible: boolean): Promise<IBlockDto | null> {
  return this.updateBlockUseCase.execute(blockId, { visible });
  }
    async getBlocksByType(type: string): Promise<IBlockDto[]> {
  return this.blockRepository.getByType(type);
  }
    async getChildBlocks(parentId: string): Promise<IBlockDto[]> {
  return this.blockRepository.getChildren(parentId);
  }
    async reorderBlocks(blockIds: string[]): Promise<boolean> {
  try {
    for (let i = 0; i < blockIds.length; i++) {
      const blockId = blockIds[i];
      await this.blockRepository.update(blockId, { order: i });
    }
    return true;
  } catch (error) {
    return false;
  }
  }
    async clearAllBlocks(): Promise<void> {
    return this.blockRepository.clear();
  }
    registerComponent(name: string, component: any): void {
  this.componentManagementUseCase.registerComponent(name, component);
  }
    getComponent(name: string): any | null {
  return this.componentManagementUseCase.getComponent(name);
  }
    hasComponent(name: string): boolean {
  return this.componentManagementUseCase.hasComponent(name);
  }
    getAllComponents(): Record<string, any> {
  return this.componentManagementUseCase.getAllComponents();
  }
    unregisterComponent(name: string): boolean {
  return this.componentManagementUseCase.unregisterComponent(name);
  }
    registerComponents(components: Record<string, any>): void {
  this.componentManagementUseCase.registerComponents(components);
  }
    getComponentRegistry(): IComponentRegistry {
  return this.componentRegistry;
  }
    async createVueBlock(
  type: string,
  componentName: string,
  componentProps: Record<string, any> = {},
  settings: Record<string, any> = {},
  ): Promise<IBlockDto> {
  if (!this.hasComponent(componentName)) {
    throw new Error(`Component '${componentName}' is not registered`);
  }
  const createDto: ICreateBlockDto = {
    type,
    settings,
    props: componentProps,
    render: {
      kind: 'component',
      framework: 'vue',
      name: componentName,
      props: componentProps
    },
    visible: true,
    locked: false
  };
  return this.createBlock(createDto);
  }
    async updateVueComponent(blockId: string, componentName: string, componentProps: Record<string, any>): Promise<IBlockDto | null> {
  if (!this.hasComponent(componentName)) {
    throw new Error(`Component '${componentName}' is not registered`);
  }
  return this.updateBlock(blockId, {
    render: {
      kind: 'component',
      framework: 'vue',
      name: componentName,
      props: componentProps
    }
  });
  }
}