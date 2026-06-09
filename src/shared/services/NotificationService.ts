import { CSS_CLASSES, NOTIFICATION_DISPLAY_DURATION_MS } from '../../utils/constants';

export type TNotificationType = 'success' | 'error' | 'info';

export class NotificationService {
  private static instance: NotificationService | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  show(message: string, type: TNotificationType = 'info'): void {
    const notification = document.createElement('div');
    notification.className = CSS_CLASSES.NOTIFICATION;
    notification.textContent = message;

    const colors = {
      success: '#4caf50',
      error: '#dc3545',
      info: '#007bff',
    };

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      animation: fadeIn 0.3s ease-in-out;
    `;

    document.body.append(notification);

    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease-in-out';
      setTimeout(() => notification.remove(), 300);
    }, NOTIFICATION_DISPLAY_DURATION_MS);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }
}

export const notificationService = NotificationService.getInstance();
