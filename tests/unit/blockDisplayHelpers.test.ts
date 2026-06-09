import { describe, expect, it } from '@jest/globals';

import { MemoryComponentRegistry } from '../../src/infrastructure/registries/MemoryComponentRegistry';
import type { IBlock } from '../../src/core/types';
import {
  enrichBlockForDisplay,
  prepareBlocksForDisplay,
  canRenderReactBlock,
  canRenderVueBlock,
  resolveReactComponentForBlock,
  resolveVueComponentForBlock,
} from '../../src/utils/blockDisplayHelpers';

const TextComponent = { template: '<div>{{ content }}</div>' };

const blockTypes = [
  {
    type: 'text',
    title: 'Text',
    render: { kind: 'component', framework: 'vue', component: TextComponent },
  },
];

describe('blockDisplayHelpers', () => {
  it('restores render from block type config after deserialization', () => {
    const storedBlock: IBlock = {
      id: 'block-1',
      type: 'text',
      props: { content: 'Hello SSR' },
      settings: {},
    };

    const enriched = enrichBlockForDisplay(storedBlock, type =>
      blockTypes.find(blockType => blockType.type === type)
    );

    expect(enriched.render).toEqual(blockTypes[0].render);
  });

  it('prefers registry over invalid render.component after deserialization', () => {
    const registry = new MemoryComponentRegistry();
    registry.register('text', TextComponent);

    const block: IBlock = {
      id: 'block-1',
      type: 'text',
      props: { content: 'Hello' },
      settings: {},
      render: {
        kind: 'component',
        framework: 'vue',
        component: {} as never,
      },
    };

    expect(resolveVueComponentForBlock(block, registry)).toBe(TextComponent);
  });

  it('restores render from block type when render metadata exists without component', () => {
    const storedBlock: IBlock = {
      id: 'block-1',
      type: 'text',
      props: { content: 'Hello SSR' },
      settings: {},
      render: { kind: 'component', framework: 'vue' },
    };

    const enriched = enrichBlockForDisplay(storedBlock, type =>
      blockTypes.find(blockType => blockType.type === type)
    );

    expect(enriched.render).toEqual(blockTypes[0].render);
  });

  it('resolves vue component from registry when render metadata is missing', () => {
    const registry = new MemoryComponentRegistry();
    registry.register('text', TextComponent);

    const block: IBlock = {
      id: 'block-1',
      type: 'text',
      props: { content: 'Hello' },
      settings: {},
    };

    expect(canRenderVueBlock(block, registry)).toBe(true);
    expect(resolveVueComponentForBlock(block, registry)).toBe(TextComponent);
  });

  it('restores react render from block type config after deserialization', () => {
    const TextReactComponent = () => null;
    const reactBlockTypes = [
      {
        type: 'text',
        title: 'Text',
        render: { kind: 'component', framework: 'react', component: TextReactComponent },
      },
    ];

    const storedBlock: IBlock = {
      id: 'block-react-1',
      type: 'text',
      props: { content: 'Hello React' },
      settings: {},
    };

    const enriched = enrichBlockForDisplay(storedBlock, type =>
      reactBlockTypes.find(blockType => blockType.type === type)
    );

    expect(enriched.render).toEqual(reactBlockTypes[0].render);
    expect(canRenderReactBlock(enriched, new MemoryComponentRegistry())).toBe(true);
    expect(resolveReactComponentForBlock(enriched, new MemoryComponentRegistry())).toBe(
      TextReactComponent
    );
  });

  it('prepares all blocks for display', () => {
    const blocks = prepareBlocksForDisplay(
      [
        {
          id: '1',
          type: 'text',
          props: { content: 'A' },
          settings: {},
        },
      ],
      type => blockTypes.find(blockType => blockType.type === type)
    );

    expect(blocks[0].render).toEqual(blockTypes[0].render);
  });
});
