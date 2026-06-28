<template>
  <div
    :class="[
      CSS_CLASSES.BLOCK_COMPONENT,
      { [CSS_CLASSES.OPACITY_HIDDEN]: block.visible === false },
    ]"
    :style="userBlockStyle"
  >
    <div :class="CSS_CLASSES.BLOCK_COMPONENT_CONTENT">
      <component
        :is="getVueComponent(block.render)"
        v-if="isVueComponent(block.render)"
        v-bind="block.props"
      />

      <div v-else-if="getHtmlTemplate(block.render)" v-html="renderedTemplate" />

      <div v-else>Блок {{ block.type }}</div>
    </div>

    <div :class="CSS_CLASSES.BLOCK_COMPONENT_CONTROLS">
      <button
        :class="[CSS_CLASSES.CONTROL_BUTTON, CSS_CLASSES.CONTROL_BUTTON_EDIT]"
        :title="uiStrings.edit"
        @click.stop="handleEdit"
      >
        <Icon name="edit" />
      </button>
      <button
        :class="[CSS_CLASSES.CONTROL_BUTTON, CSS_CLASSES.CONTROL_BUTTON_MOVE]"
        :title="uiStrings.moveUp"
        :disabled="isFirst"
        @click.stop="handleMoveUp"
      >
        <Icon name="arrowUp" />
      </button>
      <button
        :class="[CSS_CLASSES.CONTROL_BUTTON, CSS_CLASSES.CONTROL_BUTTON_MOVE]"
        :title="uiStrings.moveDown"
        :disabled="isLast"
        @click.stop="handleMoveDown"
      >
        <Icon name="arrowDown" />
      </button>
      <button
        :class="[CSS_CLASSES.CONTROL_BUTTON, CSS_CLASSES.CONTROL_BUTTON_DUPLICATE]"
        :title="uiStrings.duplicate"
        @click.stop="handleDuplicate"
      >
        <Icon name="duplicate" />
      </button>
      <button
        :class="[CSS_CLASSES.CONTROL_BUTTON, CSS_CLASSES.CONTROL_BUTTON_VISIBILITY]"
        :title="block.visible ? uiStrings.hide : uiStrings.show"
        @click.stop="handleVisibility"
      >
        <Icon :name="block.visible ? 'eye' : 'eyeOff'" />
      </button>
      <button
        :class="[CSS_CLASSES.CONTROL_BUTTON, CSS_CLASSES.CONTROL_BUTTON_DELETE]"
        :title="uiStrings.delete"
        @click.stop="handleDelete"
      >
        <Icon name="delete" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { IBlock, TBlockId } from '../../core/types';
import { CSS_CLASSES } from '../../utils/constants';
import { getHtmlTemplate, isVueComponent } from '../../utils/renderHelpers';
import Icon from '../../shared/icons/Icon.vue';
import { useUiStrings } from '../composables/useUiStrings';

const uiStrings = useUiStrings();

const getVueComponent = (render?: any) => {
  if (!render || render.kind !== 'component') {
    return null;
  }
  return render.component;
};

interface IProps {
  block: IBlock;
  isFirst?: boolean;
  isLast?: boolean;
}

const props = defineProps<IProps>();

const emit = defineEmits<{
  update: [blockId: TBlockId, updates: Partial<IBlock>];
  delete: [blockId: TBlockId];
  edit: [blockId: TBlockId];
  duplicate: [blockId: TBlockId];
  moveUp: [blockId: TBlockId];
  moveDown: [blockId: TBlockId];
}>();

const userBlockStyle = computed(() => {
  return props.block.style || {};
});

const renderedTemplate = computed(() => {
  const template = getHtmlTemplate(props.block.render);

  if (!template) {
    return `<div>Блок ${props.block.type}</div>`;
  }

  if (typeof template === 'function') {
    return template(props.block.props);
  }

  let processedTemplate = template;
  Object.entries(props.block.props).forEach(([key, value]) => {
    const placeholder = `{{ props.${key} }}`;
    processedTemplate = processedTemplate.replaceAll(new RegExp(placeholder, 'g'), String(value));
  });

  return processedTemplate;
});

const handleMoveUp = () => {
  emit('moveUp', props.block.id);
};

const handleMoveDown = () => {
  emit('moveDown', props.block.id);
};

const handleEdit = () => {
  emit('edit', props.block.id);
};

const handleDuplicate = () => {
  emit('duplicate', props.block.id);
};

const handleDelete = () => {
  emit('delete', props.block.id);
};

const handleVisibility = () => {
  emit('update', props.block.id, { visible: !props.block.visible });
};
</script>
