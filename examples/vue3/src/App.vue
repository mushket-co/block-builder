<template>
  <div class="app">
    <div class="app-header">
      <h1>BlockBuilder Vue3 + Vite Example</h1>
      <div class="app-description">
        <p>✅ Полноценное Vue3 приложение с Vite</p>
        <p>✅ Настоящие Vue компоненты с SFC</p>
        <p>✅ Все возможности современного фреймворка</p>
      </div>
    </div>

    <div class="app-content">
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
        :warn-on-page-leave="true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  BlockBuilderComponent,
  createBlockManagementUseCase,
  ApiSelectUseCase,
  FetchHttpClient,
  CustomFieldRendererRegistry
} from '@mushket-co/block-builder/vue'
import { blockConfigs } from './block-config'
import { WysiwygFieldRenderer } from './customFieldRenderers/WysiwygFieldRenderer'
import { loadBlocksFromLocalStorage, saveBlocksToLocalStorage } from '../../shared/blockStorage'

const blockManagementUseCase = createBlockManagementUseCase()
// Repository хранит блоки только в памяти (для работы во время сессии)

const httpClient = new FetchHttpClient()
const apiSelectUseCase = new ApiSelectUseCase(httpClient)

const customFieldRendererRegistry = new CustomFieldRendererRegistry()
customFieldRendererRegistry.register(new WysiwygFieldRenderer())

const componentRegistry = blockManagementUseCase.getComponentRegistry()
Object.entries(blockConfigs).forEach(([type, config]) => {
  if (config.render?.component) {
    componentRegistry.register(type, config.render.component)
  }
})

const availableBlockTypes = ref(
  Object.entries(blockConfigs).map(([type, cfg]) => ({
    type,
    label: cfg.title,
    icon: cfg.icon,
    render: cfg.render,
    fields: cfg.fields,
    spacingOptions: cfg.spacingOptions,
    defaultSettings: {},
    defaultProps: cfg.fields?.reduce((acc, field) => {
      acc[field.field] = field.defaultValue
      return acc
    }, {}) || {}
  }))
)

const isEdit = ref(true)

const toggleIsEdit = () => {
  isEdit.value = !isEdit.value
}

window.toggleIsEdit = toggleIsEdit

const initialBlocks = ref(loadBlocksFromLocalStorage())

const handleSave = async (blocks) => {
  // В проде: POST на API. В demo — localStorage (без base64-картинок).
  const result = saveBlocksToLocalStorage(blocks)

  if (!result.ok) {
    console.error('Ошибка сохранения:', result.error)
    return false
  }

  if (result.strippedImages) {
    console.warn(
      'localStorage: base64-изображения не сохранены (лимит браузера). Загружайте файлы на сервер или используйте URL.'
    )
  }

  return true
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.app-header {
  background: white;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.app-header h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.app-description {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
}

.app-description p {
  margin: 0.25rem 0;
}

.app-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

</style>

