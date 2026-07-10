import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Info, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDestructive = false,
  confirmText = "Confirmar",
  cancelText = "Cancelar"
}: ConfirmationModalProps) {
  // Key listeners for accessible navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "Enter") {
        onConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden z-10"
            id="global-confirmation-dialog"
          >
            {/* Header / Close button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>

            {/* Content Layout */}
            <div className="flex items-start gap-4 mt-1">
              {/* Icon */}
              <div className={`p-3 rounded-full shrink-0 ${
                isDestructive 
                  ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400" 
                  : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
              }`}>
                {isDestructive ? (
                  <AlertTriangle size={24} className="animate-pulse" />
                ) : (
                  <Info size={24} />
                )}
              </div>

              {/* Text info */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {message}
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                }}
                className={`px-4.5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer ${
                  isDestructive
                    ? "bg-red-600 hover:bg-red-700 active:bg-red-800 hover:shadow-red-500/10"
                    : "bg-brand-500 hover:bg-brand-600 active:bg-brand-700 hover:shadow-brand-500/10"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
