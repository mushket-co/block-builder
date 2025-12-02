// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TEventHandler = (...args: any[]) => void | Promise<void>;

export class EventDelegation {
  private handlers: Map<string, TEventHandler> = new Map();
  private registered: boolean = false;
  private boundClickHandler: ((event: MouseEvent) => void) | null = null;

  register(action: string, handler: TEventHandler): void {
    this.handlers.set(action, handler);

    if (!this.registered) {
      this.setupDelegation();
      this.registered = true;
    }
  }

  unregister(action: string): void {
    this.handlers.delete(action);
    if (this.handlers.size === 0 && this.registered) {
      this.destroy();
    }
  }

  private setupDelegation(): void {
    this.boundClickHandler = this.handleClick.bind(this);
    document.addEventListener('click', this.boundClickHandler, true);
  }

  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const button = target.closest('[data-action]');

    if (!button) {
      return;
    }

    const htmlButton = button as HTMLElement;
    const action = htmlButton.dataset.action;
    const argsAttr = htmlButton.dataset.args;

    if (!action) {
      return;
    }

    const handler = this.handlers.get(action);
    if (handler) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let args: any[] = [];
        if (argsAttr) {
          if (argsAttr.length > 10_000) {
            return;
          }
          try {
            args = JSON.parse(argsAttr);
            if (!Array.isArray(args)) {
              args = [];
            }
          } catch {
            return;
          }
        }
        handler(...args);
      } catch {
        // Игнорируем ошибки выполнения обработчика
      }
    }
  }

  destroy(): void {
    this.handlers.clear();

    if (this.boundClickHandler && this.registered) {
      document.removeEventListener('click', this.boundClickHandler, true);
      this.boundClickHandler = null;
    }

    this.registered = false;
  }
}
