import { CSS_CLASSES } from '../../../../src/utils/constants';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { BlockBuilderComponent } from '../../../../src/react';
import { createTestBlockManagementUseCase } from '../../helpers/mockUseCases';

function TextBlock({ content }: { content: string }) {
  return <p className="text-block-content">{content}</p>;
}

describe('BlockBuilder SSR (React)', () => {
  it('renders initial block content in server HTML for edit and view modes', () => {
    const blockManagementUseCase = createTestBlockManagementUseCase();
    const componentRegistry = blockManagementUseCase.getComponentRegistry();
    componentRegistry.register('text', TextBlock);

    const initialBlocks = [
      {
        id: 'block-ssr-1',
        type: 'text',
        props: { content: 'SEO visible content' },
        settings: {},
        visible: true,
      },
    ];

    const blockTypes = [
      {
        type: 'text',
        label: 'Text',
        render: { kind: 'component', framework: 'react', component: TextBlock },
        fields: [],
        defaultProps: {},
      },
    ];

    const renderMode = (isEdit: boolean) =>
      renderToString(
        <BlockBuilderComponent
          config={{ availableBlockTypes: blockTypes }}
          blockManagementUseCase={blockManagementUseCase}
          initialBlocks={initialBlocks}
          isEdit={isEdit}
          onSave={async () => true}
        />
      );

    const editHtml = renderMode(true);
    const viewHtml = renderMode(false);

    expect(editHtml).toContain('SEO visible content');
    expect(viewHtml).toContain('SEO visible content');
    expect(editHtml).toContain(CSS_CLASSES.ADD_BLOCK_BTN);
    expect(viewHtml).not.toContain(CSS_CLASSES.ADD_BLOCK_BTN);
  });

  it('omits hidden blocks from server HTML in view mode but keeps them in edit mode', () => {
    const blockManagementUseCase = createTestBlockManagementUseCase();
    const componentRegistry = blockManagementUseCase.getComponentRegistry();
    componentRegistry.register('text', TextBlock);

    const initialBlocks = [
      {
        id: 'block-visible',
        type: 'text',
        props: { content: 'Public content' },
        settings: {},
        visible: true,
      },
      {
        id: 'block-hidden',
        type: 'text',
        props: { content: 'Secret hidden content' },
        settings: {},
        visible: false,
      },
    ];

    const blockTypes = [
      {
        type: 'text',
        label: 'Text',
        render: { kind: 'component', framework: 'react', component: TextBlock },
        fields: [],
        defaultProps: {},
      },
    ];

    const renderMode = (isEdit: boolean) =>
      renderToString(
        <BlockBuilderComponent
          config={{ availableBlockTypes: blockTypes }}
          blockManagementUseCase={blockManagementUseCase}
          initialBlocks={initialBlocks}
          isEdit={isEdit}
          onSave={async () => true}
        />
      );

    const editHtml = renderMode(true);
    const viewHtml = renderMode(false);

    expect(editHtml).toContain('Public content');
    expect(editHtml).toContain('Secret hidden content');
    expect(viewHtml).toContain('Public content');
    expect(viewHtml).not.toContain('Secret hidden content');
    expect(viewHtml).not.toContain('block-hidden');
  });
});
