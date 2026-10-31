import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { APP_VARIANTS, AppVariantId } from '../../config';
import { X, Layers, Database, ShieldCheck, Download, Upload, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { storagePersistence } from '../../services/storagePersistence';

interface VariantSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VariantSwitcherModal: React.FC<VariantSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentVariant, switchVariant, state, showToast, setState } = useApp();
  const [selectedVariant, setSelectedVariant] = useState<AppVariantId>(currentVariant);
  const [isExporting, setIsExporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyVariant = async () => {
    if (selectedVariant !== currentVariant) {
      await switchVariant(selectedVariant);
      showToast(`Switched to ${APP_VARIANTS[selectedVariant].appName}`);
    }
    onClose();
  };

  const handleExportBackup = () => {
    try {
      setIsExporting(true);
      const json = storagePersistence.exportBackup(currentVariant, state);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `selfcare-hero-${currentVariant}-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Hardware backup snapshot exported!');
    } catch (err) {
      showToast('Export failed: ' + String(err));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const restoredState = await storagePersistence.importBackup(currentVariant, content);
        setState(restoredState);
        showToast('Backup restored successfully into both hardware layers!');
        setImportError(null);
        onClose();
      } catch (err: unknown) {
        setImportError(err instanceof Error ? err.message : 'Invalid backup JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-[#1E241B] border border-[#33402E] p-6 text-[#F4F7F2] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#33402E]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#252D22] border border-[#87A96B] flex items-center justify-center text-[#87A96B]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#F4F7F2]">Multi-Variant & Hardware Storage</h2>
              <p className="text-xs text-[#859A90]">Unified codebase with sandboxed Android package IDs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#859A90] hover:text-[#F4F7F2] hover:bg-[#252D22]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual-Layer Storage Indicator */}
        <div className="mt-4 p-4 rounded-2xl bg-[#252D22] border border-[#33402E]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#87A96B] flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              Dual-Layer Hardware Persistence
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1E241B] text-[#A5C68A] border border-[#33402E]">
              Zero Data Loss Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#1E241B] border border-[#33402E] flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#C5D1C9]">Layer 1: IndexedDB</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#87A96B]" />
              </div>
              <span className="text-[10px] text-[#859A90]">Hardware quota object store</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#1E241B] border border-[#33402E] flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#C5D1C9]">Layer 2: Native Preferences</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#87A96B]" />
              </div>
              <span className="text-[10px] text-[#859A90]">Auto-healing fallback mirror</span>
            </div>
          </div>
        </div>

        {/* 4 Application Variations */}
        <div className="mt-4">
          <label className="text-xs font-bold text-[#859A90] uppercase tracking-wider">
            Select Application Direction (2–4 Variations)
          </label>
          <div className="mt-2 space-y-2.5">
            {(Object.keys(APP_VARIANTS) as AppVariantId[]).map(key => {
              const v = APP_VARIANTS[key];
              const isCurrent = currentVariant === key;
              const isSelected = selectedVariant === key;

              return (
                <div
                  key={key}
                  onClick={() => setSelectedVariant(key)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#252D22] border-[#87A96B] shadow-lg ring-1 ring-[#87A96B]/50'
                      : 'bg-[#1E241B] border-[#33402E] hover:border-[#859A90]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#F4F7F2]">{v.appName}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#87A96B]/20 text-[#87A96B] font-bold border border-[#87A96B]/40">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A5C68A] font-medium mt-0.5">{v.tagline}</p>
                      <p className="text-[11px] text-[#859A90] mt-1">{v.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#121711] text-[#C5D1C9] border border-[#33402E] block">
                        {v.appId}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#33402E]/60 flex flex-wrap gap-1.5 text-[10px]">
                    {v.enableAiCopilot && <span className="px-1.5 py-0.5 rounded bg-[#121711] text-[#859A90]">🤖 AI Copilot</span>}
                    {v.enableSomaticBreathing && <span className="px-1.5 py-0.5 rounded bg-[#121711] text-[#859A90]">🫁 Somatic Pacer</span>}
                    {v.enableAntiGoals && <span className="px-1.5 py-0.5 rounded bg-[#121711] text-[#859A90]">🛡️ Anti-Goals</span>}
                    {v.enableRoadmap && <span className="px-1.5 py-0.5 rounded bg-[#121711] text-[#859A90]">🗺️ Future Roadmap</span>}
                    {v.enableFeynman && <span className="px-1.5 py-0.5 rounded bg-[#121711] text-[#859A90]">🧠 SM-2 Spaced Recall</span>}
                    {v.enableUrgeSurfing && <span className="px-1.5 py-0.5 rounded bg-[#121711] text-[#859A90]">🌊 Urge Surfing</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Backup & Restore Controls */}
        <div className="mt-4 pt-4 border-t border-[#33402E]">
          <span className="text-xs font-bold text-[#859A90] uppercase tracking-wider block mb-2">
            Hardware Disaster Recovery
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportBackup}
              disabled={isExporting}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#252D22] border border-[#33402E] text-xs font-bold text-[#F4F7F2] hover:border-[#87A96B] transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#87A96B]" />
              <span>Export JSON Backup</span>
            </button>
            <label className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#252D22] border border-[#33402E] text-xs font-bold text-[#F4F7F2] hover:border-[#87A96B] cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>Import Snapshot</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
          {importError && (
            <p className="text-xs text-red-400 mt-2">{importError}</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-[#33402E] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#859A90] hover:text-[#F4F7F2]"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyVariant}
            className="px-5 py-2 rounded-xl bg-[#87A96B] text-[#1E241B] text-xs font-bold hover:bg-[#78995C] shadow-lg transition-all"
          >
            Apply Variant
          </button>
        </div>
      </div>
    </div>
  );
};
