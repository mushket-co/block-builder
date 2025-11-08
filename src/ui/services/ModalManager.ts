import { CSS_CLASSES } from '../../utils/constants';

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
  private static readonly MODAL_ID = 'block-builder-modal';
  private static readonly MODAL_CONTENT_ID = 'block-builder-modal-content';
  private boundHandleOverlayClick: ((event: Event) => void) | null = null;
  private boundHandleModalContentClick: ((event: Event) => void) | null = null;
  private modalHandlers: { onSubmit?: () => void; onCancel?: () => void } | null = null;

  showModal(options: IModalOptions): void {
    this.closeModal();

    const escapedTitle = this.escapeHtml(options.title);
    const escapedCancelText = this.escapeHtml(options.cancelButtonText || 'Отмена');
    const escapedSubmitText = this.escapeHtml(options.submitButtonText || 'Сохранить');

    const footerHTML = options.hideSubmitButton
      ? ''
      : `
      <div class="block-builder-modal-footer">
        <button data-action="closeModal" class="block-builder-btn block-builder-btn--secondary">
          ${escapedCancelText}
        </button>
        <button data-action="submitModal" class="block-builder-btn block-builder-btn--primary">
          ${escapedSubmitText}
        </button>
      </div>
    `;

    const modalHTML = `
    <div id="${ModalManager.MODAL_ID}" class="block-builder-modal">
      <div class="block-builder-modal-content" id="${ModalManager.MODAL_CONTENT_ID}">
        <div class="block-builder-modal-header">
          <h3>${escapedTitle}</h3>
          <button data-action="closeModal" class="block-builder-modal-close">&times;</button>
        </div>
        <div class="${CSS_CLASSES.MODAL_BODY}">
          ${options.bodyHTML}
        </div>
        ${footerHTML}
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    this.modalHandlers = {
      onSubmit: options.onSubmit,
      onCancel: options.onCancel,
    };

    requestAnimationFrame(() => {
      this.boundHandleOverlayClick = (event: Event) => {
        if (event.target === event.currentTarget) {
          this.closeModal();
        }
      };
      this.boundHandleModalContentClick = (e: Event) => e.stopPropagation();

      const modal = document.querySelector(`#${ModalManager.MODAL_ID}`);
      if (modal) {
        modal.addEventListener('mousedown', this.boundHandleOverlayClick);
      }

      const modalContent = document.querySelector(`#${ModalManager.MODAL_CONTENT_ID}`);
      if (modalContent && this.boundHandleModalContentClick) {
        modalContent.addEventListener('mousedown', this.boundHandleModalContentClick);
      }
    });
  }

  closeModal(): void {
    const modal = document.querySelector(`#${ModalManager.MODAL_ID}`);
    if (modal) {
      if (this.boundHandleOverlayClick) {
        modal.removeEventListener('mousedown', this.boundHandleOverlayClick);
        this.boundHandleOverlayClick = null;
      }
      modal.remove();
    }

    const modalContent = document.querySelector(`#${ModalManager.MODAL_CONTENT_ID}`);
    if (modalContent && this.boundHandleModalContentClick) {
      modalContent.removeEventListener('mousedown', this.boundHandleModalContentClick);
      this.boundHandleModalContentClick = null;
    }

    this.modalHandlers = null;
  }

  submitModal(): void {
    if (this.modalHandlers?.onSubmit) {
      this.modalHandlers.onSubmit();
    }
  }

  getFormData(formId: string): Record<string, unknown> {
    const form = document.querySelector(`#${formId}`) as HTMLFormElement;
    if (!form) {
      return {};
    }

    const formData = new FormData(form);
    const props: Record<string, unknown> = {};

    for (const [key, value] of formData.entries()) {
      if (key.includes('[') && key.includes('].')) {
        continue;
      }

      const hiddenInput = form.querySelector(
        `input[type="hidden"][name="${key}"][data-image-value="true"]`
      );
      if (hiddenInput && typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          props[key] = typeof parsed === 'object' && parsed !== null ? parsed : value;
        } catch {
          props[key] = value;
        }
      } else {
        props[key] = value;
      }
    }

    return props;
  }

  isModalOpen(): boolean {
    return document.querySelector(`#${ModalManager.MODAL_ID}`) !== null;
  }

  /**
   * Показывает модальное окно подтверждения
   * @param message - текст сообщения (будет экранирован для безопасности)
   * @param title - заголовок (по умолчанию "Подтверждение", будет экранирован)
   * @returns Promise<boolean> - true если подтверждено, false если отменено
   */
  confirm(message: string, title: string = 'Подтверждение'): Promise<boolean> {
    return new Promise(resolve => {
      const escapedMessage = this.escapeHtml(message);
      const escapedTitle = this.escapeHtml(title);
      const bodyHTML = `<p>${escapedMessage}</p>`;

      this.showModal({
        title: escapedTitle,
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

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
