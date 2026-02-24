export const mapServerError = (error: any) => {
  if (!error) {
    return { message: 'Unknown error occurred', variant: 'error' };
  }

  if ('status' in error) {
    switch (error.status) {
      case 400:
        return { message: 'Invalid request', variant: 'warning' };
      case 401:
        return {
          message: 'Session expired. Please login again.',
          variant: 'warning',
          logout: true,
        };
      case 403:
        return { message: 'Access denied', variant: 'error' };
      case 500:
        return { message: 'Server error. Try later.', variant: 'error' };
      default:
        return { message: 'Something went wrong', variant: 'error' };
    }
  }

  return { message: 'Network error', variant: 'error' };
};
