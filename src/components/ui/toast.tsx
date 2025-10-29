import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContext } from "@/contexts/toast-context";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3000) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-9999 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div
                className={cn(
                  "bg-white rounded-lg shadow-2xl border px-4 py-3 min-w-[280px] max-w-md flex items-center gap-3",
                  {
                    "border-green-200": toast.type === "success",
                    "border-red-200": toast.type === "error",
                    "border-blue-200": toast.type === "info",
                  }
                )}
              >
                {toast.type === "success" && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                )}
                {toast.type === "error" && (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
                {toast.type === "info" && (
                  <Info className="w-5 h-5 text-blue-600 shrink-0" />
                )}
                <p className="text-sm text-gray-900 flex-1">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                  aria-label="Cerrar notificación"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
