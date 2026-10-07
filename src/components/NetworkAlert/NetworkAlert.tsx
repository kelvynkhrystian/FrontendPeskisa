import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
// import { useTheme } from '../../contexts/ThemeContext';

export function NetworkAlert() {
  // const { theme } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAlert, setShowAlert] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(true);
      // Esconde o aviso de "voltou a online" após 4 segundos
      setTimeout(() => setShowAlert(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true); // Fica sempre visível quando offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showAlert && isOnline) return null;

  return (
    <div
      className={`w-full px-6 py-2.5 flex items-center justify-center gap-2 text-xs font-bold transition-all border-b ${
        isOnline
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          : 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi size={16} />
          <span>Conexão restabelecida! Você está online novamente.</span>
        </>
      ) : (
        <>
          <WifiOff size={16} />
          <span>
            Você está offline. As respostas serão salvas no dispositivo e podem
            ser sincronizadas depois.
          </span>
        </>
      )}
    </div>
  );
}
