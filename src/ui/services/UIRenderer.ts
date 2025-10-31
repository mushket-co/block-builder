/**
 * UIRenderer - отвечает только за рендеринг UI
 * Принцип единой ответственности (SRP)
 */

import { IBlockDto } from '../../core/types';
import { getBlockInlineStyles, watchBreakpointChanges } from '../../utils/breakpointHelpers';
import { ISpacingData } from '../../utils/spacingHelpers';
import { afterRender } from '../../utils/domReady';
import { EventDelegation } from '../EventDelegation';
import { initIcons } from '../icons/index';
import {
  copyIconHTML,
  arrowUpIconHTML,
  arrowDownIconHTML,
  editIconHTML,
  duplicateIconHTML,
  lockIconHTML,
  unlockIconHTML,
  eyeIconHTML,
  eyeOffIconHTML,
  deleteIconHTML,
  saveIconHTML
} from '../icons/iconHelpers';

export interface IUIRendererConfig {
  containerId: string;
  blockConfigs: Record<string, any>;
  componentRegistry: IComponentRegistry;
  eventDelegation?: EventDelegation;
  controlsContainerClass?: string;
  controlsFixedPosition?: 'top' | 'bottom';
  controlsOffset?: number;
  controlsOffsetVar?: string;
  license?: {
    isPro: boolean;
    maxBlockTypes: number;
    currentTypesCount: number;
  };
}

interface IComponentRegistry {
  get(name: string): any;
  has(name: string): boolean;
  getAll(): Record<string, any>;
}

export class UIRenderer {
  private config: IUIRendererConfig;
  private breakpointUnsubscribers: Map<string, () => void> = new Map();
  private eventDelegation: EventDelegation;

  constructor(config: IUIRendererConfig) {
    this.config = config;
    this.eventDelegation = config.eventDelegation || new EventDelegation();
  }

  /**
   * Получение props для пользовательского компонента (без служебного spacing)
   */
  private getUserComponentProps(props: Record<string, any>): Record<string, any> {
  if (!props) return {};

  // Исключаем spacing - это служебное поле для BlockBuilder
  const { spacing, ...userProps } = props;

  return userProps;
  }

  /**
   * Рендеринг основного UI контейнера
   */
  renderContainer(): void {
  // Инициализируем SVG sprite для иконок
  initIcons();

  const container = document.getElementById(this.config.containerId);
  if (!container) {
    return;
  }

  // Формируем классы для объединенного блока контролов и статистики
  const panelClass = `block-builder-controls${this.config.controlsFixedPosition ? ` block-builder-controls--fixed-${this.config.controlsFixedPosition}` : ''}`;
  const containerClass = this.config.controlsContainerClass || '';

  // Формируем инлайн стили для offset
  let inlineStyles = '';
  if (this.config.controlsFixedPosition) {
    const offset = this.config.controlsOffset || 0;
    const offsetVar = this.config.controlsOffsetVar;

    if (this.config.controlsFixedPosition === 'top') {
      if (offsetVar) {
        inlineStyles = `style="top: calc(var(${offsetVar}) + ${offset}px);"`;
      } else {
        inlineStyles = `style="top: ${offset}px;"`;
      }
    } else if (this.config.controlsFixedPosition === 'bottom') {
      if (offsetVar) {
        inlineStyles = `style="bottom: calc(var(${offsetVar}) + ${offset}px);"`;
      } else {
        inlineStyles = `style="bottom: ${offset}px;"`;
      }
    }
  }

  // Формируем классы для основного контейнера
  const positionClass = this.config.controlsFixedPosition === 'top' ? ' has-top-controls' : '';
  const bottomClass = this.config.controlsFixedPosition === 'bottom' ? ' has-bottom-controls' : '';
  const appClass = `block-builder-app${this.config.controlsFixedPosition ? ' has-fixed-controls' : ''}${positionClass}${bottomClass}`;

  const licenseBanner = this.renderLicenseBanner();

  container.innerHTML = `
    <div class="${appClass}">
      ${licenseBanner}
      <div class="${panelClass}" ${inlineStyles}>
        <div class="block-builder-controls-container${containerClass ? ` ${containerClass}` : ''}">
          <div class="block-builder-controls-inner">
            ${this.renderControlButtons()}
            <div class="block-builder-stats">
              <p>Всего блоков: <span id="blocks-count">0</span></p>
            </div>
            ${this.renderLicenseBadge()}
          </div>
        </div>
      </div>
      <div class="block-builder-blocks" id="block-builder-blocks"></div>
    </div>
  `;
  }

  /**
   * Рендеринг баннера о лицензии
   */
  private renderLicenseBanner(): string {
    const license = this.config.license;
    if (license && !license.isPro) {
      return `
        <div class="block-builder-license-banner">
          <div class="block-builder-license-banner__content">
            <span class="block-builder-license-banner__icon">⚠️</span>
            <span class="block-builder-license-banner__text">
              Вы используете бесплатную версию Block Builder.
              Доступно ${license.currentTypesCount} из ${license.maxBlockTypes} типов блоков.
            </span>
          </div>
        </div>
      `;
    }
    return '';
  }

  /**
   * Рендеринг кнопок управления
   */
  private renderControlButtons(): string {
  return `
    <button data-action="saveAllBlocksUI" class="block-builder-btn block-builder-btn--success">
      ${saveIconHTML} Сохранить
    </button>
    <button data-action="clearAllBlocksUI" class="block-builder-btn block-builder-btn--danger">
      ${deleteIconHTML} Очистить все
    </button>
  `;
  }

  /**
   * Рендеринг плашки со статусом лицензии
   */
  private renderLicenseBadge(): string {
    const license = this.config.license;
    if (!license) return '';

    if (license.isPro) {
      return `
        <div class="block-builder-license-badge block-builder-license-badge--pro" title="PRO лицензия - Без ограничений">
          <span class="block-builder-license-badge__icon">✓</span>
          <span class="block-builder-license-badge__text">PRO</span>
        </div>
      `;
    } else {
      return `
        <div class="block-builder-license-badge block-builder-license-badge--free" title="FREE лицензия - Ограничено ${license.maxBlockTypes} типами блоков">
          <span class="block-builder-license-badge__icon">ℹ</span>
          <span class="block-builder-license-badge__text">FREE</span>
        </div>
      `;
    }
  }

  /**
   * Обновление статуса лицензии в UI
   */
  updateLicenseStatus(licenseInfo: { isPro: boolean; maxBlockTypes: number; currentTypesCount: number }): void {
    this.config.license = licenseInfo;

    // Обновляем плашку лицензии
    const licenseBadge = this.renderLicenseBadge();
    const statsContainer = document.querySelector('.block-builder-controls-inner');
    if (statsContainer) {
      const existingBadge = statsContainer.querySelector('.block-builder-license-badge');
      if (existingBadge) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = licenseBadge.trim();
        const newBadge = tempDiv.firstChild;
        if (newBadge) {
          existingBadge.replaceWith(newBadge);
        }
      }
    }

    // Обновляем баннер
    const licenseBanner = this.renderLicenseBanner();
    const container = document.getElementById(this.config.containerId);
    if (container) {
      const existingBanner = container.querySelector('.block-builder-license-banner');
      if (existingBanner) {
        existingBanner.outerHTML = licenseBanner;
      } else if (licenseBanner && !licenseInfo.isPro) {
        // Добавляем баннер если его нет
        const controlsPanel = container.querySelector('.block-builder-controls');
        if (controlsPanel && controlsPanel.parentNode) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = licenseBanner;
          const bannerNode = tempDiv.firstChild;
          if (bannerNode) {
            controlsPanel.parentNode.insertBefore(bannerNode, controlsPanel);
          }
        }
      }
    }

    // Если активирована PRO лицензия - обновляем конфигурацию блоков
    if (licenseInfo.isPro) {
      // В pure-js через BlockBuilderFacade это обрабатывается через updateUIForLicenseChange
    }
  }

  /**
   * Рендеринг кнопки добавления блока
   */
  private renderAddBlockButton(position: number): string {
  return `
    <div class="block-builder-add-block-separator">
      <button
        data-action="showBlockTypeSelectionModal"
        data-args="[${position}]"
        class="block-builder-add-block-btn"
        title="Добавить блок"
      >
        <span class="block-builder-add-block-btn__icon">+</span>
        <span class="block-builder-add-block-btn__text">Добавить блок</span>
      </button>
    </div>
  `;
  }

  /**
   * Рендеринг списка блоков
   */
  renderBlocks(blocks: IBlockDto[]): void {
  const blocksContainer = document.getElementById('block-builder-blocks');
  const countElement = document.getElementById('blocks-count');

  if (!blocksContainer || !countElement) return;

  // Очищаем старые watchers перед перерендером
  this.cleanupBreakpointWatchers();

  // Обновляем счетчик
  countElement.textContent = blocks.length.toString();

  if (blocks.length === 0) {
    // Если блоков нет, показываем только одну кнопку добавления
    blocksContainer.innerHTML = `
      <div class="block-builder-empty-state">
        ${this.renderAddBlockButton(0)}
      </div>
    `;
    return;
  }

  // Рендерим блоки с кнопками добавления между ними
  const blocksHTML: string[] = [];

  // Кнопка перед первым блоком
  blocksHTML.push(this.renderAddBlockButton(0));

  // Блоки с кнопками после каждого
  blocks.forEach((block, index) => {
    blocksHTML.push(this.renderBlock(block, index, blocks.length));
    blocksHTML.push(this.renderAddBlockButton(index + 1));
  });

  blocksContainer.innerHTML = blocksHTML.join('');

  // Инициализируем custom блоки после рендеринга
  afterRender(() => {
    this.initializeCustomBlocks(blocks);
    // Настраиваем watchers для spacing после рендеринга DOM
    this.setupBreakpointWatchers(blocks);
  });
}

  /**
   * Рендеринг отдельного блока
   */
  private renderBlock(block: IBlockDto, index: number, totalBlocks: number): string {
  const config = this.config.blockConfigs[block.type];
  if (!config) return '';

  const blockContent = this.renderBlockContent(block, config);

  // Генерируем spacing стили из props.spacing
  // margin - напрямую, padding - через CSS переменные
  const spacingStylesObj = getBlockInlineStyles(block.props.spacing || {}, 'spacing');
  const styleAttr = Object.keys(spacingStylesObj).length > 0
    ? ` style="${this.objectToStyleString(spacingStylesObj)}"`
    : '';

  const controlsContainerClass = this.config.controlsContainerClass || '';

  return `
    <div class="block-builder-block ${block.locked ? 'locked' : ''} ${!block.visible ? 'hidden' : ''}" data-block-id="${block.id}"${styleAttr}>
      <!-- Поп-апчик с контролами -->
      <div class="block-builder-block-controls">
        <div class="block-builder-block-controls-container ${controlsContainerClass}">
          <div class="block-builder-block-controls-inner">
            ${this.renderBlockControls(block, index, totalBlocks)}
          </div>
        </div>
      </div>

      <!-- Содержимое блока -->
      <div class="block-builder-block-content">
        ${blockContent}
      </div>
    </div>
  `;
  }

  /**
   * Преобразование объекта стилей в строку
   */
  private objectToStyleString(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([key, value]) => {
      // Конвертируем camelCase в kebab-case для CSS свойств
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join('; ');
  }

  /**
   * Рендеринг элементов управления блока
   */
  private renderBlockControls(block: IBlockDto, index?: number, totalBlocks?: number): string {
  const lockIcon = block.locked ? unlockIconHTML : lockIconHTML;
  const visibilityIcon = block.visible ? eyeIconHTML : eyeOffIconHTML;

  // Определяем, должна ли быть кнопка вверх задизейблена (для первого блока)
  const isFirst = index === 0;
  const moveUpDisabled = isFirst ? ' disabled' : '';

  // Определяем, должна ли быть кнопка вниз задизейблена (для последнего блока)
  const isLast = totalBlocks && index !== undefined ? index === totalBlocks - 1 : false;
  const moveDownDisabled = isLast ? ' disabled' : '';

  return `
    <button data-action="copyBlockId" data-args='["${block.id}"]' class="block-builder-control-btn" title="Копировать ID: ${block.id}">${copyIconHTML}</button>
    <button data-action="moveBlockUp" data-args='["${block.id}"]' class="block-builder-control-btn" title="Переместить вверх"${moveUpDisabled}>${arrowUpIconHTML}</button>
    <button data-action="moveBlockDown" data-args='["${block.id}"]' class="block-builder-control-btn" title="Переместить вниз"${moveDownDisabled}>${arrowDownIconHTML}</button>
    <button data-action="editBlock" data-args='["${block.id}"]' class="block-builder-control-btn" title="Редактировать">${editIconHTML}</button>
    <button data-action="duplicateBlockUI" data-args='["${block.id}"]' class="block-builder-control-btn" title="Дублировать">${duplicateIconHTML}</button>
    <button data-action="toggleBlockLock" data-args='["${block.id}"]' class="block-builder-control-btn" title="${block.locked ? 'Разблокировать' : 'Заблокировать'}">${lockIcon}</button>
    <button data-action="toggleBlockVisibility" data-args='["${block.id}"]' class="block-builder-control-btn" title="${block.visible ? 'Скрыть' : 'Показать'}">${visibilityIcon}</button>
    <button data-action="deleteBlockUI" data-args='["${block.id}"]' class="block-builder-control-btn" title="Удалить">${deleteIconHTML}</button>
  `;
  }

  /**
   * Рендеринг содержимого блока
   */
  private renderBlockContent(block: IBlockDto, config: any): string {
  // Получаем props без служебного spacing
  const userProps = this.getUserComponentProps(block.props);

  // Если есть custom render с функцией mount
  if (config.render?.kind === 'custom' && config.render?.mount) {
    return this.renderCustomBlock(block);
  }

  // Если есть Vue компонент
  if (config.render?.kind === 'component' && config.render?.component) {
    return this.renderVueComponent(block, config);
  }

  // Если есть HTML шаблон в render
  if (config.render?.kind === 'html' && config.render?.template) {
    const template = config.render.template;
    return typeof template === 'function' ? template(userProps) : template;
  }

  // Fallback на старый формат template
  if (config.template) {
    return typeof config.template === 'function' ? config.template(userProps) : config.template;
  }

  // Fallback - простое отображение
  return `
    <div class="block-content-fallback">
      <strong>${config.title}</strong>
      <pre>${JSON.stringify(userProps, null, 2)}</pre>
    </div>
  `;
  }

  /**
   * Рендеринг Vue компонента
   */
  private renderVueComponent(block: IBlockDto, config: any): string {
  const componentId = `vue-component-${block.id}`;
  const componentName = config.render.component.name;
  const userProps = this.getUserComponentProps(block.props);

  // Создаем контейнер для Vue компонента
  const containerHTML = `
    <div id="${componentId}" class="vue-component-container">
      <!-- Vue компонент будет монтирован здесь -->
    </div>
  `;

  // Монтируем Vue компонент асинхронно
  setTimeout(() => {
    this.mountVueComponent(componentId, componentName, userProps);
  }, 0);

  return containerHTML;
  }

  /**
   * Монтирование Vue компонента
   */
  private mountVueComponent(containerId: string, componentName: string, props: Record<string, any>): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Проверяем, что Vue доступен
  if (typeof (window as any).Vue === 'undefined') {
    container.innerHTML = `<div class="vue-error">Vue не найден. Убедитесь, что Vue загружен.</div>`;
    return;
  }

  // Получаем компонент из реестра
  const component = this.config.componentRegistry.get(componentName);
  if (!component) {
    container.innerHTML = `<div class="vue-error">Компонент ${componentName} не найден</div>`;
    return;
  }

  try {
    // Создаем Vue приложение с компонентом
    const app = (window as any).Vue.createApp({
      components: {
        [componentName]: component
      },
      template: `<${componentName} v-bind="props" />`,
      data() {
        return {
          props: props
        };
      }
    });

    // Монтируем приложение
    app.mount(container);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    container.innerHTML = `<div class="vue-error">Ошибка рендеринга компонента: ${errorMessage}</div>`;
  }
  }

  /**
   * Рендеринг custom блока (с императивной функцией mount)
   */
  private renderCustomBlock(block: IBlockDto): string {
  const containerId = `custom-block-${block.id}`;
  return `<div id="${containerId}" class="custom-block-container" data-block-id="${block.id}"></div>`;
  }

  /**
   * Инициализация custom блоков после рендеринга
   */
  private initializeCustomBlocks(blocks: IBlockDto[]): void {
  blocks.forEach(block => {
    const config = this.config.blockConfigs[block.type];
    if (config?.render?.kind === 'custom' && config.render.mount) {
      const containerId = `custom-block-${block.id}`;
      const container = document.getElementById(containerId);

      if (container && !container.hasAttribute('data-custom-mounted')) {
        try {
          // Получаем props без служебного spacing
          const userProps = this.getUserComponentProps(block.props);

          // Вызываем функцию mount с контейнером и пропсами
          config.render.mount(container, userProps);
          container.setAttribute('data-custom-mounted', 'true');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          container.innerHTML = `<div style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px;">
            <strong>⚠️ Ошибка рендеринга:</strong><br>${errorMessage}
          </div>`;
        }
      }
    }
  });
  }

  /**
   * Настройка watchers для отслеживания брекпоинтов и обновления spacing
   */
  private setupBreakpointWatchers(blocks: IBlockDto[]): void {
  blocks.forEach(block => {
    const spacing = block.props?.spacing as ISpacingData | undefined;

    if (!spacing || Object.keys(spacing).length === 0) {
      return;
    }

    // Находим DOM элемент блока
    const element = document.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement;

    if (!element) {
      return;
    }

    // Отписываемся от старого watcher, если есть
    const oldUnsubscribe = this.breakpointUnsubscribers.get(block.id);
    if (oldUnsubscribe) {
      oldUnsubscribe();
    }

    // Получаем конфиг блока для определения breakpoints
    const blockConfig = this.config.blockConfigs[block.type];
    const breakpoints = blockConfig?.spacingOptions?.config?.breakpoints;

    // Настраиваем новый watcher
    const unsubscribe = watchBreakpointChanges(element, spacing, 'spacing', breakpoints);
    this.breakpointUnsubscribers.set(block.id, unsubscribe);
  });
  }

  /**
   * Очистка всех watchers
   */
  private cleanupBreakpointWatchers(): void {
  this.breakpointUnsubscribers.forEach(unsubscribe => unsubscribe());
  this.breakpointUnsubscribers.clear();
  }

  /**
   * Очистка watcher для конкретного блока
   */
  cleanupBlockWatcher(blockId: string): void {
  const unsubscribe = this.breakpointUnsubscribers.get(blockId);
  if (unsubscribe) {
    unsubscribe();
    this.breakpointUnsubscribers.delete(blockId);
  }
  }
}


