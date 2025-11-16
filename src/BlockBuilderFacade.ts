import { BlockBuilderFactory } from './BlockBuilderFactory';
import { ILicenseConfig } from './core/entities/License';
import { IBlockRepository } from './core/ports/BlockRepository';
import { IComponentRegistry } from './core/ports/ComponentRegistry';
import {
  ICustomFieldRenderer,
  ICustomFieldRendererRegistry,
} from './core/ports/CustomFieldRenderer';
import { IHttpClient } from './core/ports/HttpClient';
import { LicenseService } from './core/services/LicenseService';
import { IBlockDto, ICreateBlockDto, IUpdateBlockDto } from './core/types';
import { ApiSelectUseCase } from './core/use-cases/ApiSelectUseCase';
import { BlockManagementUseCase } from './core/use-cases/BlockManagementUseCase';
import { ERROR_MESSAGES } from './utils/constants';
import { logger } from './utils/logger';

export interface IBlockBuilderOptions {
  containerId?: string;
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
  onSave?: (blocks: IBlockDto[]) => Promise<boolean> | boolean;
  initialBlocks?: IBlockDto[];
  controlsContainerClass?: string;
  controlsFixedPosition?: 'top' | 'bottom';
  controlsOffset?: number;
  controlsOffsetVar?: string;
  license?: ILicenseConfig;
  isEdit?: boolean;
}

export class BlockBuilderFacade {
  private useCase: BlockManagementUseCase;
  private repository: IBlockRepository;
  private componentRegistry: IComponentRegistry;
  private customFieldRendererRegistry: ICustomFieldRendererRegistry;
  private httpClient: IHttpClient;
  private apiSelectUseCase: ApiSelectUseCase;
  private blockConfigs: Record<
    string,
    { fields?: unknown[]; spacingOptions?: unknown; [key: string]: unknown }
  >;
  private originalBlockConfigs?: Record<
    string,
    { fields?: unknown[]; spacingOptions?: unknown; [key: string]: unknown }
  >;
  private licenseService: LicenseService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private uiController?: any;
  private onSave?: (blocks: IBlockDto[]) => Promise<boolean> | boolean;
  private controlsContainerClass?: string;
  private controlsFixedPosition?: 'top' | 'bottom';
  private controlsOffset?: number;
  private controlsOffsetVar?: string;
  private originalInitialBlocks?: IBlockDto[];
  private isEdit: boolean;

  public readonly theme: string;
  public readonly locale: string;

  constructor(options: IBlockBuilderOptions) {
    this.blockConfigs = options.blockConfigs;
    this.theme = options.theme || 'light';
    this.locale = options.locale || 'ru';
    this.onSave = options.onSave;
    this.controlsContainerClass = options.controlsContainerClass;
    this.controlsFixedPosition = options.controlsFixedPosition;
    this.controlsOffset = options.controlsOffset;
    this.controlsOffsetVar = options.controlsOffsetVar;
    this.isEdit = options.isEdit !== undefined ? options.isEdit : true;

    this.licenseService = new LicenseService(options.license);

    this.licenseService.onLicenseChange(async () => {
      this.reloadLicenseConfiguration();
      await this.reloadBlocksAfterLicenseChange();
    });

    const dependencies = BlockBuilderFactory.createDependencies({
      repository: options.repository,
      componentRegistry: options.componentRegistry,
      httpClient: options.httpClient,
      customFieldRendererRegistry: options.customFieldRendererRegistry,
    });

    this.repository = dependencies.repository;
    this.componentRegistry = dependencies.componentRegistry;
    this.customFieldRendererRegistry = dependencies.customFieldRendererRegistry;
    this.httpClient = dependencies.httpClient;
    this.useCase = dependencies.useCase;
    this.apiSelectUseCase = dependencies.apiSelectUseCase;

    this.registerComponentsFromConfig();

    this.originalInitialBlocks = options.initialBlocks;

    if (options.autoInit !== false) {
      this.initialize(options.containerId, options.initialBlocks);
    }
  }

  private async initialize(containerId?: string, initialBlocks?: IBlockDto[]): Promise<void> {
    if (initialBlocks && initialBlocks.length > 0) {
      await this.loadInitialBlocks(initialBlocks);
    }

    if (containerId) {
      await this.initUI(containerId);
    }
  }

  private async initUI(containerId: string): Promise<void> {
    const { BlockUIController } = await import('./ui/controllers/BlockUIController');

    this.uiController = new BlockUIController({
      containerId,
      blockConfigs: this.blockConfigs,
      useCase: this.useCase,
      apiSelectUseCase: this.apiSelectUseCase,
      customFieldRendererRegistry: this.customFieldRendererRegistry,
      onSave: this.onSave,
      controlsContainerClass: this.controlsContainerClass,
      controlsFixedPosition: this.controlsFixedPosition,
      controlsOffset: this.controlsOffset,
      controlsOffsetVar: this.controlsOffsetVar,
      licenseService: this.licenseService,
      originalBlockConfigs: this.originalBlockConfigs,
      isEdit: this.isEdit,
    });

    await this.uiController.init();
  }

  private registerComponentsFromConfig(): void {
    if (!this.originalBlockConfigs) {
      this.originalBlockConfigs = { ...this.blockConfigs };
    }

    const originalConfigs = this.originalBlockConfigs;

    const allBlockTypes = Object.keys(originalConfigs);
    const allowedTypes = this.licenseService.getAllowedBlockTypes(allBlockTypes);

    const limitedConfigs: Record<
      string,
      { fields?: unknown[]; spacingOptions?: unknown; [key: string]: unknown }
    > = {};
    allowedTypes.forEach(type => {
      if (originalConfigs[type]) {
        limitedConfigs[type] = originalConfigs[type];
      }
    });
    this.blockConfigs = limitedConfigs;

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

  private reloadLicenseConfiguration(): void {
    this.registerComponentsFromConfig();

    if (this.uiController) {
      if (this.uiController.config && this.originalBlockConfigs) {
        this.uiController.config.blockConfigs = { ...this.blockConfigs };

        if (this.uiController.originalBlockConfigs !== undefined) {
          this.uiController.originalBlockConfigs = { ...this.originalBlockConfigs };
        }

        if (this.uiController.uiRenderer && this.uiController.uiRenderer.config) {
          this.uiController.uiRenderer.config.blockConfigs = { ...this.blockConfigs };
        }
      }

      this.updateUIForLicenseChange();
    }
  }

  private updateUIForLicenseChange(): void {
    if (!this.uiController) {
      return;
    }

    const uiRenderer = this.uiController.uiRenderer;
    if (uiRenderer && typeof uiRenderer.updateLicenseStatus === 'function') {
      const currentTypesCount = Object.keys(this.blockConfigs).length;
      const licenseInfo = this.licenseService.getLicenseInfo(currentTypesCount);
      uiRenderer.updateLicenseStatus(licenseInfo);
    }
  }

  private async loadInitialBlocks(blocks: IBlockDto[]): Promise<void> {
    try {
      let allBlockTypes: string[] = [];
      const configBlockTypes = Object.keys(this.originalBlockConfigs || this.blockConfigs);

      allBlockTypes =
        configBlockTypes.length > 0
          ? configBlockTypes
          : [...new Set(blocks.map(block => block.type))];

      const allowedTypes = this.licenseService.getAllowedBlockTypes(allBlockTypes);
      const filteredBlocks = this.licenseService.filterBlocksByLicense(blocks, allowedTypes);

      for (const block of filteredBlocks) {
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

  private async reloadBlocksAfterLicenseChange(): Promise<void> {
    if (!this.uiController) {
      return;
    }

    try {
      const currentBlocks = await this.repository.getAll();

      const allBlocksMap = new Map<string, IBlockDto>();
      currentBlocks.forEach(block => allBlocksMap.set(block.id, block));
      if (this.originalInitialBlocks) {
        this.originalInitialBlocks.forEach(block => allBlocksMap.set(block.id, block));
      }
      const allBlocksToReload = Array.from(allBlocksMap.values());

      await this.repository.clear();

      if (allBlocksToReload.length > 0) {
        const blockConfigsKeys = Object.keys(this.originalBlockConfigs || this.blockConfigs);
        if (blockConfigsKeys.length === 0) {
          logger.warn(
            '⚠️ BlockBuilderFacade: Конфигурация блоков недоступна, используем типы из самих блоков'
          );
        }

        await this.loadInitialBlocks(allBlocksToReload);
      }

      await this.uiController.refreshBlocks();

      this.updateUIForLicenseChange();
    } catch (error) {
      logger.error('Ошибка перезагрузки блоков:', error);
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

  getLicenseInfo(): string {
    return this.licenseService.getLicense().getLicenseInfo();
  }

  isProLicense(): boolean {
    return this.licenseService.getLicense().isPro();
  }

  getRemainingBlockTypeSlots(): number {
    const currentCount = Object.keys(this.blockConfigs).length;
    return this.licenseService.getLicense().getRemainingBlockTypeSlots(currentCount);
  }

  getLicenseService(): LicenseService {
    return this.licenseService;
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

  showBlockTypeSelectionModal(position?: number): void {
    this.uiController?.showBlockTypeSelectionModal(position);
  }

  showAddBlockFormAtPosition(type: string, position?: number): void {
    this.uiController?.showAddBlockFormAtPosition(type, position);
  }

  showAddBlockForm(type: string): void {
    this.uiController?.showAddBlockForm(type);
  }

  editBlock(blockId: string): void {
    this.uiController?.editBlock(blockId);
  }

  async toggleBlockLock(blockId: string): Promise<void> {
    await this.uiController?.toggleBlockLock(blockId);
  }

  async toggleBlockVisibility(blockId: string): Promise<void> {
    await this.uiController?.toggleBlockVisibility(blockId);
  }

  async deleteBlockUI(blockId: string): Promise<void> {
    await this.uiController?.deleteBlockUI(blockId);
  }

  async duplicateBlockUI(blockId: string): Promise<void> {
    await this.uiController?.duplicateBlockUI(blockId);
  }

  async clearAllBlocksUI(): Promise<void> {
    await this.uiController?.clearAllBlocksUI();
  }

  async saveAllBlocksUI(): Promise<void> {
    await this.uiController?.saveAllBlocksUI();
  }

  async moveBlockUp(blockId: string): Promise<void> {
    await this.uiController?.moveBlockUp(blockId);
  }

  async moveBlockDown(blockId: string): Promise<void> {
    await this.uiController?.moveBlockDown(blockId);
  }

  async copyBlockId(blockId: string): Promise<void> {
    await this.uiController?.copyBlockId(blockId);
  }

  closeModal(): void {
    this.uiController?.closeModal();
  }

  submitModal(): void {
    this.uiController?.submitModal();
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

  setIsEdit(isEdit: boolean): void {
    this.isEdit = isEdit;
    if (this.uiController) {
      this.uiController.setIsEdit(isEdit);
    }
  }

  getIsEdit(): boolean {
    return this.isEdit;
  }

  destroy(): void {
    this.uiController?.destroy();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).blockBuilder;
  }
}
