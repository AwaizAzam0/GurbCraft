import React from 'react';
import { Download, MonitorDown } from 'lucide-react';

export type WorkspaceView = 'studio' | 'presets' | 'assets' | 'install';

interface TopBarProps {
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  onExportZip: () => void;
  isExporting: boolean;
  showInstallButton: boolean;
  onInstallApp: () => void;
}

const NAV_ITEMS: { id: WorkspaceView; label: string }[] = [
  { id: 'studio', label: 'Studio' },
  { id: 'presets', label: 'Presets' },
  { id: 'assets', label: 'Assets' },
  { id: 'install', label: 'Install Guide' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onSelectView,
  onExportZip,
  isExporting,
  showInstallButton,
  onInstallApp,
}) => {
  return (
    <header className="h-14 px-2 sm:px-6 border-b border-[#1E2430] bg-[#0B0D11] flex items-center justify-between gap-1 sm:gap-6 shrink-0">
      {/* Zone 1: Brand Wordmark + Author Link */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2 shrink-0 leading-none">
        <a
          href="#studio"
          onClick={(e) => {
            e.preventDefault();
            onSelectView('studio');
          }}
          className="font-display text-sm sm:text-lg font-bold tracking-tight text-[#F1F5F9] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded"
        >
          GrubCraft
        </a>
        <a
          href="https://awaizazam0.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] sm:text-xs font-medium text-[#94A3B8] hover:text-[#60A5FA] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded"
        >
          By Awaiz Azam
        </a>
      </div>

      {/* Zone 2: Clean single-line navigation links */}
      <nav aria-label="Primary navigation" className="flex items-center gap-1.5 sm:gap-6">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`relative py-1 text-[11px] sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded cursor-pointer ${
                isActive
                  ? 'text-[#F1F5F9]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              {item.id === 'install' ? (
                <>
                  <span className="sm:hidden">Guide</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </>
              ) : (
                item.label
              )}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 right-0 -bottom-[17px] h-[2px] bg-[#3B82F6]"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Install App (PWA) & Export .zip actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {showInstallButton && (
          <button
            type="button"
            onClick={onInstallApp}
            aria-label="Install GrubCraft app"
            className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium text-[#E2E8F0] bg-[#161B24] hover:bg-[#1E2430] border border-[#283142] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
          >
            <MonitorDown className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#60A5FA]" aria-hidden="true" />
            <span className="sm:hidden">Install</span>
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}
        <button
          type="button"
          onClick={onExportZip}
          disabled={isExporting}
          title="Export GRUB2 theme ZIP (Alt+S)"
          aria-keyshortcuts="Alt+S"
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
        >
          <Download className="w-3 sm:w-3.5 h-3 sm:h-3.5" aria-hidden="true" />
          <span className="sm:hidden">{isExporting ? '...' : 'Export'}</span>
          <span className="hidden sm:inline">{isExporting ? 'Packaging...' : 'Export .zip'}</span>
        </button>
      </div>
    </header>
  );
};
