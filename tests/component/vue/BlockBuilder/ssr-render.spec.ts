import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';

import { BlockBuilderComponent } from '../../../../src/vue';
import { createTestBlockManagementUseCase } from '../../helpers/mockUseCases';

const TextBlock = defineComponent({
  props: {
    content: { type: String, required: true },
  },
  setup(props) {
    return () => h('p', { class: 'text-block-content' }, props.content);
  },
});

describe('BlockBuilder SSR', () => {
  it('renders initial block content in server HTML for edit and view modes', async () => {
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
        render: { kind: 'component', framework: 'vue', component: TextBlock },
        fields: [],
        defaultProps: {},
      },
    ];

    const renderMode = async (isEdit: boolean) => {
      const app = createSSRApp({
        render: () =>
          h(BlockBuilderComponent, {
            config: { availableBlockTypes: blockTypes },
            blockManagementUseCase,
            initialBlocks,
            isEdit,
            onSave: async () => true,
          }),
      });

      return renderToString(app);
    };

    const editHtml = await renderMode(true);
    const viewHtml = await renderMode(false);

    expect(editHtml).toContain('SEO visible content');
    expect(viewHtml).toContain('SEO visible content');
    expect(editHtml).toContain('bb-add-block-btn');
    expect(viewHtml).not.toContain('bb-add-block-btn');
  });
});
