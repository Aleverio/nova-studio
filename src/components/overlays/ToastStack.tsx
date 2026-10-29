import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { Toast } from '../../types';

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useAppStore();

  const icons = {
    success: <CheckCircle size={13} color="var(--n-on-paper)" />,
    error:   <AlertTriangle size={13} color="var(--n-on-paper)" />,
    info:    <Info size={13} color="var(--n-on-paper)" />,
  };

  const iconBg = {
    success: 'var(--n-paper)',
    error:   'var(--n-del)',
    info:    'var(--n-mid)',
  };

  return (
    <div
      className="flex items-center gap-[10px] rounded-[12px] border px-[12px] py-[12px]"
      style={{
        width: 356,
        background: 'var(--n-raise)',
        borderColor: 'var(--n-line2)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
      }}
      role={toast.variant === 'error' ? 'alert' : 'status'}
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
    >
      {/* Icon circle */}
      <div className="flex items-center justify-center rounded-full shrink-0"
        style={{ width: 26, height: 26, background: iconBg[toast.variant] }}>
        {icons[toast.variant]}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[11.5px] font-semibold" style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {toast.title}
        </p>
        {toast.meta && (
          <p className="text-[9.5px] font-['JetBrains_Mono',monospace] mt-[1px]" style={{ color: 'var(--n-faint)' }}>
            {toast.meta}
          </p>
        )}
      </div>

      {/* Action */}
      {toast.action && (
        <button
          onClick={() => { toast.action!.run(); removeToast(toast.id); }}
          className="px-[6px] py-[2px] rounded-[5px] border text-[9px] cursor-pointer shrink-0"
          style={{ borderColor: 'var(--n-line2)', color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {toast.action.label}
        </button>
      )}

      {/* Close */}
      <button
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss notification"
        className="text-[--n-faint] hover:text-[--n-low] shrink-0"
      >
        <X size={11} />
      </button>
    </div>
  );
}

export function ToastStack() {
  const { toasts } = useAppStore();
  if (!toasts.length) return null;

  return (
    <div
      className="fixed flex flex-col-reverse gap-[8px] z-50"
      style={{ right: 16, bottom: 50 }}
    >
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}
