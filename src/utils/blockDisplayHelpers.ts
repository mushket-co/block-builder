import type { IComponentRegistry } from '../core/ports/ComponentRegistry';
import type { IBlock } from '../core/types';
import { isRenderableVueComponent, isVueComponent } from './renderHelpers';

export interface IBlockTypeRenderConfig {
  type: string;
  render?: IBlock['render'];
  title?: string;
}

export function getBlockTypeRenderConfig(
  type: string,
  availableBlockTypes: readonly IBlockTypeRenderConfig[]
): IBlockTypeRenderConfig | undefined {
  return availableBlockTypes.find(blockType => blockType.type === type);
}

/**
 * Восстанавливает render из конфигурации типа блока после JSON-сериализации
 * (localStorage/API), когда component-ссылка потеряна.
 */
export function enrichBlockForDisplay(
  block: IBlock,
  getBlockTypeConfig: (type: string) => IBlockTypeRenderConfig | undefined
): IBlock {
  const typeConfig = getBlockTypeConfig(block.type);
  const hasRenderableComponent =
    block.render?.kind === 'component' &&
    block.render.framework === 'vue' &&
    isRenderableVueComponent(block.render.component);

  if (hasRenderableComponent || !typeConfig?.render) {
    return block;
  }

  return {
    ...block,
    render: typeConfig.render,
  };
}

export function prepareBlocksForDisplay(
  initialBlocks: IBlock[] | undefined,
  getBlockTypeConfig: (type: string) => IBlockTypeRenderConfig | undefined
): IBlock[] {
  if (!initialBlocks?.length) {
    return [];
  }

  return initialBlocks.map(block => enrichBlockForDisplay(block, getBlockTypeConfig));
}

export function canRenderVueBlock(
  block: IBlock,
  componentRegistry: IComponentRegistry
): boolean {
  if (
    block.render?.kind === 'component' &&
    block.render.framework === 'vue' &&
    isRenderableVueComponent(block.render.component)
  ) {
    return true;
  }

  if (isVueComponent(block.render) && componentRegistry.has(block.type)) {
    return true;
  }

  return componentRegistry.has(block.type);
}

export function resolveVueComponentForBlock(
  block: IBlock,
  componentRegistry: IComponentRegistry
): ReturnType<IComponentRegistry['get']> {
  if (componentRegistry.has(block.type)) {
    return componentRegistry.get(block.type);
  }

  if (
    block.render?.kind === 'component' &&
    isRenderableVueComponent(block.render.component)
  ) {
    return block.render.component;
  }

  return componentRegistry.get(block.type);
}
