import { createContext, useContext } from 'react';

import type { IBlockAnchorContext } from '../../utils/blockAnchorHelpers';
import { createEmptyBlockAnchorContext } from '../../utils/blockAnchorHelpers';

export const BlockAnchorContext = createContext<IBlockAnchorContext>(
  createEmptyBlockAnchorContext()
);

export function useBlockAnchorContext(): IBlockAnchorContext {
  return useContext(BlockAnchorContext);
}
