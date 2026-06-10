import { CSS_CLASSES } from '../../utils/constants';
import {
  afterPaint,
  waitForLayoutStable,
} from '../../utils/scheduling';
import {
  resolveBlockScrollContainer,
  getBlocksLayoutRoot,
  scrollToElement,
  waitForElementScrollSettled,
} from '../../utils/scrollHelpers';

export interface IBlockScrollOptions {
  offsetTop?: number;
  offsetBottom?: number;
  behavior?: ScrollBehavior;
}

export class BlockScrollService {
  private static instance: BlockScrollService | null = null;
  private session = 0;

  static getInstance(): BlockScrollService {
    if (!BlockScrollService.instance) {
      BlockScrollService.instance = new BlockScrollService();
    }
    return BlockScrollService.instance;
  }

  cancelPending(): void {
    this.session += 1;
  }

  beginSession(): number {
    this.session += 1;
    return this.session;
  }

  async scrollToBlockWhenReady(
    blockId: string,
    options: IBlockScrollOptions,
    session: number
  ): Promise<void> {
    if (!this.isSessionActive(session)) {
      return;
    }

    await afterPaint();
    if (!this.isSessionActive(session)) {
      return;
    }

    const blocksContainer = getBlocksLayoutRoot();
    if (blocksContainer) {
      await waitForLayoutStable(blocksContainer);
    }

    if (!this.isSessionActive(session)) {
      return;
    }

    const blockElement = await this.waitForBlockElement(blockId, session);
    if (!blockElement) {
      return;
    }

    const behavior = options.behavior ?? 'smooth';
    await this.scrollToBlock(blockId, options, session);

    if (!this.isSessionActive(session)) {
      return;
    }

    if (behavior === 'smooth') {
      const scrollContainer = resolveBlockScrollContainer(blockElement);
      const scrollTarget = scrollContainer ?? document.documentElement;
      await waitForElementScrollSettled(scrollTarget);

      if (blocksContainer) {
        await waitForLayoutStable(blocksContainer);
      }

      if (!this.isSessionActive(session)) {
        return;
      }

      await this.scrollToBlock(blockId, { ...options, behavior: 'auto' }, session);
    }

    await afterPaint();
  }

  private isSessionActive(session: number): boolean {
    return session === this.session;
  }

  private async waitForBlockElement(
    blockId: string,
    session: number,
    maxAttempts = 30
  ): Promise<HTMLElement | null> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (!this.isSessionActive(session)) {
        return null;
      }

      const element = this.findBlockElement(blockId);
      if (element) {
        return element;
      }

      await afterPaint();
    }

    return this.isSessionActive(session) ? this.findBlockElement(blockId) : null;
  }

  private async scrollToBlock(
    blockId: string,
    options: IBlockScrollOptions,
    session: number
  ): Promise<boolean> {
    if (!this.isSessionActive(session)) {
      return false;
    }

    const blockElement = this.findBlockElement(blockId);
    if (!blockElement) {
      return false;
    }

    const offsetTop = options.offsetTop ?? 24;
    const behavior = options.behavior ?? 'smooth';
    const scrollContainer = resolveBlockScrollContainer(blockElement);

    await scrollToElement(blockElement, {
      offset: offsetTop,
      behavior,
      container: scrollContainer ?? undefined,
    });

    return true;
  }

  private findBlockElement(blockId: string): HTMLElement | null {
    const escapedBlockId =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(blockId)
        : blockId.replaceAll(/["\\]/g, '\\$&');

    return document.querySelector(
      `.${CSS_CLASSES.BLOCK}[data-block-id="${escapedBlockId}"]`
    ) as HTMLElement | null;
  }
}

export const blockScrollService = BlockScrollService.getInstance();
