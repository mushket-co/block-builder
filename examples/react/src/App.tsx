import { useEffect, useMemo, useState } from 'react'
import {
  BlockBuilderComponent,
  createBlockManagementUseCase,
  ApiSelectUseCase,
  FetchHttpClient,
  CustomFieldRendererRegistry,
} from '@mushket-co/block-builder/react'
import { loadBlocksFromLocalStorage, saveBlocksToLocalStorage } from '../../shared/blockStorage'
import { blockConfigs } from './block-config'
import { WysiwygFieldRenderer } from './customFieldRenderers/WysiwygFieldRenderer'

export default function App() {
  const blockManagementUseCase = useMemo(() => createBlockManagementUseCase(), [])
  const apiSelectUseCase = useMemo(
    () => new ApiSelectUseCase(new FetchHttpClient()),
    []
  )

  const customFieldRendererRegistry = useMemo(() => {
    const registry = new CustomFieldRendererRegistry()
    registry.register(new WysiwygFieldRenderer())
    return registry
  }, [])

  useEffect(() => {
    const componentRegistry = blockManagementUseCase.getComponentRegistry()
    Object.entries(blockConfigs).forEach(([type, config]) => {
      if (config.render?.component) {
        componentRegistry.register(type, config.render.component)
      }
    })
  }, [blockManagementUseCase])

  const availableBlockTypes = useMemo(
    () =>
      Object.entries(blockConfigs).map(([type, cfg]) => ({
        type,
        label: cfg.title,
        icon: cfg.icon,
        render: cfg.render,
        fields: cfg.fields,
        spacingOptions: cfg.spacingOptions,
        defaultSettings: {},
        defaultProps:
          cfg.fields?.reduce<Record<string, unknown>>((acc, field) => {
            acc[field.field] = field.defaultValue
            return acc
          }, {}) ?? {},
      })),
    []
  )

  const [isEdit, setIsEdit] = useState(true)
  const [initialBlocks] = useState(() => loadBlocksFromLocalStorage())

  const handleSave = async (blocks: unknown[]) => {
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

  return (
    <div className="app">
      <div className="app-header">
        <h1>BlockBuilder React + Vite Example</h1>
        <div className="app-description">
          <p>Полноценное React 19+ приложение с Vite</p>
          <p>Настоящие React-компоненты блоков</p>
          <p>Все возможности BlockBuilder для React</p>
        </div>
        <button type="button" className="mode-btn" onClick={() => setIsEdit(value => !value)}>
          Режим: {isEdit ? 'редактирование' : 'просмотр'}
        </button>
      </div>

      <div className="app-content">
        <BlockBuilderComponent
          config={{ availableBlockTypes }}
          blockManagementUseCase={blockManagementUseCase}
          apiSelectUseCase={apiSelectUseCase}
          customFieldRendererRegistry={customFieldRendererRegistry}
          onSave={handleSave}
          initialBlocks={initialBlocks}
          controlsContainerClass="container"
          controlsFixedPosition="bottom"
          controlsOffset={20}
          isEdit={isEdit}
          warnOnPageLeave
        />
      </div>
    </div>
  )
}
