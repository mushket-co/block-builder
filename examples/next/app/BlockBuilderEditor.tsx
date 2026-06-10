'use client'

import '@mushket-co/block-builder/index.css'

import { useEffect, useMemo, useState } from 'react'
import {
  BlockBuilderComponent,
  createBlockManagementUseCase,
  ApiSelectUseCase,
  FetchHttpClient,
  CustomFieldRendererRegistry,
  type IBlock,
  type IBlockBuilderProps,
} from '@mushket-co/block-builder/react'

import { blockConfigs } from '@react-example/block-config'
import { WysiwygFieldRenderer } from '@react-example/customFieldRenderers/WysiwygFieldRenderer'

import { enrichNewsListProps } from '@/lib/enrichNewsListClient'
import { serializeBlocksForStorage } from '@/lib/serializeBlocks'
import { stripNewsListEnrichedProps } from '@/lib/stripEnrichedProps'

interface IBlockBuilderEditorProps {
  initialBlocks: unknown[]
}

export function BlockBuilderEditor({ initialBlocks }: IBlockBuilderEditorProps) {
  const blockManagementUseCase = useMemo(() => {
    const useCase = createBlockManagementUseCase()
    const updateBlockOriginal = useCase.updateBlock.bind(useCase)

    useCase.updateBlock = async (blockId, updates) => {
      let nextUpdates = updates

      if (nextUpdates.props) {
        const block = await useCase.getBlock(blockId)

        if (block?.type === 'newsList') {
          nextUpdates = {
            ...nextUpdates,
            props: stripNewsListEnrichedProps(nextUpdates.props as Record<string, unknown>),
          }
        }
      }

      const updated = await updateBlockOriginal(blockId, nextUpdates)

      if (updated?.type === 'newsList' && updated.props) {
        return {
          ...updated,
          props: await enrichNewsListProps(updated.props as Record<string, unknown>),
        }
      }

      return updated
    }

    return useCase
  }, [])

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
      Object.entries(blockConfigs).map(([type, cfg]) => {
        const config = cfg as {
          title: string
          icon?: string
          render?: unknown
          fields?: Array<{ field: string; defaultValue?: unknown }>
          spacingOptions?: unknown
        }

        return {
          type,
          label: config.title,
          icon: config.icon,
          render: config.render,
          fields: config.fields,
          spacingOptions: config.spacingOptions,
          defaultSettings: {},
          defaultProps:
            config.fields?.reduce<Record<string, unknown>>((acc, field) => {
              acc[field.field] = field.defaultValue
              return acc
            }, {}) ?? {},
        }
      }) as NonNullable<IBlockBuilderProps['config']>['availableBlockTypes'],
    []
  )

  const [isEdit, setIsEdit] = useState(true)

  const handleSave = async (blocks: IBlock[]) => {
    const payload = serializeBlocksForStorage(blocks)

    try {
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        return false
      }

      return true
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      return false
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>BlockBuilder + Next.js (SSR)</h1>
        <p>
          Контент блоков рендерится на сервере. Режим:{' '}
          <strong>{isEdit ? 'редактирование' : 'просмотр'}</strong>
        </p>
        <div className="page-header__actions">
          <button type="button" className="mode-btn" onClick={() => setIsEdit(value => !value)}>
            Переключить режим
          </button>
        </div>
      </header>

      <main className="page-content">
        <BlockBuilderComponent
          config={{ availableBlockTypes }}
          blockManagementUseCase={blockManagementUseCase}
          apiSelectUseCase={apiSelectUseCase}
          customFieldRendererRegistry={customFieldRendererRegistry}
          onSave={handleSave}
          initialBlocks={initialBlocks as IBlock[]}
          controlsContainerClass="container"
          controlsFixedPosition="bottom"
          controlsOffset={20}
          isEdit={isEdit}
          warnOnPageLeave
        />
      </main>
    </>
  )
}
