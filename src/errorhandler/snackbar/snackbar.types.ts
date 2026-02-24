export type SnackbarVariant = 'success' | 'error' | 'warning' | 'info';

export type SnackbarOptions = {
  variant?: SnackbarVariant;
  retryAction?: () => void;
};
