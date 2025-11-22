import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-rose-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getStyles = (type: ToastType) => {
        switch (type) {
            case 'success': return 'bg-white border-emerald-100';
            case 'error': return 'bg-white border-rose-100';
            default: return 'bg-white border-blue-100';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center p-4 rounded-lg shadow-lg border ${getStyles(toast.type)} min-w-[300px] animate-slide-up`}
                    >
                        <div className="flex-shrink-0 mr-3">
                            {getIcon(toast.type)}
                        </div>
                        <div className="flex-1 text-sm font-medium text-slate-900">
                            {toast.message}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
