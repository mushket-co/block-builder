import type { IComponentRegistry } from '../core/ports/ComponentRegistry';
import type { IBlock } from '../core/types';
import {
  isReactComponent,
  isRenderableComponent,
  isRenderableReactComponent,
  isRenderableVueComponent,
  isVueComponent,
} from './renderHelpers';

type TBlockFramework = 'vue' | 'react';

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
function getBlockFramework(
  render: IBlock['render'],
  typeConfig?: IBlockTypeRenderConfig
): TBlockFramework | null {
  if (render?.kind === 'component') {
    if (render.framework === 'react' || render.framework === 'vue') {
      return render.framework;
    }
  }

  if (typeConfig?.render?.kind === 'component') {
    if (typeConfig.render.framework === 'react' || typeConfig.render.framework === 'vue') {
      return typeConfig.render.framework;
    }
  }

  return null;
}

export function enrichBlockForDisplay(
  block: IBlock,
  getBlockTypeConfig: (type: string) => IBlockTypeRenderConfig | undefined
): IBlock {
  const typeConfig = getBlockTypeConfig(block.type);
  const framework = getBlockFramework(block.render, typeConfig);
  const hasRenderableComponent =
    block.render?.kind === 'component' &&
    framework !== null &&
    isRenderableComponent(block.render.component, framework);

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
  return resolveComponentForBlock(block, componentRegistry, 'vue');
}

export function canRenderReactBlock(
  block: IBlock,
  componentRegistry: IComponentRegistry
): boolean {
  if (
    block.render?.kind === 'component' &&
    block.render.framework === 'react' &&
    isRenderableReactComponent(block.render.component)
  ) {
    return true;
  }

  if (isReactComponent(block.render) && componentRegistry.has(block.type)) {
    return true;
  }

  return componentRegistry.has(block.type);
}

export function resolveReactComponentForBlock(
  block: IBlock,
  componentRegistry: IComponentRegistry
): ReturnType<IComponentRegistry['get']> {
  return resolveComponentForBlock(block, componentRegistry, 'react');
}

function resolveComponentForBlock(
  block: IBlock,
  componentRegistry: IComponentRegistry,
  framework: TBlockFramework
): ReturnType<IComponentRegistry['get']> {
  if (componentRegistry.has(block.type)) {
    return componentRegistry.get(block.type);
  }

  if (
    block.render?.kind === 'component' &&
    block.render.framework === framework &&
    isRenderableComponent(block.render.component, framework)
  ) {
    return block.render.component;
  }

  return componentRegistry.get(block.type);
}
