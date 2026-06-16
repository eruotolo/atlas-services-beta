import { useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useAuthGateContext, type GateAction } from '@/features/auth/context/AuthGateContext';

/**
 * Returns a `requireAuth` function.
 * If the user is authenticated, calls `onAllowed` immediately.
 * Otherwise opens the register gate bottom-sheet.
 */
export function useAuthGate(): (action: GateAction, onAllowed: () => void) => void {
  const { isAuthenticated } = useAuth();
  const { open } = useAuthGateContext();

  return useCallback(
    (action: GateAction, onAllowed: () => void): void => {
      if (isAuthenticated) {
        onAllowed();
      } else {
        open(action);
      }
    },
    [isAuthenticated, open],
  );
}
