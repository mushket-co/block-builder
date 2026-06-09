import { CSS_CLASSES } from '../../utils/constants';
import {
  afterPaint,
  waitForLayoutStable,
} from '../../utils/scheduling';
import { getScrollContainer, getBlocksLayoutRoot, waitForElementScrollSettled } from '../../utils/scrollHelpers';

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

    if (!this.scrollToBlock(blockId, options, session)) {
      return;
    }

    const blockElement = this.findBlockElement(blockId);
    if (!blockElement) {
      return;
    }

    const scrollContainer = getScrollContainer(blockElement);
    const behavior = options.behavior ?? 'smooth';

    if (behavior === 'smooth') {
      const scrollTarget = scrollContainer ?? document.documentElement;
      await waitForElementScrollSettled(scrollTarget);
    } else {
      await afterPaint();
    }

    if (!this.isSessionActive(session)) {
      return;
    }

    const offsetTop = options.offsetTop ?? 24;
    const offsetBottom = options.offsetBottom ?? 24;

    if (
      !this.isBlockTopVisible(blockElement, scrollContainer, offsetTop, offsetBottom)
    ) {
      this.scrollToBlock(blockId, { ...options, behavior: 'auto' }, session);
      await afterPaint();
    }
  }

  private isSessionActive(session: number): boolean {
    return session === this.session;
  }

  private scrollToBlock(
    blockId: string,
    options: IBlockScrollOptions,
    session: number
  ): boolean {
    if (!this.isSessionActive(session)) {
      return false;
    }

    const blockElement = this.findBlockElement(blockId);
    if (!blockElement) {
      return false;
    }

    const offsetTop = options.offsetTop ?? 24;
    const offsetBottom = options.offsetBottom ?? 24;
    const behavior = options.behavior ?? 'smooth';

    const previousMarginTop = blockElement.style.scrollMarginTop;
    const previousMarginBottom = blockElement.style.scrollMarginBottom;

    blockElement.style.scrollMarginTop = `${offsetTop}px`;
    blockElement.style.scrollMarginBottom = `${offsetBottom}px`;

    blockElement.scrollIntoView({
      behavior,
      block: 'start',
      inline: 'nearest',
    });

    void this.restoreScrollMargins(
      blockElement,
      previousMarginTop,
      previousMarginBottom,
      behavior,
      session
    );

    return true;
  }

  private async restoreScrollMargins(
    blockElement: HTMLElement,
    previousMarginTop: string,
    previousMarginBottom: string,
    behavior: ScrollBehavior,
    session: number
  ): Promise<void> {
    if (behavior === 'smooth') {
      const scrollContainer = getScrollContainer(blockElement) ?? document.documentElement;
      await waitForElementScrollSettled(scrollContainer);
    } else {
      await afterPaint();
    }

    if (!this.isSessionActive(session) || !blockElement.isConnected) {
      return;
    }

    blockElement.style.scrollMarginTop = previousMarginTop;
    blockElement.style.scrollMarginBottom = previousMarginBottom;
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

  private isBlockTopVisible(
    element: HTMLElement,
    scrollContainer: HTMLElement | null,
    offsetTop: number,
    offsetBottom: number
  ): boolean {
    const elementRect = element.getBoundingClientRect();

    if (!scrollContainer) {
      return (
        elementRect.top >= offsetTop && elementRect.top <= window.innerHeight - offsetBottom
      );
    }

    const containerRect = scrollContainer.getBoundingClientRect();

    return (
      elementRect.top >= containerRect.top + offsetTop &&
      elementRect.top <= containerRect.bottom - offsetBottom
    );
  }
}

export const blockScrollService = BlockScrollService.getInstance();
