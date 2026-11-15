import React from 'react';
import type { OsIconClass } from './types';

export const OS_ICON_CLASSES: { id: OsIconClass; label: string }[] = [
  { id: 'ubuntu', label: 'Ubuntu' },
  { id: 'arch', label: 'Arch Linux' },
  { id: 'fedora', label: 'Fedora' },
  { id: 'debian', label: 'Debian' },
  { id: 'manjaro', label: 'Manjaro' },
  { id: 'endeavouros', label: 'EndeavourOS' },
  { id: 'popos', label: 'Pop!_OS' },
  { id: 'linuxmint', label: 'Linux Mint' },
  { id: 'opensuse', label: 'openSUSE' },
  { id: 'nixos', label: 'NixOS' },
  { id: 'gentoo', label: 'Gentoo' },
  { id: 'kali', label: 'Kali Linux' },
  { id: 'cachyos', label: 'CachyOS' },
  { id: 'garuda', label: 'Garuda Linux' },
  { id: 'alpine', label: 'Alpine Linux' },
  { id: 'void', label: 'Void Linux' },
  { id: 'nobara', label: 'Nobara' },
  { id: 'steamos', label: 'SteamOS' },
  { id: 'zorin', label: 'Zorin OS' },
  { id: 'windows', label: 'Windows' },
  { id: 'macos', label: 'macOS' },
  { id: 'efi', label: 'UEFI / Firmware' },
  { id: 'linux', label: 'Generic Linux' },
  { id: 'memtest', label: 'Memory Test' },
];

export function getOsIconSvgString(iconClass: OsIconClass, size = 32): string {
  switch (iconClass) {
    case 'ubuntu':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#E95420"/>
        <circle cx="16" cy="16" r="6.2" stroke="#FFFFFF" stroke-width="2.4"/>
        <circle cx="16" cy="6.2" r="2.1" fill="#FFFFFF"/>
        <circle cx="7.5" cy="20.8" r="2.1" fill="#FFFFFF"/>
        <circle cx="24.5" cy="20.8" r="2.1" fill="#FFFFFF"/>
      </svg>`;
    case 'arch':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <path d="M16 3C14.2 7.5 12.9 10.6 10.6 15.2C12.1 16.7 13.9 18.4 16.5 20.1C13.7 19 11.7 17.9 10.1 16.5C7.6 21.3 4.8 25.4 3 28.5C7.6 25.9 11.4 24.4 14.5 24C14.2 22.9 14.1 21.8 14.3 20.6C14.6 18.7 15.8 17.2 17 17.3C18.2 17.4 18.9 19 18.7 21C18.6 21.8 18.4 22.7 18.1 23.5C21.2 24.1 24.9 25.7 29 28.5C26.4 23.8 24.3 19.6 22.5 15.8C20.9 14.6 19.5 13.7 17.7 12.8C19.3 13.2 20.6 13.8 21.7 14.4C19.2 9.4 17.6 6.2 16 3Z" fill="#1793D1"/>
      </svg>`;
    case 'fedora':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <path d="M16 3C8.82 3 3 8.82 3 16v9.2C3 27.3 4.7 29 6.8 29H16c7.18 0 13-5.82 13-13S23.18 3 16 3Z" fill="#294172"/>
        <path d="M20.5 9.5a4 4 0 0 0-4 4v5.8a4.2 4.2 0 0 1-4.2 4.2h-.8a1.5 1.5 0 0 1 0-3h.8a1.2 1.2 0 0 0 1.2-1.2v-5.8a7 7 0 0 1 7-7h1.2a1.5 1.5 0 0 1 0 3H20.5Z" fill="#FFFFFF"/>
        <rect x="11" y="15" width="9" height="2.8" rx="1.4" fill="#51A2DA"/>
      </svg>`;
    case 'debian':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <path d="M17.8 26.8c-6.2-.4-11.2-5.4-11.2-11.6 0-5.4 4.4-9.8 9.8-9.8 4.4 0 8 3.6 8 8 0 3.5-2.8 6.3-6.3 6.3-2.6 0-4.7-2.1-4.7-4.7 0-1.9 1.5-3.4 3.4-3.4 1.3 0 2.4 1.1 2.4 2.4 0 .8-.7 1.5-1.5 1.5" stroke="#D70A53" stroke-width="2.6" stroke-linecap="round"/>
      </svg>`;
    case 'manjaro':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="7" height="24" rx="1.2" fill="#35BF5C"/>
        <rect x="4" y="4" width="16" height="7" rx="1.2" fill="#35BF5C"/>
        <rect x="13" y="13" width="7" height="15" rx="1.2" fill="#35BF5C"/>
        <rect x="22" y="4" width="6" height="24" rx="1.2" fill="#35BF5C"/>
      </svg>`;
    case 'endeavouros':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <path d="M17.5 4L6 25h20.5L17.5 4Z" fill="#7F7FFF"/>
        <path d="M17.5 4L28 24.5H17.5V4Z" fill="#FF6699" fill-opacity="0.85"/>
        <path d="M5 26.5c6.5 1.2 14.5 1 22.5-1.2l-2 2.2H6.5L5 26.5Z" fill="#C084FC"/>
      </svg>`;
    case 'popos':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13.5" fill="#48B9C7"/>
        <path d="M11 21V9h5.2c2.8 0 4.6 1.6 4.6 4.1 0 2.5-1.8 4.1-4.6 4.1H13.8V21H11Zm2.8-6.2h2.1c1.3 0 2.1-.6 2.1-1.7s-.8-1.7-2.1-1.7h-2.1v3.4Z" fill="#FFFFFF"/>
        <circle cx="22.5" cy="21" r="1.7" fill="#FFFFFF"/>
      </svg>`;
    case 'linuxmint':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <path d="M4 11a7 7 0 0 1 7-7h14a3 3 0 0 1 3 3v14a7 7 0 0 1-7 7H11a7 7 0 0 1-7-7V11Z" fill="#69B53F"/>
        <path d="M10 11v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7.5a2.5 2.5 0 0 0-5 0V19m-4.5 0v-5.5a2.5 2.5 0 0 1 5 0" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>
      </svg>`;
    case 'opensuse':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" stroke="#73BA25" stroke-width="2.6"/>
        <path d="M9 18c1.5-4.5 6-7 10.5-5.5 3 1 5 3.5 5 6.5H11" stroke="#73BA25" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="20.5" cy="14.5" r="2" fill="#73BA25"/>
      </svg>`;
    case 'nixos':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <path d="M13 6l5 8.5M19 6l-5 8.5M7 16h10M15 16h10M13 26l5-8.5M19 26l-5-8.5" stroke="#5277C3" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="16" cy="16" r="2.2" fill="#7EBAE4"/>
      </svg>`;
    case 'gentoo':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <path d="M7 22c3.5-8 10.5-15 17-12 3.5 1.6 3.2 6.5-1 10-4.5 3.8-11 7-15 6.5-2.5-.3-2.5-1.8-1-4.5Z" fill="#54487A" stroke="#C4B5FD" stroke-width="1.6"/>
        <circle cx="19" cy="14" r="2.2" fill="#FFFFFF"/>
      </svg>`;
    case 'kali':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <path d="M6 19c4-7 11-12 19-11-3.5 2-5.5 4.5-6 7.5 3-1 6-.5 8 1.5-4 .5-7 2.5-8.5 5.5-2.5 2-6 3-10.5 1.5 2-1.5 3-3 3.5-5H6Z" fill="#367BF0"/>
      </svg>`;
    case 'cachyos':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <path d="M22 7H12L6 16l6 9h10l-4-5h-4l-3-4 3-4h4l4-5Z" fill="#00AA88"/>
        <circle cx="24" cy="12" r="2" fill="#2DD4BF"/>
        <circle cx="25" cy="19" r="1.5" fill="#2DD4BF"/>
      </svg>`;
    case 'garuda':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <path d="M5 17l7-9h12l-4 5h-6l-3 4 4 4h7l4 4H12L5 17Z" fill="#EC4899"/>
        <path d="M16 14h10l-3 4h-7v-4Z" fill="#38BDF8"/>
      </svg>`;
    case 'alpine':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <polygon points="16,4 27,10.5 27,21.5 16,28 5,21.5 5,10.5" fill="#0D597F"/>
        <path d="M8.5 21l5.5-8.5 3.8 5.8 2.2-3.3 3.5 6H8.5Z" fill="#FFFFFF"/>
      </svg>`;
    case 'void':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <path d="M16 5a11 11 0 0 1 9.5 5.5l-3.5 2A7 7 0 0 0 10.5 11L7 9A11 11 0 0 1 16 5Z" fill="#478061"/>
        <path d="M16 27a11 11 0 0 1-9.5-5.5l3.5-2A7 7 0 0 0 21.5 21l3.5 2A11 11 0 0 1 16 27Z" fill="#478061"/>
        <circle cx="16" cy="16" r="3.2" fill="#A7F3D0"/>
      </svg>`;
    case 'nobara':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12.5" stroke="#F8FAFC" stroke-width="2.2" fill="#1E293B"/>
        <path d="M11 22V10l10 12V10" stroke="#F59E0B" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    case 'steamos':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13.5" fill="#1B2838" stroke="#66C0F4" stroke-width="1.6"/>
        <circle cx="20" cy="12" r="3.8" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="11.5" cy="20.5" r="2.8" stroke="#FFFFFF" stroke-width="2"/>
        <path d="M13.5 18.5l4.5-4.5M5 17l5 2.5" stroke="#66C0F4" stroke-width="2.4" stroke-linecap="round"/>
      </svg>`;
    case 'zorin':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <polygon points="9,7 23,7 28,16 23,25 9,25 4,16" fill="#15A6F0"/>
        <path d="M9 11h14l-14 10h14" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    case 'windows':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="11" height="11" rx="1.5" fill="#00A4EF"/>
        <rect x="17" y="4" width="11" height="11" rx="1.5" fill="#00A4EF"/>
        <rect x="4" y="17" width="11" height="11" rx="1.5" fill="#00A4EF"/>
        <rect x="17" y="17" width="11" height="11" rx="1.5" fill="#00A4EF"/>
      </svg>`;
    case 'macos':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="6" fill="#E2E8F0"/>
        <path d="M10 12v6M22 12v6M16 9v10h2.5M10.5 21.5c1.8 1.8 4.1 2.5 5.5 2.5s3.7-.7 5.5-2.5" stroke="#1E293B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    case 'efi':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <rect x="6" y="6" width="20" height="20" rx="3" stroke="#94A3B8" stroke-width="2.2"/>
        <rect x="11" y="11" width="10" height="10" rx="1.5" fill="#64748B"/>
        <path d="M12 2v4M20 2v4M12 26v4M20 26v4M2 12h4M2 20h4M26 12h4M26 20h4" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
    case 'memtest':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="9" width="24" height="14" rx="2" stroke="#F59E0B" stroke-width="2"/>
        <rect x="8" y="13" width="4" height="6" fill="#F59E0B"/>
        <rect x="14" y="13" width="4" height="6" fill="#F59E0B"/>
        <rect x="20" y="13" width="4" height="6" fill="#F59E0B"/>
        <path d="M8 23v3M13 23v3M19 23v3M24 23v3" stroke="#F59E0B" stroke-width="2"/>
      </svg>`;
    case 'linux':
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="#CBD5E1" stroke-width="2.2"/>
        <path d="M11 12l5 4-5 4M16.5 20H22" stroke="#38BDF8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  }
}

export const OsIcon: React.FC<{
  iconClass: OsIconClass;
  customUrl?: string;
  size?: number;
}> = ({ iconClass, customUrl, size = 24 }) => {
  if (customUrl) {
    return (
      <img
        src={customUrl}
        alt={`${iconClass} icon`}
        referrerPolicy="no-referrer"
        style={{ width: size, height: size }}
        className="object-contain shrink-0"
      />
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: getOsIconSvgString(iconClass, size) }}
    />
  );
};
