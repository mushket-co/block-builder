<template>
  <div class="block-properties">
    <div v-if="!block" class="no-selection">
      <p>Select a block to edit its properties</p>
    </div>

    <div v-else class="properties-content">
      <div class="property-section">
        <h4>General</h4>
        <div class="property-group">
          <label>Type</label>
          <input
            :value="block.type"
            disabled
            class="property-input"
          />
        </div>

        <div class="property-group">
          <label>ID</label>
          <input
            :value="block.id"
            disabled
            class="property-input"
          />
        </div>

        <div class="property-group">
          <label>
            <input
              type="checkbox"
              :checked="block.visible"
              @change="updateProperty('visible', $event.target.checked)"
            />
            Visible
          </label>
        </div>

        <div class="property-group">
          <label>
            <input
              type="checkbox"
              :checked="block.locked"
              @change="updateProperty('locked', $event.target.checked)"
            />
            Locked
          </label>
        </div>
      </div>


      <div class="property-section">
        <h4>Props</h4>
        <div
          v-for="(value, key) in block.props"
          :key="`prop-${key}`"
          class="property-group"
        >
          <label>{{ key }}</label>
          <input
            :value="value"
            @input="updateProp(key, $event.target.value)"
            class="property-input"
          />
        </div>
      </div>

      <div class="property-section">
        <h4>Settings</h4>
        <div
          v-for="(value, key) in block.settings"
          :key="`setting-${key}`"
          class="property-group"
        >
          <label>{{ key }}</label>
          <input
            :value="value"
            @input="updateSetting(key, $event.target.value)"
            class="property-input"
          />
        </div>
      </div>

      <div class="property-section">
        <h4>Style</h4>
        <div
          v-for="(value, key) in block.style"
          :key="`style-${key}`"
          class="property-group"
        >
          <label>{{ key }}</label>
          <input
            :value="value"
            @input="updateStyle(key, $event.target.value)"
            class="property-input"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IBlock, TBlockId } from '../../core/types';

interface IProps {
  block: IBlock | null;
}

const props = defineProps<IProps>();

const emit = defineEmits<{
  update: [blockId: TBlockId, updates: Partial<IBlock>];
}>();

const updateProperty = (key: string, value: any) => {
  if (!props.block) return;
  emit('update', props.block.id, { [key]: value });
};


const updateProp = (key: string, value: string) => {
  if (!props.block) return;
  const newProps = { ...props.block.props, [key]: value };
  emit('update', props.block.id, { props: newProps });
};

const updateSetting = (key: string, value: string) => {
  if (!props.block) return;
  const newSettings = { ...props.block.settings, [key]: value };
  emit('update', props.block.id, { settings: newSettings });
};

const updateStyle = (key: string, value: string) => {
  if (!props.block) return;
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

.property-group label input[type="checkbox"] {
  margin-right: 6px;
}
</style>
