import { enrichBlocksForSsr } from '../utils/enrichBlocks'
import { writeBlocksToFile } from '../utils/blocksFile'
import { serializeBlocksForStorage } from '#shared/utils/serializeBlocks'

export default defineEventHandler(async (event) => {
  const body = await readBody<unknown[]>(event)
  const blocks = enrichBlocksForSsr(
    serializeBlocksForStorage(Array.isArray(body) ? body : [])
  )

  await writeBlocksToFile(blocks)

  return {
    ok: true,
    count: blocks.length,
    path: 'data/blocks.json',
  }
})
