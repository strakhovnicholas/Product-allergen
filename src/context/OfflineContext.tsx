import { createContext, useContext, useEffect, useState } from 'react';

import { getDatabase } from '../db/database';
import { subscribeNetwork } from '../offline/network';
import { processSyncQueue } from '../offline/syncService';

type OfflineContextType = {
  isOnline: boolean;
  syncNow: () => Promise<void>;
};

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  syncNow: async () => {},
});

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    void getDatabase();
    const unsub = subscribeNetwork((online) => {
      setIsOnline(online);
      if (online) {
        void processSyncQueue();
      }
    });
    return unsub;
  }, []);

  const syncNow = async () => {
    await processSyncQueue();
  };

  return (
    <OfflineContext.Provider value={{ isOnline, syncNow }}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => useContext(OfflineContext);
