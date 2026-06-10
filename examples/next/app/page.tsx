import { BlockBuilderEditor } from './BlockBuilderEditor'
import { enrichBlocksForSsr } from '@/lib/enrichBlocks'
import { readBlocksFromFile } from '@/lib/blocksFile'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const initialBlocks = enrichBlocksForSsr(await readBlocksFromFile())

  return (
    <div className="page">
      <BlockBuilderEditor initialBlocks={initialBlocks} />
    </div>
  )
}
