import { CSS_CLASSES } from '../../utils/constants';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/scrollLock';

export interface IModalOptions {
  title: string;
  bodyHTML: string;
  onSubmit: () => void;
  onCancel: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  hideSubmitButton?: boolean;
  onBeforeModalOpen?: () => boolean | void;
  onAfterModalOpen?: () => void;
  onBeforeModalClose?: () => void;
  onAfterModalClose?: () => void;
  preventBodyScroll?: boolean;
  lockBodyScroll?: () => void;
  unlockBodyScroll?: () => void;
}

export class ModalManager {
  private static readonly MODAL_ID = 'block-builder-modal';
  private static readonly MODAL_CONTENT_ID = 'block-builder-modal-content';
  private boundHandleOverlayClick: ((event: Event) => void) | null = null;
  private boundHandleModalContentClick: ((event: Event) => void) | null = null;
  private modalHandlers: {
    onSubmit?: () => void;
    onCancel?: () => void;
    onBeforeModalClose?: () => void;
    onAfterModalClose?: () => void;
    lockBodyScroll?: () => void;
    unlockBodyScroll?: () => void;
  } | null = null;
  private bodyScrollLocked: boolean = false;

  showModal(options: IModalOptions): void {
    this.closeModal();

    if (options.onBeforeModalOpen) {
      const result = options.onBeforeModalOpen();
      if (result === false) {
        return;
      }
    }

    this.modalHandlers = {
      onSubmit: options.onSubmit,
      onCancel: options.onCancel,
      onBeforeModalClose: options.onBeforeModalClose,
      onAfterModalClose: options.onAfterModalClose,
      lockBodyScroll: options.lockBodyScroll,
      unlockBodyScroll: options.unlockBodyScroll,
    };

    const shouldPreventScroll = options.preventBodyScroll !== false;
    if (shouldPreventScroll) {
      if (options.lockBodyScroll) {
        options.lockBodyScroll();
        this.bodyScrollLocked = true;
      } else {
        lockBodyScroll();
        this.bodyScrollLocked = true;
      }
    }

    const escapedTitle = this.escapeHtml(options.title);
    const escapedCancelText = this.escapeHtml(options.cancelButtonText || 'Отмена');
    const escapedSubmitText = this.escapeHtml(options.submitButtonText || 'Сохранить');

    const footerHTML = options.hideSubmitButton
      ? ''
      : `
      <div class="${CSS_CLASSES.MODAL_FOOTER}">
        <button data-action="closeModal" class="${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_SECONDARY}">
          ${escapedCancelText}
        </button>
        <button data-action="submitModal" class="${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_PRIMARY}">
          ${escapedSubmitText}
        </button>
      </div>
    `;

    const modalHTML = `
    <div id="${ModalManager.MODAL_ID}" class="${CSS_CLASSES.MODAL}">
      <div class="${CSS_CLASSES.MODAL_CONTENT}" id="${ModalManager.MODAL_CONTENT_ID}">
        <div class="${CSS_CLASSES.MODAL_HEADER}">
          <h3>${escapedTitle}</h3>
          <button data-action="closeModal" class="${CSS_CLASSES.MODAL_CLOSE}">&times;</button>
        </div>
        <div class="${CSS_CLASSES.MODAL_BODY}">
          ${options.bodyHTML}
        </div>
        ${footerHTML}
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

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

    if (options.onAfterModalOpen) {
      options.onAfterModalOpen();
    }
  }

  closeModal(): void {
    if (this.modalHandlers?.onBeforeModalClose) {
      this.modalHandlers.onBeforeModalClose();
    }

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

    if (this.bodyScrollLocked) {
      if (this.modalHandlers?.unlockBodyScroll) {
        this.modalHandlers.unlockBodyScroll();
        this.bodyScrollLocked = false;
      } else {
        unlockBodyScroll();
        this.bodyScrollLocked = false;
      }
    }

    if (this.modalHandlers?.onAfterModalClose) {
      this.modalHandlers.onAfterModalClose();
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
