export type AlertVariant = 'error' | 'info' | 'success' | 'warning';

export type AlertAction = {
  label: string;
  onPress?: () => void;
  variant?: 'cancel' | 'default';
};

export type AlertOptions = {
  actions?: AlertAction[];
  hideIcon?: boolean;
  message?: string;
  title: string;
};

export type AlertManagerRef = {
  show: (variant: AlertVariant, options: AlertOptions) => void;
};
