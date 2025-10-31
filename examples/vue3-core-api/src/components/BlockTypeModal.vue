<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Выберите тип блока</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>

      <div class="block-types">
        <button
          v-for="(config, type) in blockConfigs"
          :key="type"
          @click="$emit('select', type)"
          class="block-type-btn"
        >
          <span class="block-type-icon">{{ config.icon }}</span>
          <div class="block-type-info">
            <div class="block-type-name">{{ config.title }}</div>
            <div class="block-type-description">{{ config.description }}</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  blockConfigs: Object
})

defineEmits(['close', 'select'])
</script>

<style scoped>
.block-types {
  display: grid;
  gap: 12px;
}

.block-type-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.block-type-btn:hover {
  border-color: #007bff;
  background: #f0f8ff;
}

.block-type-icon {
  font-size: 32px;
}

.block-type-info {
  flex: 1;
}

.block-type-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.block-type-description {
  font-size: 14px;
  color: #666;
}
</style>

