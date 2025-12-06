import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef } from 'react';

export function useRefreshOnFocus(
  refetch?: () => void,
  enabled: boolean = true,
) {
  const isFocused = useIsFocused();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!refetch) return; // 🛑 prevents crashes
    if (!enabled) return;

    if (isFocused && !isFirstRender.current) {
      refetch();
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, [isFocused, refetch, enabled]);
}
