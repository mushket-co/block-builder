/**
 * Event Delegation для обработки onclick событий
 * Альтернатива глобальным переменным
 */


export type TEventHandler = (...args: any[]) => void | Promise<void>;

/**
 * Менеджер делегирования событий
 */
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

  /**
   * Настройка event delegation
   */
  private setupDelegation(): void {
    this.boundClickHandler = this.handleClick.bind(this);
    document.addEventListener('click', this.boundClickHandler, true); // useCapture для раннего перехвата
  }

  /**
   * Обработчик клика для event delegation
   */
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const button = target.closest('[data-action]');

    if (!button) return;

    const action = button.getAttribute('data-action');
    const argsAttr = button.getAttribute('data-args');

    if (!action) return;

    const handler = this.handlers.get(action);
    if (handler) {
      try {
        let args: any[] = [];
        if (argsAttr) {
          if (argsAttr.length > 10000) {
            console.warn('EventDelegation: args слишком большие, игнорируем');
            return;
          }
          try {
            args = JSON.parse(argsAttr);
            if (!Array.isArray(args)) {
              console.warn('EventDelegation: args должен быть массивом');
              args = [];
            }
          } catch (error) {
            console.warn('EventDelegation: ошибка парсинга args:', error);
            return;
          }
        }
        handler(...args);
      } catch (error) {
        console.error('EventDelegation: ошибка выполнения обработчика:', error);
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

