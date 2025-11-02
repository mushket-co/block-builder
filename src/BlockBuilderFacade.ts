/**
 * BlockBuilderFacade - фасад для работы с блочным конструктором
 * Применяем паттерн Facade для упрощения API
 * Принцип единой ответственности (SRP) - только делегирование вызовов
 *
 * ВАЖНО: Этот класс находится вне core/, так как он связывает все слои
 * (core, infrastructure, ui) и не является частью чистой бизнес-логики
 *
 * ✅ ЧИСТАЯ АРХИТЕКТУРА: Facade получает зависимости через DI,
 * их создание делегировано BlockBuilderFactory
 */

import { IBlockDto, ICreateBlockDto, IUpdateBlockDto } from './core/types';
import { IBlockRepository } from './core/ports/BlockRepository';
import { IComponentRegistry } from './core/ports/ComponentRegistry';
import { IHttpClient } from './core/ports/HttpClient';
import { BlockManagementUseCase } from './core/use-cases/BlockManagementUseCase';
import { ApiSelectUseCase } from './core/use-cases/ApiSelectUseCase';
import { ICustomFieldRenderer, ICustomFieldRendererRegistry } from './core/ports/CustomFieldRenderer';
import { BlockBuilderFactory } from './BlockBuilderFactory';
import { ILicenseConfig, TLicenseType } from './core/entities/License';
import { LicenseService } from './core/services/LicenseService';

export interface IBlockBuilderOptions {
  containerId?: string;
  blockConfigs: Record<string, any>;
  repository?: IBlockRepository;
  componentRegistry?: IComponentRegistry;
  httpClient?: IHttpClient;
  customFieldRendererRegistry?: ICustomFieldRendererRegistry;
  storageType?: 'memory' | 'localStorage';
  theme?: 'light' | 'dark';
  locale?: string;
  autoInit?: boolean;
  onSave?: (blocks: IBlockDto[]) => Promise<boolean> | boolean;
  initialBlocks?: IBlockDto[];
  controlsContainerClass?: string; // Кастомный CSS класс для контейнера контролов
  controlsFixedPosition?: 'top' | 'bottom'; // Фиксированная позиция для контролов (сверху или снизу)
  controlsOffset?: number; // Отступ от края в пикселях (по умолчанию 0)
  controlsOffsetVar?: string; // CSS переменная для учета высоты шапки/футера (например: '--header-height')
  license?: ILicenseConfig; // Конфигурация лицензии (по умолчанию FREE с 5 типами блоков)
}

/**
 * BlockBuilderFacade - главный класс библиотеки
 * Единственная точка входа для пользователей пакета
 */
export class BlockBuilderFacade {
  private useCase: BlockManagementUseCase;
  private repository: IBlockRepository;
  private componentRegistry: IComponentRegistry;
  private customFieldRendererRegistry: ICustomFieldRendererRegistry;
  private httpClient: IHttpClient;
  private apiSelectUseCase: ApiSelectUseCase;
  private blockConfigs: Record<string, any>;
  private originalBlockConfigs?: Record<string, any>;
  private licenseService: LicenseService;
  private uiController?: any; // Simplified to avoid complex type checking
  private onSave?: (blocks: IBlockDto[]) => Promise<boolean> | boolean;
  private controlsContainerClass?: string;
  private controlsFixedPosition?: 'top' | 'bottom';
  private controlsOffset?: number;
  private controlsOffsetVar?: string;
  private originalInitialBlocks?: IBlockDto[]; // Сохраняем исходные блоки для перезагрузки

  // Публичные настройки
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

  // Инициализация сервиса лицензии (по умолчанию FREE с 5 типами блоков)
  this.licenseService = new LicenseService(options.license);

  // Подписка на изменение лицензии для обновления UI
  this.licenseService.onLicenseChange(async () => {
    // При любом изменении лицензии (PRO↔FREE) перезагружаем конфигурацию блоков
    this.reloadLicenseConfiguration();
    // Перезагружаем все блоки с учетом новой лицензии
    await this.reloadBlocksAfterLicenseChange();
  });

  // ✅ ЧИСТАЯ АРХИТЕКТУРА: Используем Factory для компонирования зависимостей
  // Все Infrastructure реализации создаются в Factory, а не здесь
  const dependencies = BlockBuilderFactory.createDependencies({
    repository: options.repository,
    componentRegistry: options.componentRegistry,
    httpClient: options.httpClient,
    customFieldRendererRegistry: options.customFieldRendererRegistry,
    storageType: options.storageType,
  });

  this.repository = dependencies.repository;
  this.componentRegistry = dependencies.componentRegistry;
  this.customFieldRendererRegistry = dependencies.customFieldRendererRegistry;
  this.httpClient = dependencies.httpClient;
  this.useCase = dependencies.useCase;
  this.apiSelectUseCase = dependencies.apiSelectUseCase;

      // Регистрация компонентов из конфигурации
      this.registerComponentsFromConfig();

      // Сохраняем исходные initialBlocks для перезагрузки после активации PRO
      this.originalInitialBlocks = options.initialBlocks;

      // Асинхронная инициализация (загрузка блоков + UI)
      // Проверяем autoInit (по умолчанию true)
      if (options.autoInit !== false) {
          this.initialize(options.containerId, options.initialBlocks);
      }
  }

  /**
   * Асинхронная инициализация: загрузка начальных блоков и рендеринг UI
   * UI инициализируется автоматически, если передан containerId
   */
  private async initialize(containerId?: string, initialBlocks?: IBlockDto[]): Promise<void> {
      // Загрузка начальных блоков (если переданы)
      if (initialBlocks && initialBlocks.length > 0) {
          await this.loadInitialBlocks(initialBlocks);
      }

      // Автоматический рендеринг UI (если есть контейнер)
      if (containerId) {
          await this.initUI(containerId);
      }
  }

  /**
   * Инициализация UI контроллера
   */
  private async initUI(containerId: string): Promise<void> {
      // Dynamic import для lazy loading UI только при необходимости
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
          originalBlockConfigs: this.originalBlockConfigs
      });

      await this.uiController.init();
  }


  /**
   * Регистрирует компоненты из конфигурации блоков
   */
  private registerComponentsFromConfig(): void {
      // Сохраняем оригинальную конфигурацию (только если еще не сохранена)
      if (!this.originalBlockConfigs) {
          this.originalBlockConfigs = { ...this.blockConfigs };
      }

      const originalConfigs = this.originalBlockConfigs;

      // Используем LicenseService для определения разрешенных типов блоков
      const allBlockTypes = Object.keys(originalConfigs);
      const allowedTypes = this.licenseService.getAllowedBlockTypes(allBlockTypes);

      // Создаем конфигурацию только с разрешенными типами
      const limitedConfigs: Record<string, any> = {};
      allowedTypes.forEach(type => {
          if (originalConfigs[type]) {
              limitedConfigs[type] = originalConfigs[type];
          }
      });
      this.blockConfigs = limitedConfigs;

      const components: Record<string, any> = {};

      Object.entries(this.blockConfigs).forEach(([type, config]) => {
          if (config.render?.kind === 'component' && config.render?.component) {
              const componentName = config.render.component.name || type;
              components[componentName] = config.render.component;
          }
      });

      if (Object.keys(components).length > 0) {
          this.useCase.registerComponents(components);
      }
  }

  /**
   * Перезагружает конфигурацию лицензии после изменения типа
   * Используется после успешной активации PRO режима
   */
  private reloadLicenseConfiguration(): void {
      // Пересчитываем ограничения на основе новой лицензии
      this.registerComponentsFromConfig();

      // Обновляем UI контроллер если он уже инициализирован
      if (this.uiController) {
          // Обновляем конфигурацию блоков в UI контроллере
          if (this.uiController.config && this.originalBlockConfigs) {
              // Обновляем blockConfigs (текущие, с ограничениями)
              this.uiController.config.blockConfigs = { ...this.blockConfigs };

              // Обновляем originalBlockConfigs (полный список)
              if (this.uiController.originalBlockConfigs !== undefined) {
                  this.uiController.originalBlockConfigs = { ...this.originalBlockConfigs };
              }

              // Обновляем конфиг в UIRenderer
              if (this.uiController.uiRenderer && this.uiController.uiRenderer.config) {
                  this.uiController.uiRenderer.config.blockConfigs = { ...this.blockConfigs };
              }

          }

          this.updateUIForLicenseChange();
      }
  }

  /**
   * Обновление UI при изменении лицензии
   */
  private updateUIForLicenseChange(): void {
      if (!this.uiController) return;

      // Получаем uiRenderer из BlockUIController
      const uiRenderer = this.uiController.uiRenderer;
      if (uiRenderer && typeof uiRenderer.updateLicenseStatus === 'function') {
          const currentTypesCount = Object.keys(this.blockConfigs).length;
          const licenseInfo = this.licenseService.getLicenseInfo(currentTypesCount);
          uiRenderer.updateLicenseStatus(licenseInfo);
      }
  }


  /**
   * Загружает начальные блоки в репозиторий
   */
  private async loadInitialBlocks(blocks: IBlockDto[]): Promise<void> {
      try {
          // Получаем список типов блоков из конфигурации или из самих блоков
          let allBlockTypes: string[] = [];
          const configBlockTypes = Object.keys(this.originalBlockConfigs || this.blockConfigs);
          
          if (configBlockTypes.length > 0) {
              allBlockTypes = configBlockTypes;
          } else {
              // Fallback: получаем уникальные типы из самих блоков
              allBlockTypes = [...new Set(blocks.map(block => block.type))];
          }
          
          // Используем LicenseService для фильтрации блоков
          const allowedTypes = this.licenseService.getAllowedBlockTypes(allBlockTypes);
          const filteredBlocks = this.licenseService.filterBlocksByLicense(blocks, allowedTypes);

          for (const block of filteredBlocks) {

              // Нормализуем даты (они могут прийти как строки из JSON/localStorage)
              const normalizedBlock = {
                  ...block,
                  visible: block.visible !== undefined ? block.visible : true,
                  locked: block.locked !== undefined ? block.locked : false,
                  metadata: block.metadata ? {
                      ...block.metadata,
                      createdAt: block.metadata.createdAt instanceof Date
                          ? block.metadata.createdAt
                          : new Date(block.metadata.createdAt),
                      updatedAt: block.metadata.updatedAt instanceof Date
                          ? block.metadata.updatedAt
                          : new Date(block.metadata.updatedAt)
                  } : undefined
              };

              // Создаем блок с сохранением оригинального ID
              await this.repository.create(normalizedBlock as ICreateBlockDto & { id: string });
          }
      } catch (error) {
          // Пробрасываем ошибку дальше, чтобы пользователь мог обработать
          throw new Error(`Не удалось загрузить начальные блоки: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
  }

  /**
   * Перезагружает блоки при изменении лицензии (PRO↔FREE)
   * Сохраняет текущие блоки, фильтрует их по новой лицензии и перезагружает
   */
  private async reloadBlocksAfterLicenseChange(): Promise<void> {
      if (!this.uiController) return;

      try {
          // Получаем все текущие блоки из репозитория ДО очистки
          const currentBlocks = await this.repository.getAll();

          // Объединяем с originalInitialBlocks (которые были в props)
          const allBlocksMap = new Map<string, IBlockDto>();
          currentBlocks.forEach(block => allBlocksMap.set(block.id, block));
          if (this.originalInitialBlocks) {
              this.originalInitialBlocks.forEach(block => allBlocksMap.set(block.id, block));
          }
          const allBlocksToReload = Array.from(allBlocksMap.values());

          // Очищаем репозиторий
          await this.repository.clear();

          // Загружаем блоки с учетом новой лицензии
          // В loadInitialBlocks используется Object.keys(this.originalBlockConfigs || this.blockConfigs)
          // Но если конфигурация недоступна, используем типы из самих блоков
          if (allBlocksToReload.length > 0) {
              // Проверяем, что у нас есть конфигурация блоков
              const blockConfigsKeys = Object.keys(this.originalBlockConfigs || this.blockConfigs);
              if (blockConfigsKeys.length === 0) {
                  // Если конфигурация недоступна, используем типы из блоков
                  console.warn('⚠️ BlockBuilderFacade: Конфигурация блоков недоступна, используем типы из самих блоков');
              }
              
              await this.loadInitialBlocks(allBlocksToReload);
          }

          // Обновляем UI контроллер
          await this.uiController.refreshBlocks();

          // Обновляем статус лицензии в UI (баннер, badge и т.д.)
          this.updateUIForLicenseChange();
      } catch (error) {
          console.error('Ошибка перезагрузки блоков:', error);
      }
  }

  // ===== ПУБЛИЧНЫЙ API ДЛЯ РАБОТЫ С БЛОКАМИ =====

  /**
   * Создание блока
   */
  async createBlock(blockData: ICreateBlockDto): Promise<IBlockDto> {
      return this.useCase.createBlock(blockData);
  }

  /**
   * Получение блока по ID
   */
  async getBlock(blockId: string): Promise<IBlockDto | null> {
      return this.useCase.getBlock(blockId);
  }

  /**
   * Получение всех блоков
   */
  async getAllBlocks(): Promise<IBlockDto[]> {
      return this.useCase.getAllBlocks();
  }

  /**
   * Обновление блока
   */
  async updateBlock(blockId: string, updates: IUpdateBlockDto): Promise<IBlockDto | null> {
      return this.useCase.updateBlock(blockId, updates);
  }

  /**
   * Удаление блока
   */
  async deleteBlock(blockId: string): Promise<boolean> {
      return this.useCase.deleteBlock(blockId);
  }

  /**
   * Дублирование блока
   */
  async duplicateBlock(blockId: string): Promise<IBlockDto | null> {
      return this.useCase.duplicateBlock(blockId);
  }

  /**
   * Блокировка/разблокировка блока
   */
  async setBlockLocked(blockId: string, locked: boolean): Promise<IBlockDto | null> {
      return this.useCase.setBlockLocked(blockId, locked);
  }

  /**
   * Показ/скрытие блока
   */
  async setBlockVisible(blockId: string, visible: boolean): Promise<IBlockDto | null> {
      return this.useCase.setBlockVisible(blockId, visible);
  }

  /**
   * Получение блоков по типу
   */
  async getBlocksByType(type: string): Promise<IBlockDto[]> {
      return this.useCase.getBlocksByType(type);
  }

  /**
   * Переупорядочивание блоков
   */
  async reorderBlocks(blockIds: string[]): Promise<boolean> {
      return this.useCase.reorderBlocks(blockIds);
  }

  // ===== ПУБЛИЧНЫЙ API ДЛЯ РАБОТЫ С КОМПОНЕНТАМИ =====

  /**
   * Регистрация компонента
   */
  registerComponent(name: string, component: any): void {
      this.useCase.registerComponent(name, component);
  }

  /**
   * Получение компонента
   */
  getComponent(name: string): any | null {
      return this.useCase.getComponent(name);
  }

  /**
   * Проверка существования компонента
   */
  hasComponent(name: string): boolean {
      return this.useCase.hasComponent(name);
  }

  /**
   * Получение всех компонентов
   */
  getAllComponents(): Record<string, any> {
      return this.useCase.getAllComponents();
  }

  /**
   * Удаление компонента
   */
  unregisterComponent(name: string): boolean {
      return this.useCase.unregisterComponent(name);
  }

  /**
   * Массовая регистрация компонентов
   */
  registerComponents(components: Record<string, any>): void {
      this.useCase.registerComponents(components);
  }

  // ===== ПУБЛИЧНЫЙ API ДЛЯ VUE3 =====

  /**
   * Создание Vue3 блока
   */
  async createVueBlock(
      type: string,
      componentName: string,
      componentProps: Record<string, any> = {},
      settings: Record<string, any> = {}
  ): Promise<IBlockDto> {
      return this.useCase.createVueBlock(type, componentName, componentProps, settings);
  }

  /**
   * Обновление Vue3 компонента блока
   */
  async updateVueComponent(
      blockId: string,
      componentName: string,
      componentProps: Record<string, any>
  ): Promise<IBlockDto | null> {
      return this.useCase.updateVueComponent(blockId, componentName, componentProps);
  }

  // ===== УТИЛИТЫ =====

  /**
   * Получение конфигурации блоков
   */
  getBlockConfigs(): Record<string, any> {
      return { ...this.blockConfigs };
  }

  /**
   * Получение конфигурации конкретного блока
   */
  getBlockConfig(type: string): any {
      return this.blockConfigs[type];
  }

  /**
   * Проверка существования типа блока
   */
  hasBlockType(type: string): boolean {
      return type in this.blockConfigs;
  }

  /**
   * Получение списка доступных типов блоков
   */
  getAvailableBlockTypes(): string[] {
      return Object.keys(this.blockConfigs);
  }

  /**
   * Получение информации о лицензии
   */
  getLicenseInfo(): string {
      return this.licenseService.getLicense().getLicenseInfo();
  }

  /**
   * Проверка является ли лицензия PRO
   */
  isProLicense(): boolean {
      return this.licenseService.getLicense().isPro();
  }

  /**
   * Получить оставшееся количество слотов для типов блоков
   */
  getRemainingBlockTypeSlots(): number {
      const currentCount = Object.keys(this.blockConfigs).length;
      return this.licenseService.getLicense().getRemainingBlockTypeSlots(currentCount);
  }

  /**
   * Получить сервис лицензии (для передачи в UI компоненты)
   */
  getLicenseService(): LicenseService {
      return this.licenseService;
  }


  /**
   * Очистка всех блоков
   */
  async clearAllBlocks(): Promise<void> {
      return this.useCase.clearAllBlocks();
  }

  /**
   * Получение количества блоков
   */
  async getBlocksCount(): Promise<number> {
      const blocks = await this.useCase.getAllBlocks();
      return blocks.length;
  }

  /**
   * Экспорт блоков в JSON
   */
  async exportBlocks(): Promise<string> {
      const blocks = await this.getAllBlocks();
      return JSON.stringify(blocks, null, 2);
  }

  /**
   * Импорт блоков из JSON
   */
  async importBlocks(jsonData: string): Promise<boolean> {
      try {
          const blocks = JSON.parse(jsonData);
          if (!Array.isArray(blocks)) return false;

          await this.clearAllBlocks();

          for (const block of blocks) {
              await this.createBlock(block);
          }

          return true;
      } catch (error) {
          return false;
      }
  }

  // ===== UI МЕТОДЫ (делегируем UI контроллеру) =====

  /**
   * Показать модалку выбора типа блока
   */
  showBlockTypeSelectionModal(position?: number): void {
      this.uiController?.showBlockTypeSelectionModal(position);
  }

  /**
   * Показать форму добавления блока на определенной позиции
   */
  showAddBlockFormAtPosition(type: string, position?: number): void {
      this.uiController?.showAddBlockFormAtPosition(type, position);
  }

  /**
   * Показать форму добавления блока
   */
  showAddBlockForm(type: string): void {
      this.uiController?.showAddBlockForm(type);
  }

  /**
   * Редактирование блока
   */
  editBlock(blockId: string): void {
      this.uiController?.editBlock(blockId);
  }

  /**
   * Переключение блокировки блока
   */
  async toggleBlockLock(blockId: string): Promise<void> {
      await this.uiController?.toggleBlockLock(blockId);
  }

  /**
   * Переключение видимости блока
   */
  async toggleBlockVisibility(blockId: string): Promise<void> {
      await this.uiController?.toggleBlockVisibility(blockId);
  }

  /**
   * UI: Удаление блока
   */
  async deleteBlockUI(blockId: string): Promise<void> {
      await this.uiController?.deleteBlockUI(blockId);
  }

  /**
   * UI: Дублирование блока
   */
  async duplicateBlockUI(blockId: string): Promise<void> {
      await this.uiController?.duplicateBlockUI(blockId);
  }

  /**
   * UI: Очистка всех блоков
   */
  async clearAllBlocksUI(): Promise<void> {
      await this.uiController?.clearAllBlocksUI();
  }

  /**
   * UI: Сохранение всех блоков
   */
  async saveAllBlocksUI(): Promise<void> {
      await this.uiController?.saveAllBlocksUI();
  }

  /**
   * Перемещение блока вверх
   */
  async moveBlockUp(blockId: string): Promise<void> {
      await this.uiController?.moveBlockUp(blockId);
  }

  /**
   * Перемещение блока вниз
   */
  async moveBlockDown(blockId: string): Promise<void> {
      await this.uiController?.moveBlockDown(blockId);
  }

  /**
   * Копирование ID блока в буфер обмена
   */
  async copyBlockId(blockId: string): Promise<void> {
      await this.uiController?.copyBlockId(blockId);
  }

  /**
   * Закрытие модального окна
   */
  closeModal(): void {
      this.uiController?.closeModal();
  }

  /**
   * Submit модального окна
   */
  submitModal(): void {
      this.uiController?.submitModal();
  }

  // ===== ПУБЛИЧНЫЙ API ДЛЯ РАБОТЫ С КАСТОМНЫМИ ПОЛЯМИ =====

  /**
   * Регистрация кастомного рендерера поля
   * @param renderer - Рендерер кастомного поля
   */
  registerCustomFieldRenderer(renderer: ICustomFieldRenderer): void {
      this.customFieldRendererRegistry.register(renderer);
  }

  /**
   * Массовая регистрация кастомных рендереров
   * @param renderers - Массив рендереров
   */
  registerCustomFieldRenderers(renderers: ICustomFieldRenderer[]): void {
      renderers.forEach(renderer => {
          this.customFieldRendererRegistry.register(renderer);
      });
  }

  /**
   * Получение кастомного рендерера по ID
   * @param id - ID рендерера
   */
  getCustomFieldRenderer(id: string): ICustomFieldRenderer | null {
      return this.customFieldRendererRegistry.get(id);
  }

  /**
   * Проверка существования кастомного рендерера
   * @param id - ID рендерера
   */
  hasCustomFieldRenderer(id: string): boolean {
      return this.customFieldRendererRegistry.has(id);
  }

  /**
   * Удаление кастомного рендерера
   * @param id - ID рендерера
   */
  unregisterCustomFieldRenderer(id: string): boolean {
      return this.customFieldRendererRegistry.unregister(id);
  }

  /**
   * Получение всех кастомных рендереров
   */
  getAllCustomFieldRenderers(): Map<string, ICustomFieldRenderer> {
      return this.customFieldRendererRegistry.getAll();
  }

  // ===== УТИЛИТЫ =====

  /**
   * Очистка ресурсов
   */
  destroy(): void {
      this.uiController?.destroy();
      delete (window as any).blockBuilder;
  }
}

