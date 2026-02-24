import { isRejectedWithValue } from '@reduxjs/toolkit';
import { mapServerError } from '../errorhandler/snackbar/errorMapper';
import { snackbarRef } from './snackbarRef';

export const rtkErrorMiddleware =
  (store: any) => (next: any) => (action: any) => {
    if (isRejectedWithValue(action)) {
      const mapped = mapServerError(action.payload);

      snackbarRef.current?.showSnackbar(mapped.message, {
        variant: mapped.variant,
      });

      if (mapped.logout) {
        // store.dispatch(logout())
      }
    }

    return next(action);
  };
