import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Info } from 'lucide-react';
import { ToastNotification } from '../types';

interface ToastProps {
  toasts: ToastNotification[];
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none max-w-sm w-full px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-full bg-slate-900/90 dark:bg-slate-100/90 text-slate-100 dark:text-slate-900 shadow-xl backdrop-blur-md border border-slate-700/50 dark:border-slate-200/50 text-sm font-medium"
          >
            {toast.colorHex ? (
              <span
                className="w-4 h-4 rounded-full border border-white/30 shrink-0 shadow-sm"
                style={{ backgroundColor: toast.colorHex }}
              />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-blue-400 dark:text-blue-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
