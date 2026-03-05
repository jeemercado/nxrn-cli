export type ToastVariant = 'error' | 'info' | 'success' | 'warning';

export type ToastOptions = {
  duration?: number;
  message: string;
};

export type ToastManagerRef = {
  show: (variant: ToastVariant, options: ToastOptions) => void;
};
