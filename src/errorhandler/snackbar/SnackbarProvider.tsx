import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Snackbar } from 'react-native-paper';
import { SnackbarOptions } from './snackbar.types';

export type SnackbarContextType = {
  showSnackbar: (message: string, options?: SnackbarOptions) => void;
};

const SnackbarContext = createContext<SnackbarContextType | null>(null);

let idCounter = 0;

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queue, setQueue] = useState<
    { id: number; message: string; options?: SnackbarOptions }[]
  >([]);
  const [current, setCurrent] = useState<{
    id: number;
    message: string;
    options?: SnackbarOptions;
  } | null>(null);

  const showSnackbar = useCallback(
    (message: string, options?: SnackbarOptions) => {
      setQueue(prev => [...prev, { id: ++idCounter, message, options }]);
    },
    [],
  );

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue(prev => prev.slice(1));
    }
  }, [queue, current]);

  const dismiss = () => setCurrent(null);

  const bgColor = {
    success: '#16a34a',
    error: '#dc2626',
    warning: '#f59e0b',
    info: '#2563eb',
  }[current?.options?.variant ?? 'info'];

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      {current && (
        <Snackbar
          visible
          onDismiss={dismiss}
          duration={3000}
          style={{ backgroundColor: bgColor }}
          action={
            current.options?.retryAction
              ? {
                  label: 'Retry',
                  onPress: current.options.retryAction,
                }
              : undefined
          }
        >
          {current.message}
        </Snackbar>
      )}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error('useSnackbar must be used inside SnackbarProvider');
  }
  return ctx;
};
