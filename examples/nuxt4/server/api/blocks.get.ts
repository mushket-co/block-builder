import { enrichBlocksForSsr } from '../utils/enrichBlocks'
import { readBlocksFromFile } from '../utils/blocksFile'

export default defineEventHandler(async () => {
  const blocks = await readBlocksFromFile()
  return enrichBlocksForSsr(blocks)
})
