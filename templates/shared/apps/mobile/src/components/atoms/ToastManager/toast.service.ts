import { ToastManagerRef, ToastOptions } from './toast-manager.types';

class ToastService {
  private static ref: ToastManagerRef | null = null;

  static error(message: string, options?: Omit<ToastOptions, 'message'>) {
    ToastService.ref?.show('error', { message, ...options });
  }

  static info(message: string, options?: Omit<ToastOptions, 'message'>) {
    ToastService.ref?.show('info', { message, ...options });
  }

  static setRef(ref: ToastManagerRef) {
    ToastService.ref = ref;
  }

  static success(message: string, options?: Omit<ToastOptions, 'message'>) {
    ToastService.ref?.show('success', { message, ...options });
  }

  static warning(message: string, options?: Omit<ToastOptions, 'message'>) {
    ToastService.ref?.show('warning', { message, ...options });
  }
}

export { ToastService as Toast };
