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

  /**
   * Регистрация обработчика события
   */
  register(action: string, handler: TEventHandler): void {
    this.handlers.set(action, handler);

    if (!this.registered) {
      this.setupDelegation();
      this.registered = true;
    }
  }

  /**
   * Удаление обработчика
   */
  unregister(action: string): void {
    this.handlers.delete(action);
  }

  /**
   * Настройка event delegation
   */
  private setupDelegation(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const button = target.closest('[data-action]');

      if (!button) return;

      const action = button.getAttribute('data-action');
      const argsAttr = button.getAttribute('data-args');

      if (!action) return;

      const handler = this.handlers.get(action);
      if (handler) {
        try {
          const args = argsAttr ? JSON.parse(argsAttr) : [];
          handler(...args);
        } catch (error) {
          // Ошибка парсинга аргументов игнорируется
        }
      }
    }, true); // useCapture для раннего перехвата
  }

  /**
   * Очистка всех обработчиков
   */
  destroy(): void {
    this.handlers.clear();
    this.registered = false;
  }
}

