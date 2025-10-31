<template>
  <div class="blocks-container">
    <div v-if="blocks.length === 0" class="empty-state">
      <p>Блоков пока нет</p>
      <button class="btn" @click="$emit('add-block')">Добавить блок</button>
    </div>

    <div v-else class="block-item" v-for="block in blocks" :key="block.id">
      <div class="block-header">
        <div class="block-info">
          <span class="block-type">{{ block.type }}</span>
          <span class="block-id">{{ block.id }}</span>
        </div>
        <div class="block-meta">
          <span
            :class="['meta-item', { active: block.locked }]"
            @click="$emit('toggle-lock', block.id)"
            title="Блокировка"
          >
            🔒
          </span>
          <span
            :class="['meta-item', { active: block.visible }]"
            @click="$emit('toggle-visibility', block.id)"
            title="Видимость"
          >
            👁️
          </span>
        </div>
      </div>

      <!-- Визуальный рендер блока -->
      <div class="block-visual" v-if="block.visible">
        <BlockRenderer :type="block.type" :props="block.props" />
      </div>

      <!-- JSON превью (для отладки) -->
      <details class="block-preview">
        <summary>Props (JSON)</summary>
        <pre>{{ JSON.stringify(block.props, null, 2) }}</pre>
      </details>

      <div class="block-actions">
        <button class="btn btn-sm" @click="$emit('edit', block)">Редактировать</button>
        <button class="btn btn-sm btn-secondary" @click="$emit('duplicate', block.id)">Дублировать</button>
        <button class="btn btn-sm btn-danger" @click="$emit('delete', block.id)">Удалить</button>
        <button class="btn btn-sm btn-secondary" @click="$emit('move-up', block.id)">↑ Вверх</button>
        <button class="btn btn-sm btn-secondary" @click="$emit('move-down', block.id)">↓ Вниз</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import BlockRenderer from './BlockRenderer.vue'

defineProps({
  blocks: Array
})

defineEmits(['add-block', 'edit', 'delete', 'duplicate', 'toggle-lock', 'toggle-visibility', 'move-up', 'move-down'])
</script>

<style scoped>
.blocks-container {
  margin-top: 24px;
}

.empty-state {
  text-align: center;
  padding: 48px;
  background: white;
  border-radius: 8px;
  color: #999;
}

.empty-state p {
  margin-bottom: 16px;
}

.block-visual {
  margin: 16px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.block-preview {
  margin-top: 12px;
}

.block-preview summary {
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  color: #666;
  padding: 4px 0;
}

.block-preview pre {
  margin-top: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  overflow-x: auto;
}
</style>

