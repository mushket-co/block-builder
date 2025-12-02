export interface IControlRenderer {
  render(container: HTMLElement): void | Promise<void>;
  destroy(): void;
  getValue(): unknown;
  updateErrors?(errors: Record<string, string[]>): void;
}

export interface IControlInitializer {
  initialize(container: HTMLElement): Promise<IControlRenderer | null>;
  canHandle(container: HTMLElement): boolean;
  getControlType(): string;
}
