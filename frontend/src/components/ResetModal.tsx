import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isResetting: boolean;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isResetting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-[#A31C1B]/40 p-6 space-y-5 bg-[#171717] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#A31C1B]/20 text-[#A31C1B]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-[#F8F7F2]">
              Reset Demo Environment?
            </h3>
            <p className="text-xs text-neutral-400">
              Restores baseline sample records for judges and demonstration.
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          This operation will clear custom temporary submissions and reload the deterministic benchmark datasets for <strong>Construction</strong> (Apex Heights) and <strong>College Facilities</strong> (SRM Tech Park).
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isResetting}
            className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-[#F8F7F2] hover:bg-white/15 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isResetting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#A31C1B] hover:bg-[#851615] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#A31C1B]/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Restoring...' : 'Confirm Reset'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
