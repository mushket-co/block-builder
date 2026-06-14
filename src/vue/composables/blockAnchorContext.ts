import type { IBlockAnchorContext } from '../../utils/blockAnchorHelpers';
import { createEmptyBlockAnchorContext } from '../../utils/blockAnchorHelpers';

export const BLOCK_ANCHOR_CONTEXT_KEY = Symbol('blockAnchorContext');

export type TBlockAnchorContextRef = {
  readonly value: IBlockAnchorContext;
};

export function createDefaultBlockAnchorContextRef(): TBlockAnchorContextRef {
  return {
    get value() {
      return createEmptyBlockAnchorContext();
    },
  };
}
