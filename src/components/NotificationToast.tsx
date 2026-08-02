import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationItem } from '../types';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

interface NotificationToastProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}

interface ToastItemProps {
  notif: NotificationItem;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ notif, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // Guaranteed auto-hide timer (2 seconds), paused on mouse hover
  useEffect(() => {
    if (isHovered) return;

    const timer = setTimeout(() => {
      onDismissRef.current(notif.id);
    }, 2000);

    return () => clearTimeout(timer);
  }, [notif.id, isHovered]);

  const isSuccess = notif.type === 'success';
  const isWarning = notif.type === 'warning';
  const isError = notif.type === 'error';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative overflow-hidden p-3 sm:p-3.5 rounded-xl border shadow-2xl flex items-start justify-between gap-3 text-xs select-none ${
        isSuccess
          ? 'bg-[#0a120c]/95 border-emerald-500/40 text-emerald-300 shadow-emerald-950/30'
          : isWarning
          ? 'bg-[#140e06]/95 border-amber-500/40 text-amber-300 shadow-amber-950/30'
          : isError
          ? 'bg-[#140708]/95 border-rose-500/40 text-rose-300 shadow-rose-950/30'
          : 'bg-[#120e08]/95 border-amber-500/30 text-amber-200 shadow-black/50'
      }`}
    >
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          {isError && <XCircle className="w-4 h-4 text-rose-400" />}
          {!isSuccess && !isWarning && !isError && <Info className="w-4 h-4 text-amber-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-0.5">
            <span className="font-bold text-xs text-white tracking-wide block truncate">
              {notif.title}
            </span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-snug break-words">
            {notif.message}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(notif.id)}
        className="text-zinc-400 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Auto-hide Countdown Progress Bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: isHovered ? 0 : 2, ease: 'linear' }}
        style={{ originX: 0 }}
        className={`absolute bottom-0 left-0 right-0 h-0.5 ${
          isSuccess
            ? 'bg-emerald-400'
            : isWarning
            ? 'bg-amber-400'
            : isError
            ? 'bg-rose-400'
            : 'bg-amber-400'
        }`}
      />
    </motion.div>
  );
};

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
}) => {
  return (
    <div className="fixed top-16 right-3 sm:right-6 z-[100] flex flex-col gap-2.5 max-w-[360px] w-[calc(100vw-1.5rem)] sm:w-80 select-none pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notif) => (
          <ToastItem key={notif.id} notif={notif} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};
