import { IBlockDto } from '../../core/types';
import { getBlockInlineStyles, watchBreakpointChanges } from '../../utils/breakpointHelpers';
import { ISpacingData } from '../../utils/spacingHelpers';
import { afterRender } from '../../utils/domReady';
import { EventDelegation } from '../EventDelegation';
import { initIcons } from '../icons/index';
import { CSS_CLASSES } from '../../utils/constants';
import {
  copyIconHTML,
  arrowUpIconHTML,
  arrowDownIconHTML,
  editIconHTML,
  duplicateIconHTML,
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
  isEdit?: boolean;
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
  private isEdit: boolean;
  private vueApps: Map<string, any> = new Map();

  constructor(config: IUIRendererConfig) {
    this.config = config;
    this.eventDelegation = config.eventDelegation || new EventDelegation();
    this.isEdit = config.isEdit !== undefined ? config.isEdit : true;
  }

    private getUserComponentProps(props: Record<string, any>): Record<string, any> {
  if (!props) return {};

  const { spacing, ...userProps } = props;

  return userProps;
  }

  renderContainer(): void {
  initIcons();

  const container = document.getElementById(this.config.containerId);
  if (!container) {
    return;
  }

  const panelClass = `block-builder-controls${this.config.controlsFixedPosition ? ` block-builder-controls--fixed-${this.config.controlsFixedPosition}` : ''}`;
  const containerClass = this.config.controlsContainerClass || '';

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

  const positionClass = this.config.controlsFixedPosition === 'top' ? ' has-top-controls' : '';
  const bottomClass = this.config.controlsFixedPosition === 'bottom' ? ' has-bottom-controls' : '';
  const appClass = `block-builder block-builder-app${this.config.controlsFixedPosition ? ' has-fixed-controls' : ''}${positionClass}${bottomClass}`;

  if (this.isEdit) {
    document.body.classList.add('bb-is-edit-mode');
  } else {
    document.body.classList.remove('bb-is-edit-mode');
  }

  const licenseBanner = this.renderLicenseBanner();
  const controlsHTML = this.isEdit ? `
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
  ` : '';

  container.innerHTML = `
    <div class="${appClass}">
      ${licenseBanner}
      ${controlsHTML}
      <div class="block-builder-blocks" id="block-builder-blocks"></div>
    </div>
  `;
  }

  private renderLicenseBanner(): string {
    const license = this.config.license;
    if (license && !license.isPro) {
      return `
        <div class="block-builder-license-banner">
          <div class="block-builder-license-banner__content">
            <span class="block-builder-license-banner__icon">⚠️</span>
            <span class="block-builder-license-banner__text">
              Вы используете бесплатную версию <a href="https://block-builder.ru/" target="_blank" rel="noopener noreferrer" class="bb-link-inherit">Block Builder</a>.
              Доступно ${license.currentTypesCount} из ${license.maxBlockTypes} типов блоков.
            </span>
          </div>
        </div>
      `;
    }
    return '';
  }

  private renderControlButtons(): string {
    if (!this.isEdit) {
      return '';
    }
    return `
    <button data-action="saveAllBlocksUI" class="block-builder-btn block-builder-btn--success">
      ${saveIconHTML} Сохранить
    </button>
    <button data-action="clearAllBlocksUI" class="block-builder-btn block-builder-btn--danger">
      ${deleteIconHTML} Очистить все
    </button>
  `;
  }

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

    updateEditMode(isEdit: boolean): void {
    this.isEdit = isEdit;
    this.config.isEdit = isEdit;
    if (isEdit) {
      document.body.classList.add('bb-is-edit-mode');
    } else {
      document.body.classList.remove('bb-is-edit-mode');
    }
    this.updateControlsPanel();
  }

    private updateControlsPanel(): void {
    const container = document.getElementById(this.config.containerId);
    if (!container) return;

    const appContainer = container.querySelector('.block-builder-app');
    if (!appContainer) return;

    const existingControls = appContainer.querySelector('.block-builder-controls');

    const panelClass = `block-builder-controls${this.config.controlsFixedPosition ? ` block-builder-controls--fixed-${this.config.controlsFixedPosition}` : ''}`;
    const containerClass = this.config.controlsContainerClass || '';

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

    const controlsHTML = this.isEdit ? `
      <div class="${panelClass}" ${inlineStyles}>
        <div class="block-builder-controls-container${containerClass ? ` ${containerClass}` : ''}">
          <div class="block-builder-controls-inner">
            ${this.renderControlButtons()}
            <div class="block-builder-stats">
              <p>Всего блоков: <span id="blocks-count">${document.getElementById('blocks-count')?.textContent || '0'}</span></p>
            </div>
            ${this.renderLicenseBadge()}
          </div>
        </div>
      </div>
    ` : '';

    if (existingControls) {
      if (controlsHTML) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = controlsHTML.trim();
        const newControls = tempDiv.firstChild;
        if (newControls) {
          existingControls.replaceWith(newControls);
        }
      } else {
        existingControls.remove();
      }
    } else if (controlsHTML) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = controlsHTML.trim();
      const newControls = tempDiv.firstChild;
      if (newControls) {
        const blocksContainer = appContainer.querySelector('.block-builder-blocks');
        if (blocksContainer) {
          appContainer.insertBefore(newControls, blocksContainer);
        } else {
          appContainer.appendChild(newControls);
        }
      }
    }
  }

    updateLicenseStatus(licenseInfo: { isPro: boolean; maxBlockTypes: number; currentTypesCount: number }): void {
    this.config.license = licenseInfo;
    if (this.config.isEdit !== undefined) {
      this.updateEditMode(this.config.isEdit);
    }

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

    const licenseBanner = this.renderLicenseBanner();
    const container = document.getElementById(this.config.containerId);
    if (container) {
      const appContainer = container.querySelector('.block-builder-app') || container;
      const existingBanner = appContainer.querySelector('.block-builder-license-banner');

      if (!licenseInfo.isPro && licenseBanner) {
        if (existingBanner) {
          existingBanner.outerHTML = licenseBanner;
        } else {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = licenseBanner.trim();
          const bannerNode = tempDiv.firstChild;

          if (bannerNode) {
            if (appContainer.firstChild) {
              appContainer.insertBefore(bannerNode, appContainer.firstChild);
            } else {
              appContainer.appendChild(bannerNode);
            }
          }
        }
      } else if (licenseInfo.isPro && existingBanner) {
        existingBanner.remove();
      }
    }

    if (licenseInfo.isPro) {
    }
  }

  private renderAddBlockButton(position: number): string {
    if (!this.isEdit) {
      return '';
    }
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

  renderBlocks(blocks: IBlockDto[]): void {
  const blocksContainer = document.getElementById('block-builder-blocks');
  const countElement = document.getElementById('blocks-count');

  if (!blocksContainer) return;

  this.cleanupBreakpointWatchers();

  const blocksToRender = this.isEdit
    ? blocks
    : blocks.filter(block => block.visible !== false);

  if (countElement) {
    countElement.textContent = blocksToRender.length.toString();
  }

  if (blocksToRender.length === 0) {
    blocksContainer.innerHTML = `
      <div class="block-builder-empty-state">
        ${this.renderAddBlockButton(0)}
      </div>
    `;
    return;
  }

  const blocksHTML: string[] = [];

  blocksHTML.push(this.renderAddBlockButton(0));

  blocksToRender.forEach((block, index) => {
    blocksHTML.push(this.renderBlock(block, index, blocksToRender.length));
    blocksHTML.push(this.renderAddBlockButton(index + 1));
  });

  blocksContainer.innerHTML = blocksHTML.join('');

  afterRender(() => {
    this.initializeCustomBlocks(blocksToRender);
    this.setupBreakpointWatchers(blocksToRender);
  });
}

  private renderBlock(block: IBlockDto, index: number, totalBlocks: number): string {
  const config = this.config.blockConfigs[block.type];
  if (!config) return '';

  const blockContent = this.renderBlockContent(block, config);

  const spacingStylesObj = getBlockInlineStyles(block.props.spacing || {}, 'spacing');
  const styleAttr = Object.keys(spacingStylesObj).length > 0
    ? ` style="${this.objectToStyleString(spacingStylesObj)}"`
    : '';

  const controlsContainerClass = this.config.controlsContainerClass || '';
  const blockControlsHTML = this.isEdit ? `
      <!-- Поп-апчик с контролами -->
      <div class="block-builder-block-controls">
        <div class="block-builder-block-controls-container ${controlsContainerClass}">
          <div class="block-builder-block-controls-inner">
            ${this.renderBlockControls(block, index, totalBlocks)}
          </div>
        </div>
      </div>
  ` : '';

  return `
    <div class="block-builder-block ${!block.visible ? CSS_CLASSES.HIDDEN : ''}" data-block-id="${block.id}"${styleAttr}>
      ${blockControlsHTML}

      <!-- Содержимое блока -->
      <div class="block-builder-block-content">
        ${blockContent}
      </div>
    </div>
  `;
  }

  private objectToStyleString(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join('; ');
  }

  private renderBlockControls(block: IBlockDto, index?: number, totalBlocks?: number): string {
    if (!this.isEdit) {
      return `
        <button data-action="copyBlockId" data-args='["${block.id}"]' class="block-builder-control-btn" title="Копировать ID: ${block.id}">${copyIconHTML}</button>
      `;
    }

    const visibilityIcon = block.visible ? eyeIconHTML : eyeOffIconHTML;

    const isFirst = index === 0;
    const moveUpDisabled = isFirst ? ' disabled' : '';

    const isLast = totalBlocks && index !== undefined ? index === totalBlocks - 1 : false;
    const moveDownDisabled = isLast ? ' disabled' : '';

    return `
      <button data-action="copyBlockId" data-args='["${block.id}"]' class="block-builder-control-btn" title="Копировать ID: ${block.id}">${copyIconHTML}</button>
      <button data-action="moveBlockUp" data-args='["${block.id}"]' class="block-builder-control-btn" title="Переместить вверх"${moveUpDisabled}>${arrowUpIconHTML}</button>
      <button data-action="moveBlockDown" data-args='["${block.id}"]' class="block-builder-control-btn" title="Переместить вниз"${moveDownDisabled}>${arrowDownIconHTML}</button>
      <button data-action="editBlock" data-args='["${block.id}"]' class="block-builder-control-btn" title="Редактировать">${editIconHTML}</button>
      <button data-action="duplicateBlockUI" data-args='["${block.id}"]' class="block-builder-control-btn" title="Дублировать">${duplicateIconHTML}</button>
      <button data-action="toggleBlockVisibility" data-args='["${block.id}"]' class="block-builder-control-btn" title="${block.visible ? 'Скрыть' : 'Показать'}">${visibilityIcon}</button>
      <button data-action="deleteBlockUI" data-args='["${block.id}"]' class="block-builder-control-btn" title="Удалить">${deleteIconHTML}</button>
    `;
  }

  private renderBlockContent(block: IBlockDto, config: any): string {
  const userProps = this.getUserComponentProps(block.props);

  if (config.render?.kind === 'custom' && config.render?.mount) {
    return this.renderCustomBlock(block);
  }

  if (config.render?.kind === 'component' && config.render?.component) {
    return this.renderVueComponent(block, config);
  }

  if (config.render?.kind === 'html' && config.render?.template) {
    const template = config.render.template;
    return typeof template === 'function' ? template(userProps) : template;
  }

  if (config.template) {
    return typeof config.template === 'function' ? config.template(userProps) : config.template;
  }

  const escapedTitle = this.escapeHtml(config.title || '');
  const escapedProps = this.escapeHtml(JSON.stringify(userProps, null, 2));
  return `
    <div class="block-content-fallback">
      <strong>${escapedTitle}</strong>
      <pre>${escapedProps}</pre>
    </div>
  `;
  }

  private escapeHtml(text: string | number | null | undefined): string {
    if (text === null || text === undefined) {
      return '';
    }
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  private renderVueComponent(block: IBlockDto, config: any): string {
  const componentId = `vue-component-${block.id}`;
  const componentName = config.render.component.name;
  const userProps = this.getUserComponentProps(block.props);

  const containerHTML = `
    <div id="${componentId}" class="vue-component-container">
      <!-- Vue компонент будет монтирован здесь -->
    </div>
  `;

  setTimeout(() => {
    this.mountVueComponent(componentId, componentName, userProps);
  }, 0);

  return containerHTML;
  }

  /**
   * Монтирование Vue компонента
   * Используется только в pure-js версии, когда пользователь хочет использовать Vue компоненты в блоках
   * Vue версия пакета рендерит компоненты напрямую через Vue, без этого метода
   */
  private mountVueComponent(containerId: string, componentName: string, props: Record<string, any>): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  this.unmountVueComponent(containerId);

  if (typeof (window as any).Vue === 'undefined') {
    container.textContent = 'Vue не найден. Убедитесь, что Vue загружен.';
    return;
  }

  const component = this.config.componentRegistry.get(componentName);
  if (!component) {
    container.textContent = `Компонент ${componentName} не найден`;
    return;
  }

  try {
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

    app.mount(container);

    this.vueApps.set(containerId, app);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    container.textContent = `Ошибка рендеринга компонента: ${errorMessage}`;
  }
  }

    private unmountVueComponent(containerId: string): void {
    const app = this.vueApps.get(containerId);
    if (app) {
      try {
        app.unmount();
      } catch (error) {
        console.warn(`Ошибка при удалении Vue приложения ${containerId}:`, error);
      }
      this.vueApps.delete(containerId);
    }
  }

  private renderCustomBlock(block: IBlockDto): string {
  const containerId = `custom-block-${block.id}`;
  return `<div id="${containerId}" class="custom-block-container" data-block-id="${block.id}"></div>`;
  }

    private initializeCustomBlocks(blocks: IBlockDto[]): void {
  blocks.forEach(block => {
    const config = this.config.blockConfigs[block.type];
    if (config?.render?.kind === 'custom' && config.render.mount) {
      const containerId = `custom-block-${block.id}`;
      const container = document.getElementById(containerId);

      if (container && !container.hasAttribute('data-custom-mounted')) {
        try {
          const userProps = this.getUserComponentProps(block.props);

          config.render.mount(container, userProps);
          container.setAttribute('data-custom-mounted', 'true');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          container.innerHTML = `<div class="bb-error-box">
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

    const element = document.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement;

    if (!element) {
      return;
    }

    const oldUnsubscribe = this.breakpointUnsubscribers.get(block.id);
    if (oldUnsubscribe) {
      oldUnsubscribe();
    }

    const blockConfig = this.config.blockConfigs[block.type];
    const breakpoints = blockConfig?.spacingOptions?.config?.breakpoints;

    const unsubscribe = watchBreakpointChanges(element, spacing, 'spacing', breakpoints);
    this.breakpointUnsubscribers.set(block.id, unsubscribe);
  });
  }

    private cleanupBreakpointWatchers(): void {
  this.breakpointUnsubscribers.forEach(unsubscribe => unsubscribe());
  this.breakpointUnsubscribers.clear();
  this.vueApps.forEach((app, containerId) => {
    this.unmountVueComponent(containerId);
  });
  this.vueApps.clear();
  }

    cleanupBlockWatcher(blockId: string): void {
  const unsubscribe = this.breakpointUnsubscribers.get(blockId);
  if (unsubscribe) {
    unsubscribe();
    this.breakpointUnsubscribers.delete(blockId);
  }
  this.cleanupBlockVueApp(blockId);
  }

    destroy(): void {
    document.body.classList.remove('bb-is-edit-mode');
    this.cleanupBreakpointWatchers();
    this.vueApps.forEach((app, containerId) => {
      this.unmountVueComponent(containerId);
    });
    this.vueApps.clear();
  }

    cleanupBlockVueApp(blockId: string): void {
    const containerId = `vue-component-${blockId}`;
    this.unmountVueComponent(containerId);
  }
}


