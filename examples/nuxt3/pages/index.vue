<template>
  <div class="page">
    <header class="page-header">
      <h1>BlockBuilder + Nuxt 3 (SSR)</h1>
      <p>
        Контент блоков рендерится на сервере. Режим:
        <strong>{{ isEdit ? 'редактирование' : 'просмотр' }}</strong>
      </p>
      <div class="page-header__actions">
        <button type="button" class="mode-btn" @click="isEdit = !isEdit">
          Переключить режим
        </button>
      </div>
    </header>

    <main class="page-content">
      <BlockBuilderComponent
        :config="{ availableBlockTypes }"
        :block-management-use-case="blockManagementUseCase"
        :api-select-use-case="apiSelectUseCase"
        :custom-field-renderer-registry="customFieldRendererRegistry"
        :on-save="handleSave"
        :initial-blocks="initialBlocks"
        controls-container-class="container"
        controls-fixed-position="bottom"
        :controls-offset="20"
        :is-edit="isEdit"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { BlockBuilderComponent } from '@mushket-co/block-builder/vue'
import { useBlockBuilder } from '~/composables/useBlockBuilder'

const { data: initialBlocks } = await useAsyncData('bb-blocks', () =>
  $fetch<unknown[]>('/api/blocks')
)

if (!initialBlocks.value) {
  initialBlocks.value = []
}

const {
  blockManagementUseCase,
  apiSelectUseCase,
  customFieldRendererRegistry,
  availableBlockTypes,
  isEdit,
  handleSave,
} = useBlockBuilder(initialBlocks)
</script>

<style>
html {
  font-family: Open Sans, sans-serif;
}

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.page-header {
  background: #fff;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.page-header h1 {
  margin: 0 0 0.5rem;
  color: #2c3e50;
}

.page-header p {
  margin: 0 0 0.75rem;
  color: #666;
  font-size: 0.95rem;
}

.page-header__actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.mode-btn {
  border: 1px solid #ced4da;
  background: #fff;
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
}

.mode-btn:hover {
  background: #f1f3f5;
}

.page-content {
  flex: 1;
  overflow-y: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>
