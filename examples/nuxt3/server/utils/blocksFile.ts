import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const BLOCKS_FILE = join(fileURLToPath(new URL('../../data/blocks.json', import.meta.url)))

export function getBlocksFilePath(): string {
  return BLOCKS_FILE
}

export async function readBlocksFromFile(): Promise<unknown[]> {
  try {
    const raw = await readFile(BLOCKS_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export async function writeBlocksToFile(blocks: unknown[]): Promise<void> {
  await mkdir(dirname(BLOCKS_FILE), { recursive: true })
  await writeFile(BLOCKS_FILE, `${JSON.stringify(blocks, null, 2)}\n`, 'utf-8')
}
