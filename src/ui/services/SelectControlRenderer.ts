import { CSS_CLASSES } from '../../utils/constants';
import {
  BaseDropdownRenderer,
  IBaseDropdownRendererOptions,
  IDropdownOption,
} from './BaseDropdownRenderer';

export interface ISelectControlOptions extends IBaseDropdownRendererOptions {
  options: IDropdownOption[];
}

export class SelectControlRenderer extends BaseDropdownRenderer {
  private options: IDropdownOption[];
  private highlightedIndex = -1;

  constructor(options: ISelectControlOptions) {
    super(options);
    this.options = options.options || [];
  }

  protected getOptions(): IDropdownOption[] {
    return this.options;
  }

  protected createDropdownElement(): HTMLElement {
    const dropdown = document.createElement('div');
    dropdown.className = CSS_CLASSES.BB_DROPDOWN_PANEL;
    dropdown.setAttribute('role', 'listbox');
    dropdown.setAttribute('aria-multiselectable', String(this.multiple));

    const content = document.createElement('div');
    content.className = CSS_CLASSES.BB_DROPDOWN_CONTENT;

    if (this.options.length === 0) {
      content.innerHTML = `<div class="${CSS_CLASSES.BB_DROPDOWN_MESSAGE}">Нет данных</div>`;
      dropdown.append(content);
      return dropdown;
    }

    const list = document.createElement('ul');
    list.className = CSS_CLASSES.BB_DROPDOWN_LIST;

    this.options.forEach(option => {
      const item = document.createElement('li');
      item.className = CSS_CLASSES.BB_DROPDOWN_OPTION;
      if (this.isOptionSelected(option.value)) {
        item.classList.add(CSS_CLASSES.BB_DROPDOWN_OPTION_SELECTED);
      }
      if (option.disabled) {
        item.classList.add(CSS_CLASSES.BB_DROPDOWN_OPTION_DISABLED);
      }
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(this.isOptionSelected(option.value)));
      item.dataset.optionValue = String(option.value);

      item.innerHTML = `
        <span class="${CSS_CLASSES.BB_DROPDOWN_OPTION_LABEL}">${this.escapeHtml(option.label)}</span>
        ${this.isOptionSelected(option.value) ? `<span class="${CSS_CLASSES.BB_DROPDOWN_OPTION_CHECK}">✓</span>` : ''}
      `;

      if (!option.disabled) {
        item.addEventListener('click', e => {
          e.stopPropagation();
          e.preventDefault();
          this.selectOption(option.value);
        });
      }

      list.append(item);
    });

    content.append(list);
    dropdown.append(content);
    this.attachDropdownEvents(dropdown);
    this.attachKeyboardNavigation(dropdown);

    return dropdown;
  }

  protected updateDropdownContent(): void {
    if (!this.container) {
      return;
    }

    this.updateDisplayValue();
    let savedScrollTop = 0;
    if (this.dropdownElement) {
      const contentElement = this.dropdownElement.querySelector(
        `.${CSS_CLASSES.BB_DROPDOWN_CONTENT}`
      ) as HTMLElement;
      if (contentElement) {
        savedScrollTop = contentElement.scrollTop;
      }
    }

    if (this.dropdownElement && this.dropdownElement.parentNode) {
      this.dropdownElement.remove();
      this.dropdownElement = undefined;
    }

    const triggerElement = this.container.querySelector(
      `.${CSS_CLASSES.BB_DROPDOWN_CONTROL}`
    ) as HTMLElement;
    if (triggerElement) {
      this.triggerElement = triggerElement;
      if (this.isDropdownOpen) {
        triggerElement.classList.add(CSS_CLASSES.BB_DROPDOWN_OPEN);
        triggerElement.setAttribute('aria-expanded', 'true');
      } else {
        triggerElement.classList.remove(CSS_CLASSES.BB_DROPDOWN_OPEN);
        triggerElement.setAttribute('aria-expanded', 'false');
      }
    }

    if (this.isDropdownOpen) {
      const dropdown = this.createDropdownElement();
      this.dropdownElement = dropdown;
      dropdown.setAttribute('tabindex', '-1');
      document.body.append(dropdown);
      this.updateDropdownPosition();

      if (savedScrollTop > 0) {
        const contentElement = dropdown.querySelector(
          `.${CSS_CLASSES.BB_DROPDOWN_CONTENT}`
        ) as HTMLElement;
        if (contentElement) {
          contentElement.scrollTop = savedScrollTop;
        }
      }

      setTimeout(() => {
        dropdown.focus();
      }, 0);
    }
  }

  private selectOption(optionValue: string | number): void {
    if (this.multiple) {
      const currentValue = (this.value as (string | number)[]) || [];

      this.value = currentValue.includes(optionValue)
        ? currentValue.filter(v => v !== optionValue)
        : [...currentValue, optionValue];
      this.updateHiddenInput();
      this.updateDropdownContent();
    } else {
      this.value = optionValue;
      this.updateHiddenInput();
      this.updateDisplayValue();
      this.emitChange();
      this.closeDropdown();
    }

    if (this.multiple) {
      this.emitChange();
    }
  }

  private getDisplayValue(): string {
    if (this.multiple) {
      const selectedOptions = this.options.filter(opt => this.isOptionSelected(opt.value));
      if (selectedOptions.length === 0) {
        return '';
      }
      const limit = 3;
      const visible = selectedOptions.slice(0, limit);
      const rest = selectedOptions.length - limit;
      const labels = visible.map(opt => opt.label);
      if (rest > 0) {
        labels.push(`+${rest}`);
      }
      return labels.join(', ');
    }

    if (this.value === null || this.value === undefined || this.value === '') {
      return '';
    }

    const option = this.options.find(opt => opt.value === this.value);
    return option?.label ?? '';
  }

  private updateDisplayValue(): void {
    if (!this.container) {
      return;
    }

    const displayValue = this.getDisplayValue();
    const valueElement = this.container.querySelector(`.${CSS_CLASSES.BB_DROPDOWN_VALUE}`);
    const hasValue = this.hasValue();
    const showClear = !this.isRequired() && hasValue;

    if (valueElement) {
      valueElement.innerHTML = displayValue
        ? `<span class="${CSS_CLASSES.BB_DROPDOWN_SINGLE}">${this.escapeHtml(displayValue)}</span>`
        : `<span class="${CSS_CLASSES.BB_DROPDOWN_PLACEHOLDER}">${this.escapeHtml(this.placeholder)}</span>`;
    }

    const clearButton = this.container.querySelector('[data-select-clear]');
    if (showClear) {
      if (!clearButton) {
        const controlElement = this.container.querySelector(`.${CSS_CLASSES.BB_DROPDOWN_CONTROL}`);
        if (controlElement) {
          const clearBtn = document.createElement('button');
          clearBtn.type = 'button';
          clearBtn.className = CSS_CLASSES.BB_DROPDOWN_CLEAR;
          clearBtn.dataset.selectClear = '';
          clearBtn.textContent = '✕';
          clearBtn.addEventListener('click', e => {
            e.stopPropagation();
            e.preventDefault();
            this.clearSelection();
          });
          const arrowElement = controlElement.querySelector(`.${CSS_CLASSES.BB_DROPDOWN_ARROW}`);
          if (arrowElement) {
            arrowElement.before(clearBtn);
          } else {
            controlElement.append(clearBtn);
          }
        }
      }
    } else {
      if (clearButton) {
        clearButton.remove();
      }
    }

    if (this.multiple) {
      const selectedContainer = this.container.querySelector(
        `.${CSS_CLASSES.BB_API_SELECT_SELECTED}`
      );
      if (hasValue) {
        const tagsHtml = this.renderSelectedTags();
        if (selectedContainer) {
          selectedContainer.outerHTML = tagsHtml;
          this.attachRemoveTagHandlers();
        } else {
          const dropdownElement = this.container.querySelector(`.${CSS_CLASSES.BB_DROPDOWN}`);
          if (dropdownElement) {
            dropdownElement.insertAdjacentHTML('beforeend', tagsHtml);
            this.attachRemoveTagHandlers();
          }
        }
      } else {
        if (selectedContainer) {
          selectedContainer.remove();
        }
      }
    }
  }

  private attachRemoveTagHandlers(): void {
    if (!this.container) {
      return;
    }

    const removeButtons = this.container.querySelectorAll('[data-select-remove]');
    removeButtons.forEach(button => {
      button.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        const htmlButton = button as HTMLElement;
        const value = htmlButton.dataset.selectRemove;
        if (value) {
          this.removeOption(this.parseValue(value));
        }
      });
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render(container: HTMLElement): void {
    this.container = container;

    const displayValue = this.getDisplayValue();
    const hasValue = this.hasValue();
    const showClear = !this.isRequired() && hasValue;

    const html = `
      <div class="${CSS_CLASSES.BB_DROPDOWN}">
        <div
          class="${CSS_CLASSES.BB_DROPDOWN_CONTROL} ${this.isDropdownOpen ? CSS_CLASSES.BB_DROPDOWN_OPEN : ''}"
          role="combobox"
          aria-expanded="${this.isDropdownOpen}"
          aria-haspopup="listbox"
          tabindex="0"
        >
          <div class="${CSS_CLASSES.BB_DROPDOWN_VALUE}">
            ${displayValue ? `<span class="${CSS_CLASSES.BB_DROPDOWN_SINGLE}">${this.escapeHtml(displayValue)}</span>` : `<span class="${CSS_CLASSES.BB_DROPDOWN_PLACEHOLDER}">${this.escapeHtml(this.placeholder)}</span>`}
          </div>
          ${showClear ? `<button type="button" class="${CSS_CLASSES.BB_DROPDOWN_CLEAR}" data-select-clear>✕</button>` : ''}
          <span class="${CSS_CLASSES.BB_DROPDOWN_ARROW} ${this.isDropdownOpen ? CSS_CLASSES.BB_DROPDOWN_ARROW_OPEN : ''}">▼</span>
        </div>
        ${this.multiple && hasValue ? this.renderSelectedTags() : ''}
        ${this.errors[this.fieldName] ? `<div class="${CSS_CLASSES.FORM_ERRORS}"><span class="${CSS_CLASSES.ERROR}">${this.errors[this.fieldName].join(', ')}</span></div>` : ''}
        <input type="hidden" name="${this.fieldName}" value="${this.multiple && Array.isArray(this.value) ? JSON.stringify(this.value) : (this.value ?? '')}" />
      </div>
    `;

    const placeholderElement = container.querySelector(`.${CSS_CLASSES.SELECT_PLACEHOLDER}`);
    if (placeholderElement) {
      placeholderElement.outerHTML = html;
    } else {
      container.innerHTML = html;
    }
  }

  private renderSelectedTags(): string {
    const selectedOptions = this.options.filter(opt => this.isOptionSelected(opt.value));
    if (selectedOptions.length === 0) {
      return '';
    }

    return `
      <div class="${CSS_CLASSES.BB_API_SELECT_SELECTED}">
        ${selectedOptions
          .map(
            opt => `
          <div class="${CSS_CLASSES.BB_API_SELECT_TAG}">
            <span class="${CSS_CLASSES.BB_API_SELECT_TAG_NAME}">${this.escapeHtml(opt.label)}</span>
            <span class="${CSS_CLASSES.BB_API_SELECT_TAG_REMOVE}" data-select-remove="${opt.value}">✕</span>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  async init(container: HTMLElement): Promise<void> {
    this.render(container);
    this.attachEvents(container);

    setTimeout(() => {
      document.addEventListener('mousedown', this.handleClickOutsideBound, true);
      window.addEventListener('resize', this.handleResizeBound);
      window.addEventListener('scroll', this.handleScrollBound, true);
    }, 0);
  }

  private attachEvents(container: HTMLElement): void {
    const trigger = container.querySelector(`.${CSS_CLASSES.BB_DROPDOWN_CONTROL}`) as HTMLElement;
    if (trigger) {
      this.triggerElement = trigger;

      trigger.addEventListener('click', e => {
        e.stopPropagation();
        this.toggleDropdown();
      });

      trigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleDropdown();
        } else if (e.key === 'Escape' && this.isDropdownOpen) {
          e.preventDefault();
          this.closeDropdown();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (!this.isDropdownOpen) {
            this.openDropdown();
          }
          this.handleKeyboardNavigation(e.key);
        }
      });
    }

    const clearButton = container.querySelector('[data-select-clear]');
    if (clearButton) {
      clearButton.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        this.clearSelection();
      });
    }

    this.attachRemoveTagHandlers();
  }

  private clearSelection(): void {
    this.value = this.multiple ? [] : null;

    this.updateHiddenInput();
    this.emitChange();
    this.updateDropdownContent();
  }

  private removeOption(optionValue: string | number): void {
    if (!this.multiple) {
      return;
    }

    const currentValue = (this.value as (string | number)[]) || [];
    this.value = currentValue.filter(v => v !== optionValue);

    this.updateHiddenInput();
    this.emitChange();
    this.updateDropdownContent();
  }

  private parseValue(value: string): string | number {
    const numValue = Number(value);
    return Number.isNaN(numValue) ? value : numValue;
  }

  private attachKeyboardNavigation(dropdown: HTMLElement): void {
    dropdown.addEventListener('keydown', e => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowUp': {
          e.preventDefault();
          this.handleKeyboardNavigation(e.key);

          break;
        }
        case 'Enter': {
          e.preventDefault();
          this.selectHighlightedOption();

          break;
        }
        case 'Escape': {
          e.preventDefault();
          this.closeDropdown();
          this.triggerElement?.focus();

          break;
        }
        // No default
      }
    });
  }

  private handleKeyboardNavigation(key: string): void {
    if (!this.dropdownElement) {
      return;
    }

    const options = Array.from(
      this.dropdownElement.querySelectorAll<HTMLElement>(
        `.${CSS_CLASSES.BB_DROPDOWN_OPTION}:not(.${CSS_CLASSES.BB_DROPDOWN_OPTION_DISABLED})`
      )
    );

    if (options.length === 0) {
      return;
    }

    if (key === 'ArrowDown') {
      this.highlightedIndex =
        this.highlightedIndex < options.length - 1 ? this.highlightedIndex + 1 : 0;
    } else if (key === 'ArrowUp') {
      this.highlightedIndex =
        this.highlightedIndex > 0 ? this.highlightedIndex - 1 : options.length - 1;
    }

    options.forEach(option => {
      option.classList.remove(CSS_CLASSES.BB_DROPDOWN_OPTION_HIGHLIGHTED);
    });

    if (this.highlightedIndex >= 0 && this.highlightedIndex < options.length) {
      const highlightedOption = options[this.highlightedIndex];
      highlightedOption.classList.add(CSS_CLASSES.BB_DROPDOWN_OPTION_HIGHLIGHTED);
      highlightedOption.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  private selectHighlightedOption(): void {
    if (!this.dropdownElement || this.highlightedIndex < 0) {
      return;
    }

    const options = Array.from(
      this.dropdownElement.querySelectorAll<HTMLElement>(
        `.${CSS_CLASSES.BB_DROPDOWN_OPTION}:not(.${CSS_CLASSES.BB_DROPDOWN_OPTION_DISABLED})`
      )
    );

    if (this.highlightedIndex >= 0 && this.highlightedIndex < options.length) {
      const option = options[this.highlightedIndex];
      const value = option.dataset.optionValue;
      if (value) {
        this.selectOption(this.parseValue(value));
      }
    }
  }

  protected openDropdown(): void {
    if (!this.isDropdownOpen) {
      this.isDropdownOpen = true;
      this.highlightedIndex = -1;
      this.updateDropdownContent();
    }
  }

  destroy(): void {
    document.removeEventListener('mousedown', this.handleClickOutsideBound, true);
    window.removeEventListener('resize', this.handleResizeBound);
    window.removeEventListener('scroll', this.handleScrollBound, true);

    if (this.dropdownElement && this.dropdownElement.parentNode) {
      this.dropdownElement.remove();
      this.dropdownElement = undefined;
    }
  }

  getValue(): string | number | (string | number)[] | null {
    return this.value;
  }

  setValue(value: string | number | (string | number)[] | null): void {
    this.value = value;
    this.updateHiddenInput();
    this.updateDropdownContent();
  }
}
