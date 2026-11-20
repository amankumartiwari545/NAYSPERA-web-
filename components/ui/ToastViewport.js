"use client";

import { Check, Info, X } from "lucide-react";
import { useApp } from "@/app/providers";

export default function ToastViewport() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`}>
          {toast.tone === "success" ? (
            <Check size={15} />
          ) : toast.tone === "error" ? (
            <X size={15} />
          ) : (
            <Info size={15} />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            className="icon-btn"
            style={{ width: 24, height: 24, marginLeft: 2 }}
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
