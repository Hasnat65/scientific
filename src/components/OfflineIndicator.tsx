import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
        <Wifi size={14} />
        <span>Back online</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-neutral-900/90 text-amber-300 border border-neutral-700 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
      <WifiOff size={14} className="text-amber-400" />
      <span>Offline mode active &bull; Calculation engine is 100% available</span>
    </div>
  );
};
