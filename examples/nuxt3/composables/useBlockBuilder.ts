import { type Ref, ref } from 'vue'
import {
  createBlockManagementUseCase,
  ApiSelectUseCase,
  FetchHttpClient,
  CustomFieldRendererRegistry,
} from '@mushket-co/block-builder/vue'
import { blockConfigs } from '~/block-config.js'
import { WysiwygFieldRenderer } from '~/customFieldRenderers/WysiwygFieldRenderer.js'
import { serializeBlocksForStorage } from '~/utils/serializeBlocks'
import { enrichNewsListProps } from '~/utils/enrichNewsListClient'
import { stripNewsListEnrichedProps } from '~/utils/stripEnrichedProps'

export function useBlockBuilder(initialBlocks: Ref<unknown[]>) {
  const blockManagementUseCase = createBlockManagementUseCase()
  const updateBlockOriginal = blockManagementUseCase.updateBlock.bind(blockManagementUseCase)

  blockManagementUseCase.updateBlock = async (
    blockId: string,
    updates: Parameters<typeof updateBlockOriginal>[1]
  ) => {
    if (updates.props) {
      const block = await blockManagementUseCase.getBlock(blockId)

      if (block?.type === 'newsList') {
        updates = {
          ...updates,
          props: stripNewsListEnrichedProps(updates.props as Record<string, unknown>),
        }
      }
    }

    const updated = await updateBlockOriginal(blockId, updates)

    if (updated?.type === 'newsList' && updated.props) {
      return {
        ...updated,
        props: await enrichNewsListProps(updated.props as Record<string, unknown>),
      }
    }

    return updated
  }
  const apiSelectUseCase = new ApiSelectUseCase(new FetchHttpClient())

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
      defaultProps:
        cfg.fields?.reduce<Record<string, unknown>>((acc, field) => {
          acc[field.field] = field.defaultValue
          return acc
        }, {}) ?? {},
    }))
  )

  const isEdit = ref(true)

  const handleSave = async (blocks: unknown[]) => {
    const payload = serializeBlocksForStorage(blocks)

    try {
      await $fetch('/api/blocks', {
        method: 'POST',
        body: payload,
      })

      return true
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      return false
    }
  }

  return {
    blockManagementUseCase,
    apiSelectUseCase,
    customFieldRendererRegistry,
    availableBlockTypes,
    initialBlocks,
    isEdit,
    handleSave,
  }
}
