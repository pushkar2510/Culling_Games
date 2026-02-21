import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto px-4 py-3 rounded-md shadow-lg border-l-4 text-white flex items-center gap-2 animate-fade-in ${
            toast.type === 'success' ? 'bg-zinc-900 border-green-500' : 
            toast.type === 'error' ? 'bg-zinc-900 border-red-600' : 'bg-zinc-900 border-blue-500'
          }`}>
            {toast.type === 'success' && <CheckCircle size={16} className="text-green-500" />}
            {toast.type === 'error' && <AlertTriangle size={16} className="text-red-600" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};