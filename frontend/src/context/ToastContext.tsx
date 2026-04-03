import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger transition after mount
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  const getTypeStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          container: "bg-green-50 border-green-200 text-green-800",
          icon: "check_circle",
          iconColor: "text-green-500",
        };
      case "error":
        return {
          container: "bg-red-50 border-red-200 text-red-800",
          icon: "error",
          iconColor: "text-red-500",
        };
      case "warning":
        return {
          container: "bg-orange-50 border-orange-200 text-orange-800",
          icon: "warning",
          iconColor: "text-orange-500",
        };
      case "info":
        return {
          container: "bg-blue-50 border-blue-200 text-blue-800",
          icon: "info",
          iconColor: "text-blue-500",
        };
      default:
        return {
          container: "bg-white border-slate-200 text-slate-800",
          icon: "info",
          iconColor: "text-slate-500",
        };
    }
  };

  const styles = getTypeStyles(toast.type);

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg min-w-[300px] max-w-[400px] transform transition-all duration-300 ${
        mounted ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${styles.container}`}
    >
      <span className={`material-symbols-outlined ${styles.iconColor}`}>
        {styles.icon}
      </span>
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button
        onClick={() => {
          setMounted(false);
          setTimeout(() => onRemove(toast.id), 300); // Wait for transition
        }}
        className="opacity-70 hover:opacity-100 transition-opacity"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (message: string, type: ToastType, duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
