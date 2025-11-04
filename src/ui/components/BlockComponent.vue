<template>
  <div
    class="block-component"
    :class="{
      [CSS_CLASSES.HIDDEN]: !block.visible,
      'bb-opacity-hidden': !block.visible
    }"
    :style="userBlockStyle"
  >
    <div class="block-component__content">
      <!-- Vue компонент -->
      <component
        v-if="isVueComponent(block.render)"
        :is="getVueComponent(block.render)"
        v-bind="block.props"
      />
      <!-- HTML template -->
      <div v-else-if="getHtmlTemplate(block.render)" v-html="renderedTemplate"></div>
      <!-- Fallback -->
      <div v-else>Блок {{ block.type }}</div>
    </div>

    <div class="block-component__controls">
      <button
        @click.stop="handleMoveUp"
        class="control-button move-button"
        title="Переместить вверх"
        :disabled="isFirst"
      >
        <Icon name="arrowUp" />
      </button>
      <button
        @click.stop="handleMoveDown"
        class="control-button move-button"
        title="Переместить вниз"
        :disabled="isLast"
      >
        <Icon name="arrowDown" />
      </button>
      <button @click.stop="handleEdit" class="control-button edit-button" title="Редактировать">
        <Icon name="edit" />
      </button>
      <button @click.stop="handleDuplicate" class="control-button duplicate-button" title="Дублировать">
        <Icon name="duplicate" />
      </button>
      <button @click.stop="handleDelete" class="control-button delete-button" title="Удалить">
        <Icon name="delete" />
      </button>
      <button @click.stop="handleVisibility" class="control-button visibility-button" :title="block.visible ? 'Hide' : 'Show'">
        <Icon :name="block.visible ? 'eye' : 'eyeOff'" />
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IBlock, TBlockId } from '../../core/types';
import { getHtmlTemplate, isVueComponent } from '../../utils/renderHelpers';
import { CSS_CLASSES } from '../../utils/constants';
import Icon from '../icons/Icon.vue';

const getVueComponent = (render?: any) => {
  if (!render || render.kind !== 'component') return null;
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
    processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), String(value));
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
