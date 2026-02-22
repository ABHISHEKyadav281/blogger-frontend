import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';
import { removeToast } from '../../redux/slices/uiSlice';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

const ToastItem: React.FC<ToastProps> = ({ id, type, title, message, duration = 5000 }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(id));
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, dispatch]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    error: 'bg-rose-500/10 border-rose-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
    info: 'bg-blue-500/10 border-blue-500/20',
  };

  return (
    <div className={`flex items-start space-x-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-right-8 duration-300 ${bgColors[type]}`}>
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        {message && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{message}</p>}
      </div>
      <button
        onClick={() => dispatch(removeToast(id))}
        className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useAppSelector((state) => state.ui.toasts);

  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[100] flex flex-col space-y-3 w-full max-w-sm pointer-events-none">
      <div className="flex flex-col space-y-3 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
