export interface IDropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface IBaseDropdownRendererOptions {
  fieldName: string;
  label: string;
  rules?: Array<{ type: string; message?: string; value?: any }>;
  errors?: Record<string, string[]>;
  value?: string | number | (string | number)[] | null;
  multiple?: boolean;
  placeholder?: string;
  onChange?: (value: string | number | (string | number)[] | null) => void;
}

export abstract class BaseDropdownRenderer {
  protected fieldName: string;
  protected label: string;
  protected rules: Array<{ type: string; message?: string; value?: any }>;
  protected errors: Record<string, string[]>;
  protected value: string | number | (string | number)[] | null;
  protected multiple: boolean;
  protected placeholder: string;
  protected onChange?: (value: string | number | (string | number)[] | null) => void;
  protected container?: HTMLElement;
  protected dropdownElement?: HTMLElement;
  protected triggerElement?: HTMLElement;

  protected isDropdownOpen = false;

  protected handleClickOutsideBound = this.handleClickOutside.bind(this);
  protected handleResizeBound = this.handleResize.bind(this);
  protected handleScrollBound = this.handleScroll.bind(this);

  constructor(options: IBaseDropdownRendererOptions) {
    this.fieldName = options.fieldName;
    this.label = options.label;
    this.rules = options.rules || [];
    this.errors = options.errors || {};
    this.value = options.value ?? (options.multiple ? [] : null);
    this.multiple = options.multiple ?? false;
    this.placeholder = options.placeholder || 'Выберите значение';
    this.onChange = options.onChange;
  }

  protected isRequired(): boolean {
    return this.rules.some(rule => rule.type === 'required');
  }

  protected hasValue(): boolean {
    if (this.multiple) {
      return Array.isArray(this.value) && this.value.length > 0;
    }
    return this.value !== null && this.value !== undefined && this.value !== '';
  }

  protected isOptionSelected(optionValue: string | number): boolean {
    if (this.multiple) {
      const value = this.value as (string | number)[];
      return Array.isArray(value) && value.includes(optionValue);
    }
    return this.value === optionValue;
  }

  protected openDropdown(): void {
    if (!this.isDropdownOpen) {
      this.isDropdownOpen = true;
      this.updateDropdownContent();
    }
  }

  protected closeDropdown(): void {
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
      this.updateDropdownContent();
    }
  }

  protected toggleDropdown(): void {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  protected handleClickOutside(event: MouseEvent): void {
    if (!this.isDropdownOpen) {
      return;
    }

    const target = event.target as HTMLElement;

    const isClickInContainer = this.container?.contains(target) ?? false;
    const isClickInDropdown = this.dropdownElement?.contains(target) ?? false;

    if (!isClickInContainer && !isClickInDropdown) {
      this.closeDropdown();
    }
  }

  protected handleResize(): void {
    if (this.isDropdownOpen) {
      this.updateDropdownPosition();
    }
  }

  protected handleScroll(): void {
    if (this.isDropdownOpen) {
      this.updateDropdownPosition();
    }
  }

  protected updateDropdownPosition(): void {
    if (!this.container || !this.dropdownElement || !this.triggerElement) {
      return;
    }

    const dropdownEl = this.dropdownElement;
    const rect = this.triggerElement.getBoundingClientRect();
    const viewportMargin = 8;
    const spaceBelow = Math.max(0, window.innerHeight - rect.bottom - viewportMargin);
    const spaceAbove = Math.max(0, rect.top - viewportMargin);
    const shouldShowAbove = spaceBelow < spaceAbove;
    const availableSpace = shouldShowAbove ? spaceAbove : spaceBelow;
    const maxHeight = 320;
    const constrainedSpace = Math.max(160, Math.min(maxHeight, availableSpace));

    const dropdownHeight = Math.min(dropdownEl.scrollHeight, constrainedSpace);

    let top = shouldShowAbove
      ? rect.top - dropdownHeight - viewportMargin
      : rect.bottom + viewportMargin;

    const viewportOffsetTop = window.visualViewport?.offsetTop ?? 0;
    top += viewportOffsetTop;

    const maxTop = window.innerHeight - dropdownHeight - viewportMargin;
    const minTop = viewportMargin;
    top = Math.max(minTop, Math.min(maxTop, top));

    dropdownEl.style.left = `${rect.left}px`;
    dropdownEl.style.width = `${rect.width}px`;
    dropdownEl.style.top = `${top}px`;
    dropdownEl.style.maxHeight = `${Math.max(dropdownHeight, 160)}px`;
  }

  protected attachDropdownEvents(dropdown: HTMLElement): void {
    dropdown.addEventListener(
      'mousedown',
      e => {
        e.stopPropagation();
      },
      true
    );
  }

  protected updateHiddenInput(): void {
    if (!this.container) {
      return;
    }

    const hiddenInput = this.container.querySelector(
      `input[type="hidden"][name="${this.fieldName}"]`
    ) as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.value =
        this.multiple && Array.isArray(this.value)
          ? JSON.stringify(this.value)
          : String(this.value ?? '');
    }
  }

  protected emitChange(): void {
    if (this.onChange) {
      this.onChange(this.value);
    }
  }

  protected abstract updateDropdownContent(): void;
  protected abstract createDropdownElement(): HTMLElement;
  protected abstract getOptions(): IDropdownOption[];

  abstract render(container: HTMLElement): void;
  abstract init(container: HTMLElement): Promise<void>;
  abstract destroy(): void;
  abstract getValue(): string | number | (string | number)[] | null;
  abstract setValue(value: string | number | (string | number)[] | null): void;
}
