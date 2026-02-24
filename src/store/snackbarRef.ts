import type { SnackbarContextType } from '../errorhandler/snackbar/SnackbarProvider';

export const snackbarRef: {
  current: SnackbarContextType | null;
} = {
  current: null,
};
