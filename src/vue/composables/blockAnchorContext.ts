import type { IBlockAnchorContext } from '../../utils/blockAnchorHelpers';

export const BLOCK_ANCHOR_CONTEXT_KEY = Symbol('blockAnchorContext');

export type TBlockAnchorContextRef = {
  readonly value: IBlockAnchorContext;
};
