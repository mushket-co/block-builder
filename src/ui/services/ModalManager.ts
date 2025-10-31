/**
 * ModalManager - отвечает только за управление модальными окнами
 * Принцип единой ответственности (SRP)
 */

export interface IModalOptions {
  title: string;
  bodyHTML: string;
  onSubmit: () => void;
  onCancel: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  hideSubmitButton?: boolean;
}

export class ModalManager {
  private static readonly MODAL_ID = 'block-builder-modal'
  private boundHandleOverlayClick: ((event: MouseEvent) => void) | null = null;

  /**
   * Показать модальное окно
   */
  showModal(options: IModalOptions): void {
  // Удаляем существующее модальное окно
  this.closeModal();

  const footerHTML = options.hideSubmitButton
    ? ''
    : `
      <div class="block-builder-modal-footer">
        <button data-action="closeModal" class="block-builder-btn block-builder-btn--secondary">
          ${options.cancelButtonText || 'Отмена'}
        </button>
        <button data-action="submitModal" class="block-builder-btn block-builder-btn--primary">
          ${options.submitButtonText || 'Сохранить'}
        </button>
      </div>
    `;

  const modalHTML = `
    <div id="${ModalManager.MODAL_ID}" class="block-builder-modal">
      <div class="block-builder-modal-content" id="block-builder-modal-content">
        <div class="block-builder-modal-header">
          <h3>${options.title}</h3>
          <button data-action="closeModal" class="block-builder-modal-close">&times;</button>
        </div>
        <div class="block-builder-modal-body">
          ${options.bodyHTML}
        </div>
        ${footerHTML}
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Добавляем обработчики сразу после добавления в DOM
  requestAnimationFrame(() => {
    // Сохраняем привязанную функцию для последующего удаления
    this.boundHandleOverlayClick = this.handleOverlayClick.bind(this);

    // Добавляем обработчик закрытия по клику вне области
    const modal = document.getElementById(ModalManager.MODAL_ID);
    if (modal) {
      modal.addEventListener('mousedown', this.boundHandleOverlayClick);
    }

    // Предотвращаем всплытие события от контента модалки
    const modalContent = document.getElementById('block-builder-modal-content');
    if (modalContent) {
      modalContent.addEventListener('mousedown', (e) => e.stopPropagation());
    }
  });

  // Сохраняем обработчики
  (window as any).__modalHandlers = {
    onSubmit: options.onSubmit,
    onCancel: options.onCancel
  };
  }

  /**
   * Обработчик клика по оверлею модалки
   */
  private handleOverlayClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Если клик был на элементе Jodit, не закрываем модалку
    if (this.isJoditElement(target)) {
      return;
    }

    // Если клик был на оверлей (а не на content внутри), закрываем модалку
    if (target.classList.contains('block-builder-modal')) {
      this.closeModal();
    }
  }

  /**
   * Проверка, является ли элемент частью Jodit popup/dialog
   */
  private isJoditElement(element: HTMLElement | null): boolean {
    if (!element) return false;

    // Jodit создаёт элементы с различными классами
    const joditClasses = [
      'jodit',
      'jodit-popup',
      'jodit-dialog',
      'jodit-toolbar-popup',
      'jodit-ui',
      'jodit-toolbar-button',
      'jodit-workplace',
      'jodit-wysiwyg'
    ];

    let currentElement: HTMLElement | null = element;

    // Проверяем элемент и всех его родителей
    while (currentElement) {
      // Проверяем классы
      const classList = currentElement.classList;
      for (const joditClass of joditClasses) {
        if (classList.contains(joditClass)) {
          return true;
        }
      }

      // Проверяем data-атрибуты Jodit
      if (currentElement.getAttribute('data-editor') === 'jodit' ||
          currentElement.getAttribute('data-jodit')) {
        return true;
      }

      currentElement = currentElement.parentElement;
    }

    return false;
  }

  /**
   * Закрыть модальное окно
   */
  closeModal(): void {
  const modal = document.getElementById(ModalManager.MODAL_ID);
  if (modal) {
    // Удаляем обработчики событий перед удалением элемента
    if (this.boundHandleOverlayClick) {
      modal.removeEventListener('mousedown', this.boundHandleOverlayClick);
    }
    modal.remove();
  }

  const modalContent = document.getElementById('block-builder-modal-content');
  if (modalContent) {
    modalContent.removeEventListener('mousedown', (e) => e.stopPropagation());
  }

  // Очищаем обработчики
  delete (window as any).__modalHandlers;
  }

  /**
   * Обработка submit модального окна
   */
  submitModal(): void {
  const handlers = (window as any).__modalHandlers;
  if (handlers?.onSubmit) {
    handlers.onSubmit();
  }
  }

  /**
   * Получение данных формы из модального окна
   */
  getFormData(formId: string): Record<string, any> {
  const form = document.getElementById(formId) as HTMLFormElement;
  if (!form) return {};

  const formData = new FormData(form);
  const props: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
    props[key] = value;
  }

  return props;
  }

  /**
   * Проверка существования модального окна
   */
  isModalOpen(): boolean {
  return document.getElementById(ModalManager.MODAL_ID) !== null;
  }

  /**
   * Показывает модальное окно подтверждения
   * @param message - текст сообщения
   * @param title - заголовок (по умолчанию "Подтверждение")
   * @returns Promise<boolean> - true если подтверждено, false если отменено
   */
  confirm(message: string, title: string = 'Подтверждение'): Promise<boolean> {
    return new Promise((resolve) => {
      const bodyHTML = `<p>${message}</p>`;

      this.showModal({
        title,
        bodyHTML,
        submitButtonText: 'Подтвердить',
        cancelButtonText: 'Отмена',
        onSubmit: () => {
          this.closeModal();
          resolve(true);
        },
        onCancel: () => {
          this.closeModal();
          resolve(false);
        },
      });
    });
  }
}

