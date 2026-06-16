import { createContext, useCallback, useContext, useState } from 'react';

export type GateAction = 'book' | 'message' | 'publish';

interface AuthGateContextValue {
  readonly visible: boolean;
  readonly action: GateAction;
  readonly open: (action: GateAction) => void;
  readonly close: () => void;
}

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

export function AuthGateProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState<GateAction>('book');

  const open = useCallback((a: GateAction): void => {
    setAction(a);
    setVisible(true);
  }, []);

  const close = useCallback((): void => {
    setVisible(false);
  }, []);

  return (
    <AuthGateContext.Provider value={{ visible, action, open, close }}>
      {children}
    </AuthGateContext.Provider>
  );
}

export function useAuthGateContext(): AuthGateContextValue {
  const ctx = useContext(AuthGateContext);
  if (ctx == null) throw new Error('useAuthGateContext must be used within AuthGateProvider');
  return ctx;
}
