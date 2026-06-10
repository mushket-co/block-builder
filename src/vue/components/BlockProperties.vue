<template>
  <div :class="CSS_CLASSES.BLOCK_PROPERTIES">
    <div v-if="!block" :class="CSS_CLASSES.BLOCK_PROPERTIES_NO_SELECTION">
      <p>Select a block to edit its properties</p>
    </div>

    <div v-else :class="CSS_CLASSES.BLOCK_PROPERTIES_CONTENT">
      <div :class="CSS_CLASSES.BLOCK_PROPERTIES_SECTION">
        <h4>General</h4>
        <div :class="CSS_CLASSES.BLOCK_PROPERTIES_GROUP">
          <label>Type</label>
          <input :value="block.type" disabled :class="CSS_CLASSES.BLOCK_PROPERTIES_INPUT" />
        </div>

        <div :class="CSS_CLASSES.BLOCK_PROPERTIES_GROUP">
          <label>ID</label>
          <input :value="block.id" disabled :class="CSS_CLASSES.BLOCK_PROPERTIES_INPUT" />
        </div>

        <div :class="CSS_CLASSES.BLOCK_PROPERTIES_GROUP">
          <label>
            <input
              type="checkbox"
              :checked="block.visible"
              @change="updateProperty('visible', $event.target.checked)"
            />
            Visible
          </label>
        </div>
      </div>

      <div :class="CSS_CLASSES.BLOCK_PROPERTIES_SECTION">
        <h4>Props</h4>
        <div
          v-for="(value, key) in block.props"
          :key="`prop-${key}`"
          :class="CSS_CLASSES.BLOCK_PROPERTIES_GROUP"
        >
          <label>{{ key }}</label>
          <input
            :value="value"
            :class="CSS_CLASSES.BLOCK_PROPERTIES_INPUT"
            @input="updateProp(key, $event.target.value)"
          />
        </div>
      </div>

      <div :class="CSS_CLASSES.BLOCK_PROPERTIES_SECTION">
        <h4>Settings</h4>
        <div
          v-for="(value, key) in block.settings"
          :key="`setting-${key}`"
          :class="CSS_CLASSES.BLOCK_PROPERTIES_GROUP"
        >
          <label>{{ key }}</label>
          <input
            :value="value"
            :class="CSS_CLASSES.BLOCK_PROPERTIES_INPUT"
            @input="updateSetting(key, $event.target.value)"
          />
        </div>
      </div>

      <div :class="CSS_CLASSES.BLOCK_PROPERTIES_SECTION">
        <h4>Style</h4>
        <div
          v-for="(value, key) in block.style"
          :key="`style-${key}`"
          :class="CSS_CLASSES.BLOCK_PROPERTIES_GROUP"
        >
          <label>{{ key }}</label>
          <input
            :value="value"
            :class="CSS_CLASSES.BLOCK_PROPERTIES_INPUT"
            @input="updateStyle(key, $event.target.value)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IBlock, TBlockId } from '../../core/types';
import { CSS_CLASSES } from '../../utils/constants';

interface IProps {
  block: IBlock | null;
}

const props = defineProps<IProps>();

const emit = defineEmits<{
  update: [blockId: TBlockId, updates: Partial<IBlock>];
}>();

const updateProperty = (key: string, value: any) => {
  if (!props.block) {
    return;
  }
  emit('update', props.block.id, { [key]: value });
};

const updateProp = (key: string, value: string) => {
  if (!props.block) {
    return;
  }
  const newProps = { ...props.block.props, [key]: value };
  emit('update', props.block.id, { props: newProps });
};

const updateSetting = (key: string, value: string) => {
  if (!props.block) {
    return;
  }
  const newSettings = { ...props.block.settings, [key]: value };
  emit('update', props.block.id, { settings: newSettings });
};

const updateStyle = (key: string, value: string) => {
  if (!props.block) {
    return;
  }
  const newStyle = { ...props.block.style, [key]: value };
  emit('update', props.block.id, { style: newStyle });
};
</script>

<style scoped>
.block-properties {
  height: 100%;
  overflow-y: auto;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  text-align: center;
}

.properties-content {
  padding: 0;
}

.property-section {
  margin-bottom: 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}

.property-section:last-child {
  border-bottom: none;
}

.property-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.property-group {
  margin-bottom: 12px;
}

.property-row {
  display: flex;
  gap: 8px;
}

.property-row .property-group {
  flex: 1;
}

.property-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #555;
  text-transform: capitalize;
}

.property-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  transition: border-color 0.2s;
}

.property-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.property-input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.property-group label input[type='checkbox'] {
  margin-right: 6px;
}
</style>
