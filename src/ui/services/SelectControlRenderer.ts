import { BaseDropdownRenderer, IDropdownOption, IBaseDropdownRendererOptions } from './BaseDropdownRenderer';

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
    dropdown.className = 'bb-dropdown__panel';
    dropdown.setAttribute('role', 'listbox');
    dropdown.setAttribute('aria-multiselectable', String(this.multiple));

    const content = document.createElement('div');
    content.className = 'bb-dropdown__content';

    if (this.options.length === 0) {
      content.innerHTML = '<div class="bb-dropdown__message">Нет данных</div>';
      dropdown.appendChild(content);
      return dropdown;
    }

    const list = document.createElement('ul');
    list.className = 'bb-dropdown__list';

    this.options.forEach(option => {
      const item = document.createElement('li');
      item.className = 'bb-dropdown__option';
      if (this.isOptionSelected(option.value)) {
        item.classList.add('bb-dropdown__option--selected');
      }
      if (option.disabled) {
        item.classList.add('bb-dropdown__option--disabled');
      }
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(this.isOptionSelected(option.value)));
      item.dataset.optionValue = String(option.value);

      item.innerHTML = `
        <span class="bb-dropdown__option-label">${this.escapeHtml(option.label)}</span>
        ${this.isOptionSelected(option.value) ? '<span class="bb-dropdown__option-check">✓</span>' : ''}
      `;

      if (!option.disabled) {
        item.addEventListener('click', e => {
          e.stopPropagation();
          e.preventDefault();
          this.selectOption(option.value);
        });
      }

      list.appendChild(item);
    });

    content.appendChild(list);
    dropdown.appendChild(content);
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
      const contentElement = this.dropdownElement.querySelector('.bb-dropdown__content') as HTMLElement;
      if (contentElement) {
        savedScrollTop = contentElement.scrollTop;
      }
    }

    if (this.dropdownElement && this.dropdownElement.parentNode) {
      this.dropdownElement.parentNode.removeChild(this.dropdownElement);
      this.dropdownElement = undefined;
    }

    const triggerElement = this.container.querySelector('.bb-dropdown__control') as HTMLElement;
    if (triggerElement) {
      this.triggerElement = triggerElement;
      if (this.isDropdownOpen) {
        triggerElement.classList.add('bb-dropdown--open');
        triggerElement.setAttribute('aria-expanded', 'true');
      } else {
        triggerElement.classList.remove('bb-dropdown--open');
        triggerElement.setAttribute('aria-expanded', 'false');
      }
    }

    if (this.isDropdownOpen) {
      const dropdown = this.createDropdownElement();
      this.dropdownElement = dropdown;
      dropdown.setAttribute('tabindex', '-1');
      document.body.appendChild(dropdown);
      this.updateDropdownPosition();

      if (savedScrollTop > 0) {
        const contentElement = dropdown.querySelector('.bb-dropdown__content') as HTMLElement;
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

      if (currentValue.includes(optionValue)) {
        this.value = currentValue.filter(v => v !== optionValue);
      } else {
        this.value = [...currentValue, optionValue];
      }
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
    const valueElement = this.container.querySelector('.bb-dropdown__value');
    const hasValue = this.hasValue();
    const showClear = !this.isRequired() && hasValue;

    if (valueElement) {
      valueElement.innerHTML = displayValue
        ? `<span class="bb-dropdown__single">${this.escapeHtml(displayValue)}</span>`
        : `<span class="bb-dropdown__placeholder">${this.escapeHtml(this.placeholder)}</span>`;
    }

    const clearButton = this.container.querySelector('[data-select-clear]');
    if (showClear) {
      if (!clearButton) {
        const controlElement = this.container.querySelector('.bb-dropdown__control');
        if (controlElement) {
          const clearBtn = document.createElement('button');
          clearBtn.type = 'button';
          clearBtn.className = 'bb-dropdown__clear';
          clearBtn.setAttribute('data-select-clear', '');
          clearBtn.textContent = '✕';
          clearBtn.addEventListener('click', e => {
            e.stopPropagation();
            e.preventDefault();
            this.clearSelection();
          });
          const arrowElement = controlElement.querySelector('.bb-dropdown__arrow');
          if (arrowElement) {
            controlElement.insertBefore(clearBtn, arrowElement);
          } else {
            controlElement.appendChild(clearBtn);
          }
        }
      }
    } else {
      if (clearButton) {
        clearButton.remove();
      }
    }

    if (this.multiple) {
      const selectedContainer = this.container.querySelector('.bb-api-select__selected');
      if (hasValue) {
        const tagsHtml = this.renderSelectedTags();
        if (selectedContainer) {
          selectedContainer.outerHTML = tagsHtml;
          this.attachRemoveTagHandlers();
        } else {
          const dropdownElement = this.container.querySelector('.bb-dropdown');
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
        const value = button.getAttribute('data-select-remove');
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
      <div class="bb-dropdown">
        <div
          class="bb-dropdown__control ${this.isDropdownOpen ? 'bb-dropdown--open' : ''}"
          role="combobox"
          aria-expanded="${this.isDropdownOpen}"
          aria-haspopup="listbox"
          tabindex="0"
        >
          <div class="bb-dropdown__value">
            ${displayValue ? `<span class="bb-dropdown__single">${this.escapeHtml(displayValue)}</span>` : `<span class="bb-dropdown__placeholder">${this.escapeHtml(this.placeholder)}</span>`}
          </div>
          ${showClear ? '<button type="button" class="bb-dropdown__clear" data-select-clear>✕</button>' : ''}
          <span class="bb-dropdown__arrow ${this.isDropdownOpen ? 'bb-dropdown__arrow--open' : ''}">▼</span>
        </div>
        ${this.multiple && hasValue ? this.renderSelectedTags() : ''}
        ${this.errors[this.fieldName] ? `<div class="block-builder-form-errors"><span class="error">${this.errors[this.fieldName].join(', ')}</span></div>` : ''}
        <input type="hidden" name="${this.fieldName}" value="${this.multiple && Array.isArray(this.value) ? JSON.stringify(this.value) : (this.value ?? '')}" />
      </div>
    `;

    const placeholderElement = container.querySelector('.select-placeholder');
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
      <div class="bb-api-select__selected">
        ${selectedOptions
          .map(
            opt => `
          <div class="bb-api-select__tag">
            <span class="bb-api-select__tag-name">${this.escapeHtml(opt.label)}</span>
            <span class="bb-api-select__tag-remove" data-select-remove="${opt.value}">✕</span>
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
    const trigger = container.querySelector('.bb-dropdown__control') as HTMLElement;
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
    if (this.multiple) {
      this.value = [];
    } else {
      this.value = null;
    }

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
    return isNaN(numValue) ? value : numValue;
  }

  private attachKeyboardNavigation(dropdown: HTMLElement): void {
    dropdown.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.handleKeyboardNavigation(e.key);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.selectHighlightedOption();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeDropdown();
        this.triggerElement?.focus();
      }
    });
  }

  private handleKeyboardNavigation(key: string): void {
    if (!this.dropdownElement) {
      return;
    }

    const options = Array.from(
      this.dropdownElement.querySelectorAll<HTMLElement>('.bb-dropdown__option:not(.bb-dropdown__option--disabled)')
    );

    if (options.length === 0) {
      return;
    }

    if (key === 'ArrowDown') {
      this.highlightedIndex = this.highlightedIndex < options.length - 1 ? this.highlightedIndex + 1 : 0;
    } else if (key === 'ArrowUp') {
      this.highlightedIndex = this.highlightedIndex > 0 ? this.highlightedIndex - 1 : options.length - 1;
    }

    options.forEach(option => {
      option.classList.remove('bb-dropdown__option--highlighted');
    });

    if (this.highlightedIndex >= 0 && this.highlightedIndex < options.length) {
      const highlightedOption = options[this.highlightedIndex];
      highlightedOption.classList.add('bb-dropdown__option--highlighted');
      highlightedOption.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  private selectHighlightedOption(): void {
    if (!this.dropdownElement || this.highlightedIndex < 0) {
      return;
    }

    const options = Array.from(
      this.dropdownElement.querySelectorAll<HTMLElement>('.bb-dropdown__option:not(.bb-dropdown__option--disabled)')
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
      this.dropdownElement.parentNode.removeChild(this.dropdownElement);
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

