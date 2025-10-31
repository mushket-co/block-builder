import { IBlockDto, ICreateBlockDto, IUpdateBlockDto } from '../types';
import { IBlockRepository } from '../ports/BlockRepository';
import { IComponentRegistry } from '../ports/ComponentRegistry';
import { CreateBlockUseCase } from './CreateBlockUseCase';
import { UpdateBlockUseCase } from './UpdateBlockUseCase';
import { DeleteBlockUseCase } from './DeleteBlockUseCase';
import { DuplicateBlockUseCase } from './DuplicateBlockUseCase';
import { ComponentManagementUseCase } from './ComponentManagementUseCase';

/**
 * Главный Use Case для управления блоками
 * Единственный вход в ядро приложения
 */
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

  /**
   * Создание нового блока
   */
  async createBlock(blockData: ICreateBlockDto): Promise<IBlockDto> {
  return this.createBlockUseCase.execute(blockData);
  }

  /**
   * Получение блока по ID
   */
  async getBlock(blockId: string): Promise<IBlockDto | null> {
  return this.blockRepository.getById(blockId);
  }

  /**
   * Получение всех блоков
   */
  async getAllBlocks(): Promise<IBlockDto[]> {
  return this.blockRepository.getAll();
  }

  /**
   * Обновление блока
   */
  async updateBlock(blockId: string, updates: IUpdateBlockDto): Promise<IBlockDto | null> {
  return this.updateBlockUseCase.execute(blockId, updates);
  }


  /**
   * Удаление блока
   */
  async deleteBlock(blockId: string): Promise<boolean> {
  return this.deleteBlockUseCase.execute(blockId);
  }

  /**
   * Дублирование блока
   */
  async duplicateBlock(blockId: string): Promise<IBlockDto | null> {
  return this.duplicateBlockUseCase.execute(blockId);
  }

  /**
   * Блокировка/разблокировка блока
   */
  async setBlockLocked(blockId: string, locked: boolean): Promise<IBlockDto | null> {
  return this.updateBlockUseCase.execute(blockId, { locked });
  }

  /**
   * Показ/скрытие блока
   */
  async setBlockVisible(blockId: string, visible: boolean): Promise<IBlockDto | null> {
  return this.updateBlockUseCase.execute(blockId, { visible });
  }

  /**
   * Получение блоков по типу
   */
  async getBlocksByType(type: string): Promise<IBlockDto[]> {
  return this.blockRepository.getByType(type);
  }

  /**
   * Получение дочерних блоков
   */
  async getChildBlocks(parentId: string): Promise<IBlockDto[]> {
  return this.blockRepository.getChildren(parentId);
  }

  /**
   * Переупорядочивание блоков
   */
  async reorderBlocks(blockIds: string[]): Promise<boolean> {
  try {
    // Обновляем поле order для каждого блока согласно его позиции в массиве
    for (let i = 0; i < blockIds.length; i++) {
      const blockId = blockIds[i];
      await this.blockRepository.update(blockId, { order: i });
    }

    return true;
  } catch (error) {
    return false;
  }
  }

  /**
   * Очистка всех блоков
   */
  async clearAllBlocks(): Promise<void> {
    return this.blockRepository.clear();
  }

  // ===== МЕТОДЫ ДЛЯ РАБОТЫ С VUE3 КОМПОНЕНТАМИ =====

  /**
   * Регистрация Vue3 компонента
   */
  registerComponent(name: string, component: any): void {
  this.componentManagementUseCase.registerComponent(name, component);
  }

  /**
   * Получение Vue3 компонента
   */
  getComponent(name: string): any | null {
  return this.componentManagementUseCase.getComponent(name);
  }

  /**
   * Проверка существования компонента
   */
  hasComponent(name: string): boolean {
  return this.componentManagementUseCase.hasComponent(name);
  }

  /**
   * Получение всех компонентов
   */
  getAllComponents(): Record<string, any> {
  return this.componentManagementUseCase.getAllComponents();
  }

  /**
   * Удаление компонента
   */
  unregisterComponent(name: string): boolean {
  return this.componentManagementUseCase.unregisterComponent(name);
  }

  /**
   * Массовая регистрация компонентов
   */
  registerComponents(components: Record<string, any>): void {
  this.componentManagementUseCase.registerComponents(components);
  }

  /**
   * Получение реестра компонентов
   */
  getComponentRegistry(): IComponentRegistry {
  return this.componentRegistry;
  }

  /**
   * Создание блока с Vue3 компонентом
   */
  async createVueBlock(
  type: string,
  componentName: string,
  componentProps: Record<string, any> = {},
  settings: Record<string, any> = {},
  ): Promise<IBlockDto> {
  // Проверяем существование компонента
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

  /**
   * Обновление Vue3 компонента блока
   */
  async updateVueComponent(blockId: string, componentName: string, componentProps: Record<string, any>): Promise<IBlockDto | null> {
  // Проверяем существование компонента
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
