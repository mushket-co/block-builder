import { IBlockDto } from '../../core/types';
import { TRenderRef } from '../../core/types/common';
import { IBreakpoint } from '../../core/types/form';
import { filterBlocksForDisplay } from '../../utils/blockHelpers';
import { getBlockInlineStyles, watchBreakpointChanges } from '../../utils/breakpointHelpers';
import { CSS_CLASSES } from '../../utils/constants';
import { afterRender } from '../../utils/scheduling';
import { getScrollContainer, getBlocksLayoutRoot, restoreScrollPosition, stopOngoingScroll } from '../../utils/scrollHelpers';
import { blockScrollService } from '../../shared/services/BlockScrollService';
import { ISpacingData } from '../../utils/spacingHelpers';
import { EventDelegation } from '../EventDelegation';
import {
  arrowDownIconHTML,
  arrowUpIconHTML,
  copyIconHTML,
  deleteIconHTML,
  duplicateIconHTML,
  editIconHTML,
  eyeIconHTML,
  eyeOffIconHTML,
  saveIconHTML,
} from '../../shared/icons/iconHelpers';
import { initIcons } from '../../shared/icons/index';

export interface IUIRendererConfig {
  containerId: string;
  blockConfigs: Record<
    string,
    { fields?: unknown[]; spacingOptions?: unknown; [key: string]: unknown }
  >;
  componentRegistry: IComponentRegistry;
  eventDelegation?: EventDelegation;
  controlsContainerClass?: string;
  controlsFixedPosition?: 'top' | 'bottom';
  controlsOffset?: number;
  controlsOffsetVar?: string;
  isEdit?: boolean;
}

interface IComponentRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(name: string): any;
  has(name: string): boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAll(): Record<string, any>;
}

export interface IRenderBlocksOptions {
  scrollToBlock?: {
    blockId: string;
    offsetTop?: number;
    offsetBottom?: number;
    behavior?: ScrollBehavior;
  };
}

export class UIRenderer {
  private config: IUIRendererConfig;
  private breakpointUnsubscribers: Map<string, () => void> = new Map();
  private eventDelegation: EventDelegation;
  private isEdit: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private vueApps: Map<string, any> = new Map();

  constructor(config: IUIRendererConfig) {
    this.config = config;
    this.eventDelegation = config.eventDelegation || new EventDelegation();
    this.isEdit = config.isEdit !== undefined ? config.isEdit : true;
  }

  private getUserComponentProps(props: Record<string, unknown>): Record<string, unknown> {
    if (!props) {
      return {};
    }

    const { spacing: _spacing, ...userProps } = props;

    return userProps;
  }

  renderContainer(): void {
    initIcons();

    const container = document.querySelector(`#${this.config.containerId}`);
    if (!container) {
      return;
    }

    const fixedClass = this.config.controlsFixedPosition
      ? this.config.controlsFixedPosition === 'top'
        ? CSS_CLASSES.CONTROLS_FIXED_TOP
        : CSS_CLASSES.CONTROLS_FIXED_BOTTOM
      : '';
    const panelClass = `${CSS_CLASSES.CONTROLS}${fixedClass ? ` ${fixedClass}` : ''}`;
    const containerClass = this.config.controlsContainerClass || '';

    let inlineStyles = '';
    if (this.config.controlsFixedPosition) {
      const offset = this.config.controlsOffset || 0;
      const offsetVar = this.config.controlsOffsetVar;

      if (this.config.controlsFixedPosition === 'top') {
        inlineStyles = offsetVar
          ? `style="top: calc(var(${offsetVar}) + ${offset}px);"`
          : `style="top: ${offset}px;"`;
      } else if (this.config.controlsFixedPosition === 'bottom') {
        inlineStyles = offsetVar
          ? `style="bottom: calc(var(${offsetVar}) + ${offset}px);"`
          : `style="bottom: ${offset}px;"`;
      }
    }

    const positionClass =
      this.config.controlsFixedPosition === 'top' ? ` ${CSS_CLASSES.HAS_TOP_CONTROLS}` : '';
    const bottomClass =
      this.config.controlsFixedPosition === 'bottom' ? ` ${CSS_CLASSES.HAS_BOTTOM_CONTROLS}` : '';
    const fixedControlsClass = this.config.controlsFixedPosition
      ? ` ${CSS_CLASSES.HAS_FIXED_CONTROLS}`
      : '';
    const appClass = `${CSS_CLASSES.BLOCK_BUILDER} ${CSS_CLASSES.APP}${fixedControlsClass}${positionClass}${bottomClass}`;

    if (this.isEdit) {
      document.body.classList.add(CSS_CLASSES.BB_IS_EDIT_MODE);
    } else {
      document.body.classList.remove(CSS_CLASSES.BB_IS_EDIT_MODE);
    }

    const controlsHTML = this.isEdit
      ? `
      <div class="${panelClass}" ${inlineStyles}>
        <div class="${CSS_CLASSES.CONTROLS_CONTAINER}${containerClass ? ` ${containerClass}` : ''}">
          <div class="${CSS_CLASSES.CONTROLS_INNER}">
            ${this.renderControlButtons()}
            <div class="${CSS_CLASSES.STATS}">
              <span>Всего блоков: <span id="blocks-count">0</span></span>
            </div>
          </div>
        </div>
      </div>
  `
      : '';

    container.innerHTML = `
    <div class="${appClass}">
      ${controlsHTML}
      <div class="${CSS_CLASSES.BLOCKS}" id="block-builder-blocks"></div>
    </div>
  `;
  }

  private renderControlButtons(): string {
    if (!this.isEdit) {
      return '';
    }
    return `
    <button data-action="saveAllBlocksUI" class="${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_SUCCESS}">
      ${saveIconHTML} Сохранить
    </button>
    <button data-action="clearAllBlocksUI" class="${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_DANGER}">
      ${deleteIconHTML} Очистить все
    </button>
  `;
  }

  updateEditMode(isEdit: boolean): void {
    this.isEdit = isEdit;
    this.config.isEdit = isEdit;
    if (isEdit) {
      document.body.classList.add(CSS_CLASSES.BB_IS_EDIT_MODE);
    } else {
      document.body.classList.remove(CSS_CLASSES.BB_IS_EDIT_MODE);
    }
    this.updateControlsPanel();
  }

  private updateControlsPanel(): void {
    const container = document.querySelector(`#${this.config.containerId}`);
    if (!container) {
      return;
    }

    const appContainer = container.querySelector(`.${CSS_CLASSES.APP}`);
    if (!appContainer) {
      return;
    }

    const existingControls = appContainer.querySelector(`.${CSS_CLASSES.CONTROLS}`);

    const fixedClass = this.config.controlsFixedPosition
      ? this.config.controlsFixedPosition === 'top'
        ? CSS_CLASSES.CONTROLS_FIXED_TOP
        : CSS_CLASSES.CONTROLS_FIXED_BOTTOM
      : '';
    const panelClass = `${CSS_CLASSES.CONTROLS}${fixedClass ? ` ${fixedClass}` : ''}`;
    const containerClass = this.config.controlsContainerClass || '';

    let inlineStyles = '';
    if (this.config.controlsFixedPosition) {
      const offset = this.config.controlsOffset || 0;
      const offsetVar = this.config.controlsOffsetVar;

      if (this.config.controlsFixedPosition === 'top') {
        inlineStyles = offsetVar
          ? `style="top: calc(var(${offsetVar}) + ${offset}px);"`
          : `style="top: ${offset}px;"`;
      } else if (this.config.controlsFixedPosition === 'bottom') {
        inlineStyles = offsetVar
          ? `style="bottom: calc(var(${offsetVar}) + ${offset}px);"`
          : `style="bottom: ${offset}px;"`;
      }
    }

    const controlsHTML = this.isEdit
      ? `
      <div class="${panelClass}" ${inlineStyles}>
        <div class="${CSS_CLASSES.CONTROLS_CONTAINER}${containerClass ? ` ${containerClass}` : ''}">
          <div class="${CSS_CLASSES.CONTROLS_INNER}">
            ${this.renderControlButtons()}
            <div class="${CSS_CLASSES.STATS}">
              <span>Всего блоков: <span id="blocks-count">${document.querySelector('#blocks-count')?.textContent || '0'}</span></span>
            </div>
          </div>
        </div>
      </div>
    `
      : '';

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
        const blocksContainer = appContainer.querySelector(`.${CSS_CLASSES.BLOCKS}`);
        if (blocksContainer) {
          blocksContainer.before(newControls);
        } else {
          appContainer.append(newControls);
        }
      }
    }
  }

  private renderAddBlockButton(position: number): string {
    if (!this.isEdit) {
      return '';
    }
    return `
    <div class="${CSS_CLASSES.ADD_BLOCK_SEPARATOR}">
      <button
        data-action="showBlockTypeSelectionModal"
        data-args="[${position}]"
        class="${CSS_CLASSES.ADD_BLOCK_BTN}"
        title="Добавить блок"
      >
        <span class="${CSS_CLASSES.ADD_BLOCK_BTN_ICON}">+</span>
        <span class="${CSS_CLASSES.ADD_BLOCK_BTN_TEXT}">Добавить блок</span>
      </button>
    </div>
  `;
  }

  renderBlocks(blocks: IBlockDto[], options?: IRenderBlocksOptions): void {
    const blocksContainer = getBlocksLayoutRoot();
    const countElement = document.querySelector('#blocks-count');

    if (!blocksContainer) {
      return;
    }

    this.cleanupBreakpointWatchers();

    const blocksToRender = filterBlocksForDisplay(blocks, this.isEdit);

    if (countElement) {
      countElement.textContent = blocksToRender.length.toString();
    }

    if (blocksToRender.length === 0) {
      blocksContainer.innerHTML = `
      <div class="${CSS_CLASSES.EMPTY_STATE}">
        ${this.renderAddBlockButton(0)}
      </div>
    `;
      return;
    }

    const blocksHTML = [
      this.renderAddBlockButton(0),
      ...blocksToRender.flatMap((block, index) => [
        this.renderBlock(block, index, blocksToRender.length),
        this.renderAddBlockButton(index + 1),
      ]),
    ];

    const scrollTarget = options?.scrollToBlock;
    const scrollContainer = getScrollContainer(blocksContainer);
    const savedScrollTop = scrollContainer?.scrollTop ?? null;
    const scrollSession = scrollTarget ? blockScrollService.beginSession() : undefined;

    if (!scrollTarget) {
      blockScrollService.cancelPending();
      if (scrollContainer) {
        stopOngoingScroll(scrollContainer);
      }
    }

    blocksContainer.innerHTML = blocksHTML.join('');

    afterRender(async () => {
      this.initializeCustomBlocks(blocksToRender);
      this.initializeVueComponents(blocksToRender);
      this.setupBreakpointWatchers(blocksToRender);

      if (scrollTarget && scrollSession !== undefined) {
        await blockScrollService.scrollToBlockWhenReady(
          scrollTarget.blockId,
          {
            offsetTop: scrollTarget.offsetTop,
            offsetBottom: scrollTarget.offsetBottom,
            behavior: scrollTarget.behavior ?? 'smooth',
          },
          scrollSession
        );
      } else if (scrollContainer && savedScrollTop !== null) {
        await restoreScrollPosition(scrollContainer, savedScrollTop, blocksContainer);
      }
    });
  }

  /** Точечное обновление одного блока без полного re-render списка (сохраняет scroll). */
  updateBlock(block: IBlockDto): void {
    blockScrollService.cancelPending();

    const escapedBlockId =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(block.id)
        : block.id.replaceAll(/["\\]/g, '\\$&');

    const blockElement = document.querySelector(
      `.${CSS_CLASSES.BLOCK}[data-block-id="${escapedBlockId}"]`
    ) as HTMLElement | null;

    if (!blockElement) {
      return;
    }

    const config = this.config.blockConfigs[block.type];
    if (!config) {
      return;
    }

    blockElement.classList.toggle(
      CSS_CLASSES.OPACITY_HIDDEN,
      this.isEdit && block.visible === false
    );

    const spacingStylesObj = getBlockInlineStyles(
      (block.props.spacing || {}) as ISpacingData,
      'spacing'
    );

    if (Object.keys(spacingStylesObj).length > 0) {
      blockElement.setAttribute('style', this.objectToStyleString(spacingStylesObj));
    } else {
      blockElement.removeAttribute('style');
    }

    this.cleanupBlockWatcher(block.id);

    const contentElement = blockElement.querySelector(
      `.${CSS_CLASSES.BLOCK_CONTENT}`
    ) as HTMLElement | null;

    if (!contentElement) {
      return;
    }

    contentElement.innerHTML = this.renderBlockContent(block, config);

    afterRender(() => {
      this.initializeCustomBlocks([block]);
      this.initializeVueComponents([block]);
      this.setupBreakpointWatchers([block]);
    });
  }

  private renderBlock(block: IBlockDto, index: number, totalBlocks: number): string {
    const config = this.config.blockConfigs[block.type];
    if (!config) {
      return '';
    }

    const blockContent = this.renderBlockContent(block, config);

    const spacingStylesObj = getBlockInlineStyles(
      (block.props.spacing || {}) as ISpacingData,
      'spacing'
    );
    const styleAttr =
      Object.keys(spacingStylesObj).length > 0
        ? ` style="${this.objectToStyleString(spacingStylesObj)}"`
        : '';

    const controlsContainerClass = this.config.controlsContainerClass || '';
    const blockControlsHTML = this.isEdit
      ? `
      <!-- Поп-апчик с контролами -->
      <div class="${CSS_CLASSES.BLOCK_CONTROLS}">
        <div class="${CSS_CLASSES.BLOCK_CONTROLS_CONTAINER} ${controlsContainerClass}">
          <div class="${CSS_CLASSES.BLOCK_CONTROLS_INNER}">
            ${this.renderBlockControls(block, index, totalBlocks)}
          </div>
        </div>
      </div>
  `
      : '';

    const opacityHiddenClass =
      this.isEdit && block.visible === false ? ` ${CSS_CLASSES.OPACITY_HIDDEN}` : '';

    return `
    <div class="${CSS_CLASSES.BLOCK}${opacityHiddenClass}" data-block-id="${block.id}"${styleAttr}>
      ${blockControlsHTML}

      <!-- Содержимое блока -->
      <div class="${CSS_CLASSES.BLOCK_CONTENT}">
        ${blockContent}
      </div>
    </div>
  `;
  }

  private objectToStyleString(styles: Record<string, string>): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        const cssKey = key.replaceAll(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value}`;
      })
      .join('; ');
  }

  private renderBlockControls(block: IBlockDto, index?: number, totalBlocks?: number): string {
    if (!this.isEdit) {
      return `
        <button data-action="copyBlockId" data-args='["${block.id}"]' class="${CSS_CLASSES.CONTROL_BTN}" title="Копировать ID: ${block.id}">${copyIconHTML}</button>
      `;
    }

    const visibilityIcon = block.visible ? eyeIconHTML : eyeOffIconHTML;

    const isFirst = index === 0;
    const moveUpDisabled = isFirst ? ' disabled' : '';

    const isLast = totalBlocks && index !== undefined ? index === totalBlocks - 1 : false;
    const moveDownDisabled = isLast ? ' disabled' : '';

    return `
      <button data-action="copyBlockId" data-args='["${block.id}"]' class="${CSS_CLASSES.CONTROL_BTN}" title="Копировать ID: ${block.id}">${copyIconHTML}</button>
      <button data-action="moveBlockUp" data-args='["${block.id}"]' class="${CSS_CLASSES.CONTROL_BTN}" title="Переместить вверх"${moveUpDisabled}>${arrowUpIconHTML}</button>
      <button data-action="moveBlockDown" data-args='["${block.id}"]' class="${CSS_CLASSES.CONTROL_BTN}" title="Переместить вниз"${moveDownDisabled}>${arrowDownIconHTML}</button>
      <button data-action="editBlock" data-args='["${block.id}"]' class="${CSS_CLASSES.CONTROL_BTN}" title="Редактировать">${editIconHTML}</button>
      <button data-action="duplicateBlockUI" data-args='["${block.id}"]' class="${CSS_CLASSES.CONTROL_BTN}" title="Дублировать">${duplicateIconHTML}</button>
      <button data-action="toggleBlockVisibility" data-args='["${block.id}"]' class="${CSS_CLASSES.CONTROL_BTN}" title="${block.visible ? 'Скрыть' : 'Показать'}">${visibilityIcon}</button>
      <button data-action="deleteBlockUI" data-args='["${block.id}"]' class="${CSS_CLASSES.CONTROL_BTN}" title="Удалить">${deleteIconHTML}</button>
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
    <div class="${CSS_CLASSES.BLOCK_CONTENT_FALLBACK}">
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

  private renderVueComponent(block: IBlockDto, _config: any): string {
    const componentId = `vue-component-${block.id}`;

    return `
    <div id="${componentId}" class="${CSS_CLASSES.VUE_COMPONENT_CONTAINER}">
      <!-- Vue компонент будет монтирован здесь -->
    </div>
  `;
  }

  private initializeVueComponents(blocks: IBlockDto[]): void {
    blocks.forEach(block => {
      const config = this.config.blockConfigs[block.type];
      const render = config?.render as TRenderRef | undefined;
      if (render?.kind === 'component' && 'component' in render && render.component) {
        const componentId = `vue-component-${block.id}`;
        const componentName = render.component.name;
        const userProps = this.getUserComponentProps(block.props);
        this.mountVueComponent(componentId, componentName, userProps);
      }
    });
  }

  /**
   * Монтирование Vue компонента
   * Используется только в pure-js версии, когда пользователь хочет использовать Vue компоненты в блоках
   * Vue версия пакета рендерит компоненты напрямую через Vue, без этого метода
   */
  private mountVueComponent(
    containerId: string,
    componentName: string,
    props: Record<string, any>
  ): void {
    const container = document.querySelector(`#${containerId}`);
    if (!container) {
      return;
    }

    this.unmountVueComponent(containerId);

    if ((window as any).Vue === undefined) {
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
          [componentName]: component,
        },
        template: `<${componentName} v-bind="props" />`,
        data() {
          return {
            props: props,
          };
        },
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
      } catch {
        // Игнорируем ошибки при удалении Vue приложения
      }
      this.vueApps.delete(containerId);
    }
  }

  private renderCustomBlock(block: IBlockDto): string {
    const containerId = `custom-block-${block.id}`;
    return `<div id="${containerId}" class="${CSS_CLASSES.CUSTOM_BLOCK_CONTAINER}" data-block-id="${block.id}"></div>`;
  }

  private initializeCustomBlocks(blocks: IBlockDto[]): void {
    blocks.forEach(block => {
      const config = this.config.blockConfigs[block.type];
      const render = config?.render as TRenderRef | undefined;
      if (render?.kind === 'custom' && 'mount' in render && render.mount) {
        const containerId = `custom-block-${block.id}`;
        const container = document.querySelector(`#${containerId}`) as HTMLElement | null;

        if (container && !Object.hasOwn(container.dataset, 'customMounted')) {
          try {
            const userProps = this.getUserComponentProps(block.props);

            render.mount(container, userProps);
            container.dataset.customMounted = 'true';
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            container.innerHTML = `<div class="${CSS_CLASSES.BB_ERROR_BOX}">
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
      const spacingOptions = blockConfig?.spacingOptions as
        | { config?: { breakpoints?: IBreakpoint[] } }
        | undefined;
      const breakpoints: IBreakpoint[] | undefined = spacingOptions?.config?.breakpoints;

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
    document.body.classList.remove(CSS_CLASSES.BB_IS_EDIT_MODE);
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
