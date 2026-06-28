import { CSS_CLASSES, REPEATER_ACCORDION_ANIMATION_DELAY_MS } from '../../utils/constants';
import { focusElement } from '../../utils/formErrorHelpers';
import { afterPaint } from '../../utils/scheduling';
import { scrollToElement } from '../../utils/scrollHelpers';

export interface IRepeaterRef {
  isItemCollapsed?: (index: number) => boolean;
  expandItem?: (index: number) => void;
}

export class ValidationErrorHandler {
  private pendingTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(private repeaterRefs: Map<string, IRepeaterRef>) {}

  private getDirectRepeaterItems(container: HTMLElement): HTMLElement[] {
    const itemsContainer = container.querySelector(`.${CSS_CLASSES.REPEATER_CONTROL_ITEMS}`);

    if (itemsContainer) {
      return Array.from(itemsContainer.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement &&
          child.classList.contains(CSS_CLASSES.REPEATER_CONTROL_ITEM)
      );
    }

    return Array.from(container.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.classList.contains(CSS_CLASSES.REPEATER_CONTROL_ITEM)
    );
  }

  cancelPending(): void {
    if (this.pendingTimeoutId !== null) {
      clearTimeout(this.pendingTimeoutId);
      this.pendingTimeoutId = null;
    }
  }

  private isModalPresent(): boolean {
    return Boolean(
      document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) &&
        document.querySelector(`.${CSS_CLASSES.MODAL_CONTENT}`)
    );
  }

  async handleValidationErrors(
    formErrors: Record<string, string[]>,
    delay: number = 350
  ): Promise<void> {
    await this.scrollToFirstValidationError(formErrors, delay);
  }

  async navigateToValidationError(formErrors: Record<string, string[]>): Promise<void> {
    if (Object.keys(formErrors).length === 0) {
      return;
    }

    await this.scrollToFirstValidationError(formErrors, 100);
  }

  private async scrollToFirstValidationError(
    formErrors: Record<string, string[]>,
    delay: number
  ): Promise<void> {
    this.cancelPending();
    await afterPaint();

    if (!this.isModalPresent()) {
      return;
    }

    this.pendingTimeoutId = setTimeout(async () => {
      this.pendingTimeoutId = null;

      if (!this.isModalPresent()) {
        return;
      }

      const modalBody = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;
      const modalContent = document.querySelector(`.${CSS_CLASSES.MODAL_CONTENT}`) as HTMLElement;

      if (!modalBody || !modalContent) {
        return;
      }

      await this.openRepeaterAccordionsForErrors(formErrors);
      if (!this.isModalPresent()) {
        return;
      }

      await afterPaint();
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!this.isModalPresent()) {
        return;
      }

      const firstErrorField = modalBody.querySelector(`.${CSS_CLASSES.ERROR}`) as HTMLElement;

      if (firstErrorField) {
        scrollToElement(firstErrorField, {
          offset: 40,
          behavior: 'smooth',
          container: modalContent,
        });
        await afterPaint();
        focusElement(firstErrorField);
      }
    }, delay);
  }

  private async openRepeaterAccordionsForErrors(
    formErrors: Record<string, string[]>
  ): Promise<void> {
    const openedPathKeys = new Set<string>();

    for (const errorKey of Object.keys(formErrors)) {
      const repeaterPaths = this.parseRepeaterPaths(errorKey);

      for (let depth = 0; depth < repeaterPaths.length; depth += 1) {
        const partialPath = repeaterPaths.slice(0, depth + 1);
        const pathKey = partialPath
          .map(segment => `${segment.fieldName}[${segment.index}]`)
          .join('.');

        if (openedPathKeys.has(pathKey)) {
          continue;
        }

        openedPathKeys.add(pathKey);
        await this.expandRepeaterItemAtPath(partialPath);
      }
    }
  }

  private async waitForAccordionAnimation(): Promise<void> {
    await afterPaint();
    await new Promise(resolve =>
      setTimeout(resolve, Math.min(REPEATER_ACCORDION_ANIMATION_DELAY_MS, 150))
    );
  }

  private async expandRepeaterItemAtPath(
    path: Array<{ fieldName: string; index: number }>
  ): Promise<void> {
    if (path.length === 0) {
      return;
    }

    await afterPaint();

    const modalBody = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;
    if (!modalBody) {
      return;
    }

    let scope: HTMLElement = modalBody;

    for (let depth = 0; depth < path.length; depth += 1) {
      const { fieldName, index } = path[depth];

      if (depth === 0) {
        const repeaterComponent = this.repeaterRefs.get(fieldName);
        const collapsedViaRef = repeaterComponent?.isItemCollapsed?.(index) ?? false;

        if (collapsedViaRef && repeaterComponent?.expandItem) {
          repeaterComponent.expandItem(index);
          await this.waitForAccordionAnimation();
        }
      }

      const repeaterContainer = scope.querySelector(
        `.${CSS_CLASSES.REPEATER_CONTROL}[data-field-name="${fieldName}"]`
      ) as HTMLElement | null;

      if (!repeaterContainer) {
        return;
      }

      const items = this.getDirectRepeaterItems(repeaterContainer);
      if (index >= items.length) {
        return;
      }

      const item = items[index];
      const isCollapsed = item.classList.contains(CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED);

      if (depth > 0 && isCollapsed) {
        this.clickRepeaterExpandButton(item);
        await this.waitForAccordionAnimation();
      } else if (depth === 0 && isCollapsed && !this.repeaterRefs.get(fieldName)?.expandItem) {
        this.clickRepeaterExpandButton(item);
        await this.waitForAccordionAnimation();
      }

      scope = item;
    }
  }

  private clickRepeaterExpandButton(item: HTMLElement): void {
    const collapseButton = item.querySelector(
      `.${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}`
    ) as HTMLElement | null;

    collapseButton?.click();
  }

  private parseRepeaterPaths(errorKey: string): Array<{ fieldName: string; index: number }> {
    const paths: Array<{ fieldName: string; index: number }> = [];
    let remainingPath = errorKey;

    while (remainingPath) {
      const repeaterMatch = remainingPath.match(/^([A-Z_a-z]+)\[(\d+)]/);
      if (repeaterMatch) {
        paths.push({
          fieldName: repeaterMatch[1],
          index: Number.parseInt(repeaterMatch[2], 10),
        });
        remainingPath = remainingPath.slice(repeaterMatch[0].length);
        if (remainingPath.startsWith('.')) {
          remainingPath = remainingPath.slice(1);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return paths;
  }
}
