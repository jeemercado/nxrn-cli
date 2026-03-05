import { AlertManagerRef, AlertOptions } from './alert-manager.types';

class AlertService {
  private static ref: AlertManagerRef | null = null;

  static error(options: AlertOptions) {
    AlertService.ref?.show('error', options);
  }

  static info(options: AlertOptions) {
    AlertService.ref?.show('info', options);
  }

  static setRef(ref: AlertManagerRef) {
    AlertService.ref = ref;
  }

  static success(options: AlertOptions) {
    AlertService.ref?.show('success', options);
  }

  static warning(options: AlertOptions) {
    AlertService.ref?.show('warning', options);
  }
}

export { AlertService as Alert };
