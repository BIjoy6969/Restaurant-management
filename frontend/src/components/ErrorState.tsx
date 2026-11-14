import React from 'react';
import { AlertTriangle, RefreshCw, QrCode } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  code?: string;
  onRetry: () => void;
  onSelectTable?: (tableId: string) => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Dining Menu',
  message,
  code,
  onRetry,
  onSelectTable,
}) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-8 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-2">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-stone-600 mb-4 leading-relaxed">
          {message}
        </p>

        {code && (
          <div className="mb-6">
            <span className="inline-block px-2.5 py-1 bg-stone-100 text-stone-500 rounded-md font-mono text-[11px] border border-stone-200">
              Error Code: {code}
            </span>
          </div>
        )}

        <div className="space-y-2.5">
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Loading</span>
          </button>

          {onSelectTable && (
            <button
              onClick={() => onSelectTable('T01')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs sm:text-sm border border-amber-200 transition-all"
            >
              <QrCode className="w-4 h-4 text-amber-700" />
              <span>Switch to Demo Table T01</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

