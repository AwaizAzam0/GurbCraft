import React, { useState } from 'react';
import { Copy, Check, Download, ArrowLeft } from 'lucide-react';
import type { ResolutionPreset } from '../grub/types';

interface InstallGuideViewProps {
  themeName: string;
  resolution: ResolutionPreset;
  onExportZip: () => void;
  onBackToStudio: () => void;
}

type DistroFamily = 'deb' | 'rpm' | 'pacman' | 'apk';

interface DistroGuide {
  id: DistroFamily;
  label: string;
  distros: string;
  pkgCmd: string;
  themesDir: string;
  grubCfgCmd: string;
  notes: string;
}

const DISTRO_GUIDES: DistroGuide[] = [
  {
    id: 'deb',
    label: 'DEB (apt)',
    distros: 'Debian, Ubuntu, Linux Mint, Pop!_OS, Zorin OS, Kali',
    pkgCmd: 'sudo apt update && sudo apt install -y unzip fonts-dejavu grub-common',
    themesDir: '/boot/grub/themes',
    grubCfgCmd: 'sudo update-grub',
    notes:
      'On Debian/Ubuntu systems, ensure GRUB_TERMINAL_OUTPUT="console" is commented out in /etc/default/grub so graphical themes render at boot.',
  },
  {
    id: 'rpm',
    label: 'RPM (dnf / zypper)',
    distros: 'Fedora, RHEL, CentOS Stream, Nobara, openSUSE Tumbleweed/Leap',
    pkgCmd:
      '# Fedora / RHEL / Nobara:\nsudo dnf install -y unzip dejavu-sans-fonts dejavu-sans-mono-fonts\n\n# openSUSE:\nsudo zypper install -y unzip dejavu-fonts',
    themesDir: '/boot/grub2/themes',
    grubCfgCmd:
      '# Fedora / Nobara (UEFI & BIOS):\nsudo grub2-mkconfig -o /boot/grub2/grub.cfg\n\n# openSUSE:\nsudo grub2-mkconfig -o /boot/grub2/grub.cfg',
    notes:
      'RPM-based distributions use /boot/grub2/ rather than /boot/grub/. Make sure GRUB_ENABLE_BLSCFG=true works with your theme or set GRUB_TERMINAL_OUTPUT="gfxterm".',
  },
  {
    id: 'pacman',
    label: 'Pacman (Arch)',
    distros: 'Arch Linux, Manjaro, EndeavourOS, CachyOS, Garuda, SteamOS',
    pkgCmd: 'sudo pacman -S --needed unzip ttf-dejavu grub os-prober',
    themesDir: '/boot/grub/themes',
    grubCfgCmd: 'sudo grub-mkconfig -o /boot/grub/grub.cfg',
    notes:
      'If dual-booting Windows or another Linux distro, uncomment GRUB_DISABLE_OS_PROBER=false in /etc/default/grub before running grub-mkconfig.',
  },
  {
    id: 'apk',
    label: 'APK (Alpine)',
    distros: 'Alpine Linux, postmarketOS',
    pkgCmd: 'doas apk add unzip font-dejavu grub grub-efi',
    themesDir: '/boot/grub/themes',
    grubCfgCmd: 'doas grub-mkconfig -o /boot/grub/grub.cfg',
    notes:
      'Alpine uses doas (or sudo) and BusyBox ash. Confirm /etc/default/grub exists (create it if needed) and verify GRUB_GFXMODE matches your display.',
  },
];

const CopyBlock: React.FC<{ label: string; code: string }> = ({ label, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <div className="rounded-xl border border-[#1E2430] bg-[#101319] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#1E2430] flex items-center justify-between bg-[#0D1016]">
        <span className="text-xs font-medium text-[#CBD5E1]">{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="px-2.5 py-1 text-xs font-medium text-[#94A3B8] hover:text-white bg-[#161B24] border border-[#283142] rounded inline-flex items-center gap-1.5 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#4ADE80]" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-[#E2E8F0] overflow-x-auto leading-relaxed">
        {code}
      </pre>
    </div>
  );
};

export const InstallGuideView: React.FC<InstallGuideViewProps> = ({
  themeName,
  resolution,
  onExportZip,
  onBackToStudio,
}) => {
  const [family, setFamily] = useState<DistroFamily>('deb');
  const activeGuide = DISTRO_GUIDES.find((d) => d.id === family) ?? DISTRO_GUIDES[0];

  const safeSlug = themeName || 'nordic-slate';
  const sudoPrefix = family === 'apk' ? 'doas' : 'sudo';
  const extractCmd = `${sudoPrefix} mkdir -p ${activeGuide.themesDir}\n${sudoPrefix} unzip -o ${safeSlug}.zip -d ${activeGuide.themesDir}/`;
  const grubDefaultSnippet = `GRUB_GFXMODE=${resolution.width}x${resolution.height}\nGRUB_GFXPAYLOAD_LINUX=keep\nGRUB_THEME="${activeGuide.themesDir}/${safeSlug}/theme.txt"`;
  const pf2Cmd = `# Optional: convert DejaVu TTF to GRUB .pf2 bitmap fonts inside the theme folder\n${sudoPrefix} grub-mkfont -s 18 -o ${activeGuide.themesDir}/${safeSlug}/dejavu_18.pf2 /usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#1E2430]">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#F1F5F9]">
            Install Your GRUB2 Theme on Linux
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Step-by-step instructions for Debian/Ubuntu (deb), Fedora/RHEL/openSUSE (rpm), Arch (pacman), and Alpine (apk).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToStudio}
            className="px-3.5 py-2 text-xs font-medium text-[#E2E8F0] bg-[#161B24] hover:bg-[#1E2430] border border-[#283142] rounded-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Studio
          </button>
          <button
            type="button"
            onClick={onExportZip}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Download {safeSlug}.zip
          </button>
        </div>
      </div>

      {/* Distribution Ecosystem Switcher */}
      <div className="space-y-2">
        <div
          role="tablist"
          aria-label="Linux distribution package manager"
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
        >
          {DISTRO_GUIDES.map((guide) => {
            const active = guide.id === family;
            return (
              <button
                key={guide.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFamily(guide.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#2563EB] border-[#2563EB] text-white'
                    : 'bg-[#101319] border-[#1E2430] text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                {guide.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[#94A3B8]">
          Applies to: <span className="text-[#E2E8F0]">{activeGuide.distros}</span>
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[#F1F5F9]">
            01. Install prerequisites & DejaVu fonts
          </h2>
          <CopyBlock label={`Install packages (${activeGuide.label})`} code={activeGuide.pkgCmd} />
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[#F1F5F9]">
            02. Extract theme package to {activeGuide.themesDir}/
          </h2>
          <p className="text-xs text-[#94A3B8]">
            The exported ZIP places theme.txt, background.png, and all 24 icons/*.png inside {safeSlug}/.
          </p>
          <CopyBlock label="Extract Archive" code={extractCmd} />
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[#F1F5F9]">
            03. Configure /etc/default/grub
          </h2>
          <p className="text-xs text-[#94A3B8]">{activeGuide.notes}</p>
          <CopyBlock label="/etc/default/grub" code={grubDefaultSnippet} />
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[#F1F5F9]">
            04. Regenerate GRUB configuration
          </h2>
          <CopyBlock label="Regenerate grub.cfg" code={activeGuide.grubCfgCmd} />
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[#F1F5F9]">
            05. Optional: Generate native .pf2 DejaVu font
          </h2>
          <CopyBlock label="Convert DejaVu Sans to GRUB .pf2" code={pf2Cmd} />
        </div>
      </div>

      <footer className="pt-4 pb-2 border-t border-[#1E2430] flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]">
        <span>GrubCraft · Live GRUB2 Theme Studio</span>
        <a
          href="https://awaizazam0.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#60A5FA] transition-colors underline decoration-[#334155] underline-offset-2"
        >
          By Awaiz Azam
        </a>
      </footer>
    </div>
  );
};
