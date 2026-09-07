import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', desc: 'Create new task' },
    { key: '/', desc: 'Focus task search input' },
    { key: '1 / T', desc: 'Switch to Tasks tab' },
    { key: '2 / F', desc: 'Switch to Focus tab' },
    { key: '3 / I', desc: 'Switch to Insights tab' },
    { key: 'Space', desc: 'Start / Pause Timer' },
    { key: 'R', desc: 'Reset Timer to start' },
    { key: 'B', desc: 'Toggle Focus / Short Break' },
    { key: 'M', desc: 'Mute / Unmute audio sound effects' },
    { key: 'Esc', desc: 'Close dialogs or clear search' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {shortcuts.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">{item.desc}</span>
              <kbd className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-800 dark:text-slate-200">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
