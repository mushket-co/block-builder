import { BlockBuilderFactory } from './BlockBuilderFactory';
import { IBlockRepository } from './core/ports/BlockRepository';
import { IComponentRegistry } from './core/ports/ComponentRegistry';
import {
  ICustomFieldRenderer,
  ICustomFieldRendererRegistry,
} from './core/ports/CustomFieldRenderer';
import { IHttpClient } from './core/ports/HttpClient';
import { IBlockDto, ICreateBlockDto, IUpdateBlockDto } from './core/types';
import { BlockManagementUseCase } from './core/use-cases/BlockManagementUseCase';
import { ERROR_MESSAGES } from './utils/constants';

export interface IBlockBuilderOptions {
  blockConfigs: Record<
    string,
    { fields?: unknown[]; spacingOptions?: unknown; [key: string]: unknown }
  >;
  repository?: IBlockRepository;
  componentRegistry?: IComponentRegistry;
  httpClient?: IHttpClient;
  customFieldRendererRegistry?: ICustomFieldRendererRegistry;
  theme?: 'light' | 'dark';
  locale?: string;
  autoInit?: boolean;
  initialBlocks?: IBlockDto[];
}

export class BlockBuilderFacade {
  private useCase: BlockManagementUseCase;
  private repository: IBlockRepository;
  private customFieldRendererRegistry: ICustomFieldRendererRegistry;
  private blockConfigs: Record<
    string,
    { fields?: unknown[]; spacingOptions?: unknown; [key: string]: unknown }
  >;

  public readonly theme: string;
  public readonly locale: string;

  constructor(options: IBlockBuilderOptions) {
    this.blockConfigs = options.blockConfigs;
    this.theme = options.theme || 'light';
    this.locale = options.locale || 'ru';

    const dependencies = BlockBuilderFactory.createDependencies({
      repository: options.repository,
      componentRegistry: options.componentRegistry,
      httpClient: options.httpClient,
      customFieldRendererRegistry: options.customFieldRendererRegistry,
    });

    this.repository = dependencies.repository;
    this.customFieldRendererRegistry = dependencies.customFieldRendererRegistry;
    this.useCase = dependencies.useCase;

    this.registerComponentsFromConfig();

    if (options.autoInit !== false) {
      void this.initialize(options.initialBlocks);
    }
  }

  private async initialize(initialBlocks?: IBlockDto[]): Promise<void> {
    if (initialBlocks && initialBlocks.length > 0) {
      await this.loadInitialBlocks(initialBlocks);
    }
  }

  private registerComponentsFromConfig(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const components: Record<string, any> = {};

    Object.entries(this.blockConfigs).forEach(([type, config]) => {
      if (
        config &&
        typeof config === 'object' &&
        'render' in config &&
        config.render &&
        typeof config.render === 'object' &&
        'kind' in config.render &&
        config.render.kind === 'component' &&
        'component' in config.render &&
        config.render.component
      ) {
        const render = config.render as {
          kind: 'component';
          component: { name?: string };
          [key: string]: unknown;
        };
        const componentName = render.component.name || type;
        components[componentName] = render.component;
      }
    });

    if (Object.keys(components).length > 0) {
      this.useCase.registerComponents(components);
    }
  }

  private async loadInitialBlocks(blocks: IBlockDto[]): Promise<void> {
    try {
      for (const block of blocks) {
        const normalizedBlock = {
          ...block,
          visible: block.visible !== undefined ? block.visible : true,
          locked: block.locked !== undefined ? block.locked : false,
          metadata: block.metadata
            ? {
                ...block.metadata,
                createdAt:
                  block.metadata.createdAt instanceof Date
                    ? block.metadata.createdAt
                    : new Date(block.metadata.createdAt),
                updatedAt:
                  block.metadata.updatedAt instanceof Date
                    ? block.metadata.updatedAt
                    : new Date(block.metadata.updatedAt),
              }
            : undefined,
        };

        await this.repository.create(normalizedBlock as ICreateBlockDto & { id: string });
      }
    } catch (error) {
      throw new Error(
        `Не удалось загрузить начальные блоки: ${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`
      );
    }
  }

  async createBlock(blockData: ICreateBlockDto): Promise<IBlockDto> {
    return this.useCase.createBlock(blockData);
  }

  async getBlock(blockId: string): Promise<IBlockDto | null> {
    return this.useCase.getBlock(blockId);
  }

  async getAllBlocks(): Promise<IBlockDto[]> {
    return this.useCase.getAllBlocks();
  }

  async updateBlock(blockId: string, updates: IUpdateBlockDto): Promise<IBlockDto | null> {
    return this.useCase.updateBlock(blockId, updates);
  }

  async deleteBlock(blockId: string): Promise<boolean> {
    return this.useCase.deleteBlock(blockId);
  }

  async duplicateBlock(blockId: string): Promise<IBlockDto | null> {
    return this.useCase.duplicateBlock(blockId);
  }

  async setBlockLocked(blockId: string, locked: boolean): Promise<IBlockDto | null> {
    return this.useCase.setBlockLocked(blockId, locked);
  }

  async setBlockVisible(blockId: string, visible: boolean): Promise<IBlockDto | null> {
    return this.useCase.setBlockVisible(blockId, visible);
  }

  async getBlocksByType(type: string): Promise<IBlockDto[]> {
    return this.useCase.getBlocksByType(type);
  }

  async reorderBlocks(blockIds: string[]): Promise<boolean> {
    return this.useCase.reorderBlocks(blockIds);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerComponent(name: string, component: any): void {
    this.useCase.registerComponent(name, component);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getComponent(name: string): any | null {
    return this.useCase.getComponent(name);
  }

  hasComponent(name: string): boolean {
    return this.useCase.hasComponent(name);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAllComponents(): Record<string, any> {
    return this.useCase.getAllComponents();
  }

  unregisterComponent(name: string): boolean {
    return this.useCase.unregisterComponent(name);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerComponents(components: Record<string, any>): void {
    this.useCase.registerComponents(components);
  }

  async createVueBlock(
    type: string,
    componentName: string,
    componentProps: Record<string, unknown> = {},
    settings: Record<string, unknown> = {}
  ): Promise<IBlockDto> {
    return this.useCase.createVueBlock(type, componentName, componentProps, settings);
  }

  async updateVueComponent(
    blockId: string,
    componentName: string,
    componentProps: Record<string, unknown>
  ): Promise<IBlockDto | null> {
    return this.useCase.updateVueComponent(blockId, componentName, componentProps);
  }

  getBlockConfigs(): Record<
    string,
    { fields?: unknown[]; spacingOptions?: unknown; [key: string]: unknown }
  > {
    return { ...this.blockConfigs };
  }

  getBlockConfig(
    type: string
  ): { fields?: unknown[]; spacingOptions?: unknown; [key: string]: unknown } | undefined {
    return this.blockConfigs[type];
  }

  hasBlockType(type: string): boolean {
    return type in this.blockConfigs;
  }

  getAvailableBlockTypes(): string[] {
    return Object.keys(this.blockConfigs);
  }

  async clearAllBlocks(): Promise<void> {
    return this.useCase.clearAllBlocks();
  }

  async getBlocksCount(): Promise<number> {
    const blocks = await this.useCase.getAllBlocks();
    return blocks.length;
  }

  async exportBlocks(): Promise<string> {
    const blocks = await this.getAllBlocks();
    return JSON.stringify(blocks, null, 2);
  }

  async importBlocks(jsonData: string): Promise<boolean> {
    try {
      const blocks = JSON.parse(jsonData);
      if (!Array.isArray(blocks)) {
        return false;
      }

      await this.clearAllBlocks();

      for (const block of blocks) {
        await this.createBlock(block);
      }

      return true;
    } catch {
      return false;
    }
  }

  registerCustomFieldRenderer(renderer: ICustomFieldRenderer): void {
    this.customFieldRendererRegistry.register(renderer);
  }

  registerCustomFieldRenderers(renderers: ICustomFieldRenderer[]): void {
    renderers.forEach(renderer => {
      this.customFieldRendererRegistry.register(renderer);
    });
  }

  getCustomFieldRenderer(id: string): ICustomFieldRenderer | null {
    return this.customFieldRendererRegistry.get(id);
  }

  hasCustomFieldRenderer(id: string): boolean {
    return this.customFieldRendererRegistry.has(id);
  }

  unregisterCustomFieldRenderer(id: string): boolean {
    return this.customFieldRendererRegistry.unregister(id);
  }

  getAllCustomFieldRenderers(): Map<string, ICustomFieldRenderer> {
    return this.customFieldRendererRegistry.getAll();
  }
}
