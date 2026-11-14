import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, HelpCircle, AlertTriangle } from 'lucide-react';
import { Table } from '../types';

interface TableSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTableId: string;
  onSelectTable: (tableId: string) => void;
  allTables: Table[];
}

export const TableSwitcherModal: React.FC<TableSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentTableId,
  onSelectTable,
  allTables,
}) => {
  const [copied, setCopied] = useState(false);
  const [customTableInput, setCustomTableInput] = useState('');

  if (!isOpen) return null;

  // Compute dynamic table menu URL
  const origin = window.location.origin;
  const currentMenuUrl = `${origin}/?table=${encodeURIComponent(currentTableId)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMenuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelect = (tId: string) => {
    onSelectTable(tId);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTableInput.trim()) {
      onSelectTable(customTableInput.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-amber-200">Table QR & Demo Switcher</h3>
            <p className="text-xs text-stone-400">Simulate customer QR scan entry & test tables</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* QR Code Presentation Box */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Scan With Mobile Camera (Table {currentTableId})
            </span>

            <div className="p-3 bg-white rounded-xl shadow-md border border-stone-100 mb-3">
              <QRCodeSVG
                value={currentMenuUrl}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>

            <p className="text-xs text-stone-600 max-w-xs mb-3 font-mono break-all px-2 py-1 bg-stone-100 rounded border border-stone-200">
              {currentMenuUrl}
            </p>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-medium shadow-sm transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Menu Link'}</span>
            </button>
          </div>

          {/* Quick Select Available Tables */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              Switch Demo Table
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {allTables.map((t) => {
                const isSelected = t.id.toLowerCase() === currentTableId.toLowerCase();
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(t.id)}
                    className={`px-3 py-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md font-semibold'
                        : 'bg-white hover:bg-amber-50 text-stone-800 border-stone-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="text-sm font-bold">{t.id}</div>
                    <div className={`text-[10px] truncate ${isSelected ? 'text-amber-100' : 'text-stone-500'}`}>
                      {t.area}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Invalid Table */}
          <div className="pt-2 border-t border-stone-100">
            <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center justify-between">
              <span>Test Custom / Invalid Table</span>
              <button
                type="button"
                onClick={() => handleSelect('T999')}
                className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 font-normal"
              >
                <AlertTriangle className="w-3 h-3" />
                Quick test invalid table (T999)
              </button>
            </label>
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. T05 or INVALID_TABLE"
                value={customTableInput}
                onChange={(e) => setCustomTableInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 text-white hover:bg-stone-800 rounded-lg text-xs font-medium"
              >
                Apply
              </button>
            </form>
          </div>

          {/* Remote / Mobile Demo Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Mobile Phone Demo Tip:</span>
              To scan this QR code with a real mobile smartphone on the same Wi-Fi, run Vite with your local network IP (e.g.{' '}
              <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">http://192.168.x.x:5173/?table=T01</code>)
              instead of <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">localhost</code>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
