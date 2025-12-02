import { nextTick } from 'vue';

import { CSS_CLASSES, REPEATER_ACCORDION_ANIMATION_DELAY_MS } from '../../utils/constants';
import { focusElement, scrollToElement } from '../../utils/formErrorHelpers';

export interface IRepeaterRef {
  isItemCollapsed?: (index: number) => boolean;
  expandItem?: (index: number) => void;
}

export class ValidationErrorHandler {
  constructor(private repeaterRefs: Map<string, IRepeaterRef>) {}

  async handleValidationErrors(
    formErrors: Record<string, string[]>,
    delay: number = 350
  ): Promise<void> {
    await nextTick();

    const modalBody = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;
    const modalContent = document.querySelector(`.${CSS_CLASSES.MODAL_CONTENT}`) as HTMLElement;

    if (!modalBody || !modalContent) {
      return;
    }

    setTimeout(async () => {
      await this.openRepeaterAccordionsForErrors(formErrors);
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      const firstErrorField = modalBody.querySelector(`.${CSS_CLASSES.ERROR}`) as HTMLElement;

      if (firstErrorField) {
        scrollToElement(firstErrorField, {
          offset: 40,
          behavior: 'smooth',
          container: modalContent,
        });
        await nextTick();
        focusElement(firstErrorField);
      }
    }, delay);
  }

  private async openRepeaterAccordionsForErrors(
    formErrors: Record<string, string[]>
  ): Promise<void> {
    const errorKeys = Object.keys(formErrors);
    const openedRepeaters = new Set<string>();

    for (const errorKey of errorKeys) {
      const repeaterPaths = this.parseRepeaterPaths(errorKey);

      for (let i = 0; i < repeaterPaths.length; i++) {
        const path = repeaterPaths[i];
        const repeaterKey = `${path.fieldName}[${path.index}]`;

        if (!openedRepeaters.has(repeaterKey)) {
          openedRepeaters.add(repeaterKey);

          if (i === 0) {
            await this.openRepeaterAccordion(path.fieldName, path.index);
          } else {
            const parentPath = repeaterPaths[i - 1];
            await this.openNestedRepeaterAccordion(
              parentPath.fieldName,
              parentPath.index,
              path.fieldName,
              path.index
            );
          }
        }
      }
    }
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

  private async openRepeaterAccordion(repeaterFieldName: string, itemIndex: number): Promise<void> {
    await nextTick();

    const repeaterComponent = this.repeaterRefs.get(repeaterFieldName);

    if (repeaterComponent) {
      const isCollapsed =
        repeaterComponent.isItemCollapsed && repeaterComponent.isItemCollapsed(itemIndex);

      if (isCollapsed && repeaterComponent.expandItem) {
        repeaterComponent.expandItem(itemIndex);
        await nextTick();
        await new Promise(resolve =>
          setTimeout(resolve, Math.min(REPEATER_ACCORDION_ANIMATION_DELAY_MS, 150))
        );
      }
    }
  }

  private async openNestedRepeaterAccordion(
    parentFieldName: string,
    parentIndex: number,
    nestedFieldName: string,
    nestedIndex: number
  ): Promise<void> {
    await nextTick();

    const parentRepeaterComponent = this.repeaterRefs.get(parentFieldName);

    if (parentRepeaterComponent) {
      const isParentCollapsed =
        parentRepeaterComponent.isItemCollapsed &&
        parentRepeaterComponent.isItemCollapsed(parentIndex);

      if (isParentCollapsed && parentRepeaterComponent.expandItem) {
        parentRepeaterComponent.expandItem(parentIndex);
        await nextTick();
        await new Promise(resolve =>
          setTimeout(resolve, Math.min(REPEATER_ACCORDION_ANIMATION_DELAY_MS, 150))
        );
      }

      await nextTick();

      const modalBody = document.querySelector(`.${CSS_CLASSES.MODAL_BODY}`) as HTMLElement;
      if (!modalBody) {
        return;
      }

      const parentRepeaterContainer = modalBody.querySelector(
        `[data-field-name="${parentFieldName}"]`
      ) as HTMLElement;
      if (!parentRepeaterContainer) {
        return;
      }

      const parentItems = parentRepeaterContainer.querySelectorAll(
        `.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`
      );
      if (parentIndex >= parentItems.length) {
        return;
      }

      const parentItem = parentItems[parentIndex] as HTMLElement;
      const nestedRepeaterContainer = parentItem.querySelector(
        `[data-field-name="${nestedFieldName}"]`
      ) as HTMLElement;
      if (!nestedRepeaterContainer) {
        return;
      }

      const nestedItems = nestedRepeaterContainer.querySelectorAll(
        `.${CSS_CLASSES.REPEATER_CONTROL_ITEM}`
      );
      if (nestedIndex >= nestedItems.length) {
        return;
      }

      const nestedItem = nestedItems[nestedIndex] as HTMLElement;
      const isNestedCollapsed = nestedItem.classList.contains(
        CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED
      );

      if (isNestedCollapsed) {
        const collapseButton = nestedItem.querySelector(
          `.${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}`
        ) as HTMLElement;
        if (collapseButton) {
          collapseButton.click();
          await nextTick();
          await new Promise(resolve =>
            setTimeout(resolve, Math.min(REPEATER_ACCORDION_ANIMATION_DELAY_MS, 150))
          );
        }
      }
    }
  }
}
