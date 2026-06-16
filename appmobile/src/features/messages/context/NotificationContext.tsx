import { createContext, useCallback, useContext, useRef, useState } from 'react';

export interface InAppNotificationData {
  readonly id: string;
  readonly conversationId: string;
  readonly providerName: string;
  readonly avatarUrl: string | null;
  readonly message: string;
}

interface NotificationContextValue {
  readonly current: InAppNotificationData | null;
  showNotification: (data: Omit<InAppNotificationData, 'id'>) => void;
  dismiss: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const [current, setCurrent] = useState<InAppNotificationData | null>(null);
  const nextIdRef = useRef(0);

  const showNotification = useCallback((data: Omit<InAppNotificationData, 'id'>): void => {
    nextIdRef.current += 1;
    setCurrent({ ...data, id: String(nextIdRef.current) });
  }, []);

  const dismiss = useCallback((): void => {
    setCurrent(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ current, showNotification, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (ctx === null) throw new Error('useNotification must be inside <NotificationProvider>');
  return ctx;
}
