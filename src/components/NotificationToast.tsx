import React from 'react';
import { NotificationItem } from '../types';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

interface NotificationToastProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full font-mono text-xs select-none pointer-events-none">
      {notifications.map((notif) => {
        const isSuccess = notif.type === 'success';
        const isWarning = notif.type === 'warning';
        const isError = notif.type === 'error';

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto p-3 rounded-lg border shadow-xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom-2 duration-150 ${
              isSuccess
                ? 'bg-zinc-950 border-emerald-500/40 text-emerald-300'
                : isWarning
                ? 'bg-zinc-950 border-amber-500/40 text-amber-300'
                : isError
                ? 'bg-zinc-950 border-rose-500/40 text-rose-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
              {isError && <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
              {!isSuccess && !isWarning && !isError && <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />}

              <div>
                <span className="font-bold block text-zinc-100">{notif.title}</span>
                <span className="text-[11px] text-zinc-300">{notif.message}</span>
                <span className="text-[9px] text-zinc-400 block mt-1">{notif.time}</span>
              </div>
            </div>

            <button
              onClick={() => onDismiss(notif.id)}
              className="text-zinc-400 hover:text-zinc-100 cursor-pointer p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
