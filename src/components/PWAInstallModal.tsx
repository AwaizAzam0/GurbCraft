import React, { useState } from 'react';
import { X, MonitorDown, CheckCircle2, WifiOff, ExternalLink } from 'lucide-react';
import type { ClientOS } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  initialOS: ClientOS;
  offlineReady: boolean;
  canPromptNatively: boolean;
  onTriggerNativeInstall: () => Promise<boolean>;
  onClose: () => void;
}

const OS_GUIDES: {
  id: ClientOS;
  label: string;
  browser: string;
  steps: string[];
}[] = [
  {
    id: 'linux',
    label: 'Linux',
    browser: 'Chrome / Chromium / Edge / Brave',
    steps: [
      'Click the Install icon in the browser address bar (or open Menu ⋮ → Cast, save, and share → Install GrubCraft).',
      'Pin GrubCraft to your desktop launcher or GNOME/KDE dock — launches standalone and works offline.',
    ],
  },
  {
    id: 'windows',
    label: 'Windows',
    browser: 'Edge / Chrome',
    steps: [
      'Click the App Available / Install icon on the right side of the address bar (or Menu ⋮ → Apps → Install GrubCraft).',
      'Confirm Install to create a Start Menu & desktop shortcut that runs offline without a browser bar.',
    ],
  },
  {
    id: 'macos',
    label: 'macOS',
    browser: 'Safari 17+ / Chrome / Edge',
    steps: [
      'In Safari: click File → Add to Dock… (or Share → Add to Dock).',
      'In Chrome/Edge: click the Install icon in the address bar → Install to open GrubCraft from Spotlight or Dock.',
    ],
  },
  {
    id: 'android',
    label: 'Android',
    browser: 'Chrome / Edge / Samsung Internet',
    steps: [
      'Tap the browser Menu (⋮) and choose Install app or Add to Home screen.',
      'Tap Install to place the GrubCraft app icon on your home screen with full offline caching.',
    ],
  },
  {
    id: 'ios',
    label: 'iOS / iPadOS',
    browser: 'Safari',
    steps: [
      'Tap the Share button at the bottom (iPhone) or top toolbar (iPad) of Safari.',
      'Scroll down and tap Add to Home Screen, then tap Add in the top-right corner.',
    ],
  },
];

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  initialOS,
  offlineReady,
  canPromptNatively,
  onTriggerNativeInstall,
  onClose,
}) => {
  const [selectedOS, setSelectedOS] = useState<ClientOS>(initialOS);
  const activeGuide = OS_GUIDES.find((g) => g.id === selectedOS) ?? OS_GUIDES[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-xl bg-[#101319] border border-[#283142] shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1E2430] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/pwa-192x192.png"
              alt=""
              className="w-8 h-8 rounded-lg border border-[#283142] shrink-0"
            />
            <div className="min-w-0">
              <h2
                id="pwa-install-title"
                className="font-display text-base font-bold text-[#F1F5F9] truncate"
              >
                Install GrubCraft App (PWA)
              </h2>
              <p className="text-xs text-[#94A3B8] truncate">
                Works offline on Windows, macOS, Linux, Android & iOS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close install dialog"
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E2430] cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Offline readiness notice */}
          <div className="px-3.5 py-2.5 rounded-lg bg-[#0B0D11] border border-[#1E2430] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#CBD5E1]">
              {offlineReady ? (
                <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" aria-hidden="true" />
              ) : (
                <WifiOff className="w-4 h-4 text-[#60A5FA] shrink-0" aria-hidden="true" />
              )}
              <span>
                {offlineReady
                  ? 'Offline cache active — GrubCraft works without internet.'
                  : 'Service worker caching all presets, icons & studio offline.'}
              </span>
            </div>
          </div>

          {canPromptNatively && (
            <button
              type="button"
              onClick={async () => {
                const ok = await onTriggerNativeInstall();
                if (ok) onClose();
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <MonitorDown className="w-4 h-4" aria-hidden="true" />
              Install GrubCraft Now
            </button>
          )}

          {/* OS Selector */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-[#94A3B8]">
              Platform Install Steps
            </div>
            <div className="flex flex-wrap gap-1.5">
              {OS_GUIDES.map((guide) => (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => setSelectedOS(guide.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                    selectedOS === guide.id
                      ? 'bg-[#2563EB] border-[#3B82F6] text-white'
                      : 'bg-[#0B0D11] border-[#1E2430] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {guide.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#0B0D11] border border-[#1E2430] space-y-2.5">
            <div className="text-xs font-mono text-[#60A5FA]">{activeGuide.browser}</div>
            <ol className="space-y-2 text-xs text-[#CBD5E1] list-decimal list-inside leading-relaxed">
              {activeGuide.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
            {typeof window !== 'undefined' && window.self !== window.top && (
              <p className="pt-1 text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3 shrink-0 text-[#60A5FA]" aria-hidden="true" />
                If viewing inside an embedded frame, open the direct app URL in a browser tab to trigger browser installation.
              </p>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[#1E2430] bg-[#0D1016] flex items-center justify-between text-xs text-[#64748B]">
          <a
            href="https://awaizazam0.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#60A5FA] transition-colors"
          >
            By Awaiz Azam
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-[#E2E8F0] bg-[#161B24] hover:bg-[#1E2430] border border-[#283142] rounded-lg cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
