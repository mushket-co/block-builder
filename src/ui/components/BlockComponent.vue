<template>
  <div
    class="block-component"
    :class="{
      'is-locked': block.locked,
      'is-hidden': !block.visible
    }"
    :style="blockStyle"
    @click.stop="handleClick"
  >
    <div class="block-component__content" @click="handleCardClick">
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
      <button @click.stop="handleLock" class="control-button lock-button" :title="block.locked ? 'Unlock' : 'Lock'">
        <Icon :name="block.locked ? 'unlock' : 'lock'" />
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
import { getHtmlTemplate, getComponentInfo, isVueComponent } from '../../utils/renderHelpers';

// Import icon component
import Icon from '../icons/Icon.vue';

// Функция для получения Vue компонента
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
  'card-click': [card: any];
}>();

// Состояние

// Вычисляемые свойства
const blockStyle = computed(() => {
  const style: Record<string, string> = {
    opacity: props.block.visible ? '1' : '0.5',
    pointerEvents: props.block.locked ? 'none' : 'auto'
  };

  // Добавляем пользовательские стили
  if (props.block.style) {
    Object.assign(style, props.block.style);
  }

  return style;
});

const renderedTemplate = computed(() => {
  // Получаем HTML template из render-описания
  const template = getHtmlTemplate(props.block.render);

  if (!template) {
    return `<div>Блок ${props.block.type}</div>`;
  }

  // Если template - функция, вызываем её с пропсами
  if (typeof template === 'function') {
    return template(props.block.props);
  }

  // Если template - строка, заменяем плейсхолдеры на значения из props
  let processedTemplate = template;
  Object.entries(props.block.props).forEach(([key, value]) => {
    const placeholder = `{{ props.${key} }}`;
    processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), String(value));
  });

  return processedTemplate;
});

// Методы
const handleClick = () => {};

const handleCardClick = (event: MouseEvent) => {
  // Останавливаем всплытие, чтобы не переключать выделение блока
  event.stopPropagation();

  const target = event.target as HTMLElement;

  // Предотвращаем переход по ссылке внутри карточки, откроем её из модалки
  const clickedAnchor = target.closest('a');
  if (clickedAnchor && clickedAnchor.classList.contains('card-button')) {
    event.preventDefault();
  }

  // Поддерживаем оба варианта класса карточки: .card-item и .card
  const cardItem = (target.closest('.card-item') || target.closest('.card')) as HTMLElement | null;

  if (cardItem && props.block.type === 'cardlist') {
    // Извлекаем данные карточки из DOM
    const title = cardItem.querySelector('h3')?.textContent || '';
    const text = cardItem.querySelector('p')?.textContent || '';
    const button = cardItem.querySelector('a')?.textContent || '';
    const link = cardItem.querySelector('a')?.getAttribute('href') || '';
    const image = cardItem.querySelector('img')?.getAttribute('src') || '';

    const card = { title, text, button, link, image };

    emit('card-click', card);
  }
};


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

const handleLock = () => {
  emit('update', props.block.id, { locked: !props.block.locked });
};

const handleVisibility = () => {
  emit('update', props.block.id, { visible: !props.block.visible });
};

</script>

<style scoped>
.block-component {
  position: absolute;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: move;
  user-select: none;
  transition: all 0.2s ease;
}

.block-component:hover {
  border-color: #007bff;
}

.block-component.is-selected {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.block-component.is-dragging {
  opacity: 0.8;
  transform: rotate(2deg);
}

.block-component.is-locked {
  cursor: not-allowed;
  opacity: 0.7;
}

.block-component.is-hidden {
  opacity: 0.3;
}

.block-component__content {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 2px;
}

.block-component__controls {
  position: absolute;
  top: -30px;
  right: 0;
  display: flex;
  gap: 4px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.control-button {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background-color 0.2s;
}

.control-button:hover {
  background: #f0f0f0;
}

.control-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

.delete-button:hover {
  background: #ff4444;
  color: white;
}

</style>
