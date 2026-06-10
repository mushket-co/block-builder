import { stripDataUrlsForStorage } from '../../shared/blockStorage.js'

import { stripNewsListEnrichedProps } from './stripEnrichedProps'

type TJsonRecord = Record<string, unknown>

function stripRenderComponent(render: unknown): unknown {
  if (!render || typeof render !== 'object') {
    return render
  }

  const source = render as TJsonRecord
  const { component: _component, ...rest } = source

  return rest
}

function serializeProps(type: unknown, props: unknown): unknown {
  if (!props || typeof props !== 'object') {
    return props
  }

  let nextProps = { ...(props as TJsonRecord) }

  if (type === 'newsList') {
    nextProps = stripNewsListEnrichedProps(nextProps)
  }

  return stripDataUrlsForStorage(nextProps)
}

function serializeBlock(block: unknown): unknown {
  if (!block || typeof block !== 'object') {
    return block
  }

  const source = block as TJsonRecord
  const { render, props, ...rest } = source

  const next: TJsonRecord = { ...rest }

  if (render !== undefined) {
    next.render = stripRenderComponent(render)
  }

  if (props !== undefined) {
    next.props = serializeProps(next.type, props)
  }

  return next
}

export function serializeBlocksForStorage(blocks: unknown[]): unknown[] {
  return Array.isArray(blocks) ? blocks.map(serializeBlock) : []
}
