import nordicBg from '../assets/images/grub_bg_nordic_1794748976490.jpg';
import tokyoBg from '../assets/images/grub_bg_tokyo_1794748977574.jpg';
import alpineBg from '../assets/images/grub_bg_alpine_1794748977495.jpg';
import type {
  BootEntry,
  GrubPreset,
  PresetCategory,
  PresetLayoutKind,
  PresetProceduralBg,
  ResolutionPreset,
} from './types';

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { label: '1920 x 1080 (FHD)', width: 1920, height: 1080 },
  { label: '1600 x 900 (HD+)', width: 1600, height: 900 },
  { label: '1280 x 720 (HD)', width: 1280, height: 720 },
  { label: '1024 x 768 (XGA)', width: 1024, height: 768 },
];

export const CURATED_WALLPAPERS = [
  { id: 'nordic', name: 'Nordic Fjord', url: nordicBg },
  { id: 'tokyo', name: 'Anodized Horizon', url: tokyoBg },
  { id: 'alpine', name: 'Limestone Mist', url: alpineBg },
];

export const PRESET_CATEGORIES: { id: PresetCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Presets' },
  { id: 'featured', label: 'Featured' },
  { id: 'minimal-dark', label: 'Minimal Dark' },
  { id: 'minimal-light', label: 'Minimal Light' },
  { id: 'glass-editorial', label: 'Glass & Editorial' },
  { id: 'aurora-gradient', label: 'Aurora & Gradient' },
  { id: 'terminal-retro', label: 'Terminal & Retro' },
  { id: 'distro-inspired', label: 'Distro Inspired' },
];

export const DEFAULT_BOOT_ENTRIES: BootEntry[] = [
  {
    id: 'entry_ubuntu',
    title: 'Ubuntu 24.04.1 LTS (Noble Numbat)',
    iconClass: 'ubuntu',
    isDefault: true,
    kernelLines: [
      'load_video',
      'gfxmode $linux_gfx_mode',
      'insmod gzio',
      'insmod part_gpt',
      'insmod ext2',
      'search --no-floppy --fs-uuid --set=root 9f4e2a1b-8c3d-4e7a-b1f2-0d6c5e8a9b10',
      'linux /boot/vmlinuz-6.8.0-45-generic root=UUID=9f4e2a1b-8c3d ro quiet splash',
      'initrd /boot/initrd.img-6.8.0-45-generic',
    ],
  },
  {
    id: 'entry_arch',
    title: 'Arch Linux (Linux 6.11-zen)',
    iconClass: 'arch',
    kernelLines: [
      'load_video',
      'insmod part_gpt',
      'insmod btrfs',
      'search --no-floppy --label --set=root ARCH_ROOT',
      'linux /@/boot/vmlinuz-linux-zen root=LABEL=ARCH_ROOT rootflags=subvol=@ rw quiet',
      'initrd /@/boot/initramfs-linux-zen.img',
    ],
  },
  {
    id: 'entry_fedora',
    title: 'Fedora Workstation 41',
    iconClass: 'fedora',
    kernelLines: [
      'insmod part_gpt',
      'insmod xfs',
      'search --no-floppy --fs-uuid --set=root c82a190d-11e0-44a2-99b3-78c10e440120',
      'linux /vmlinuz-6.11.4-301.fc41.x86_64 root=UUID=c82a190d rhgb quiet',
      'initrd /initramfs-6.11.4-301.fc41.x86_64.img',
    ],
  },
  {
    id: 'entry_windows',
    title: 'Windows Boot Manager (on /dev/nvme0n1p1)',
    iconClass: 'windows',
    kernelLines: [
      'insmod part_gpt',
      'insmod fat',
      'search --no-floppy --fs-uuid --set=root 4A1C-89F0',
      'chainloader /EFI/Microsoft/Boot/bootmgfw.efi',
    ],
  },
  {
    id: 'entry_efi',
    title: 'UEFI Firmware Settings',
    iconClass: 'efi',
    kernelLines: ['fwsetup'],
  },
];

interface ThemeTemplateSpec {
  id: string;
  name: string;
  subtitle: string;
  author: string;
  category: PresetCategory;
  layout: PresetLayoutKind;
  desktopColor: string;
  menuBg: string;
  menuBorder: string;
  itemColor: string;
  selectedColor: string;
  selectedBg: string;
  accentColor: string;
  labelColor: string;
  titleText: string;
  progressText: string;
  keymapText?: string;
  backgroundUrl?: string;
  proceduralBg?: PresetProceduralBg;
  timeoutSeconds?: number;
  monoFont?: boolean;
  borderlessMenu?: boolean;
  sharpCorners?: boolean;
}

function buildThemeTxtFromSpec(spec: ThemeTemplateSpec): string {
  const fontBase = spec.monoFont ? 'DejaVu Sans Mono' : 'DejaVu Sans';
  const titleFont = `${fontBase} Bold 26`;
  const itemFont = `${fontBase} Regular 18`;
  const selFont = `${fontBase} Bold 18`;
  const smallFont = `DejaVu Sans Mono Regular 13`;
  const keymap = spec.keymapText ?? '@KEYMAP_LONG@';

  const isBorderless =
    spec.borderlessMenu ||
    spec.layout === 'floating' ||
    spec.layout === 'bottom-shelf';

  const actualMenuBg = isBorderless ? 'transparent' : spec.menuBg;
  const actualMenuBorder = isBorderless ? 'transparent' : spec.menuBorder;

  // Distinct coordinates per layout architecture
  let menuLeft = '50%-300';
  let menuTop = '27%';
  let menuWidth = '600';
  let menuHeight = '46%';
  let itemHeight = 46;
  let itemPadding = 14;
  let itemSpacing = 8;
  let iconSize = 28;
  let menuRadius = spec.sharpCorners ? '2' : '12';

  let labelLeft = '0';
  let labelTop = '13%';
  let labelWidth = '100%';
  let labelAlign = 'center';

  let timerLeft = '50%-220';
  let timerTop = '79%';
  let timerWidth = '440';

  let keymapLeft = '0';
  let keymapTop = '90%';
  let keymapWidth = '100%';
  let keymapAlign = 'center';

  switch (spec.layout) {
    case 'left-dock':
      menuLeft = '6%';
      menuTop = '22%';
      menuWidth = '500';
      menuHeight = '54%';
      itemHeight = 48;
      labelLeft = '6%';
      labelTop = '12%';
      labelWidth = '500';
      labelAlign = 'left';
      timerLeft = '6%';
      timerTop = '80%';
      timerWidth = '500';
      keymapLeft = '6%';
      keymapTop = '90%';
      keymapWidth = '680';
      keymapAlign = 'left';
      break;
    case 'right-split':
      menuLeft = '48%';
      menuTop = '22%';
      menuWidth = '44%';
      menuHeight = '54%';
      itemHeight = 48;
      labelLeft = '6%';
      labelTop = '38%';
      labelWidth = '36%';
      labelAlign = 'left';
      timerLeft = '6%';
      timerTop = '48%';
      timerWidth = '34%';
      keymapLeft = '48%';
      keymapTop = '82%';
      keymapWidth = '44%';
      keymapAlign = 'left';
      break;
    case 'bottom-shelf':
      menuLeft = '12%';
      menuTop = '48%';
      menuWidth = '76%';
      menuHeight = '32%';
      itemHeight = 42;
      itemSpacing = 6;
      labelLeft = '12%';
      labelTop = '37%';
      labelWidth = '76%';
      labelAlign = 'left';
      timerLeft = '12%';
      timerTop = '83%';
      timerWidth = '76%';
      keymapLeft = '12%';
      keymapTop = '91%';
      keymapWidth = '76%';
      keymapAlign = 'left';
      break;
    case 'floating':
      menuLeft = '50%-280';
      menuTop = '28%';
      menuWidth = '560';
      menuHeight = '44%';
      itemHeight = 46;
      itemSpacing = 10;
      labelTop = '15%';
      timerLeft = '50%-180';
      timerTop = '78%';
      timerWidth = '360';
      break;
    case 'wide-console':
      menuLeft = '50%-390';
      menuTop = '24%';
      menuWidth = '780';
      menuHeight = '48%';
      itemHeight = 54;
      itemPadding = 18;
      itemSpacing = 10;
      iconSize = 32;
      labelTop = '13%';
      timerLeft = '50%-300';
      timerTop = '78%';
      timerWidth = '600';
      break;
    case 'circle-hud':
      menuLeft = '8%';
      menuTop = '24%';
      menuWidth = '540';
      menuHeight = '50%';
      labelLeft = '8%';
      labelTop = '13%';
      labelWidth = '540';
      labelAlign = 'left';
      timerLeft = '74%';
      timerTop = '41%';
      timerWidth = '110';
      keymapLeft = '8%';
      keymapTop = '86%';
      keymapWidth = '620';
      keymapAlign = 'left';
      break;
    case 'terminal-box':
      menuLeft = '14%';
      menuTop = '22%';
      menuWidth = '72%';
      menuHeight = '52%';
      itemHeight = 42;
      itemPadding = 14;
      itemSpacing = 4;
      iconSize = 22;
      menuRadius = '2';
      labelLeft = '14%';
      labelTop = '12%';
      labelWidth = '72%';
      labelAlign = 'left';
      timerLeft = '14%';
      timerTop = '79%';
      timerWidth = '72%';
      keymapLeft = '14%';
      keymapTop = '88%';
      keymapWidth = '72%';
      keymapAlign = 'left';
      break;
    case 'centered-card':
    default:
      break;
  }

  let timerBlock = '';
  if (spec.layout === 'circle-hud') {
    timerBlock = `+ circular_progress {
  id = "__timeout__"
  left = "${timerLeft}"
  top = "${timerTop}"
  width = "108"
  height = "108"
  center_color = "${spec.menuBorder}"
  tick_color = "${spec.accentColor}"
}`;
  } else if (spec.layout === 'floating') {
    timerBlock = `+ label {
  id = "__timeout__"
  left = "${timerLeft}"
  top = "${timerTop}"
  width = "${timerWidth}"
  align = "center"
  text = "${spec.progressText}"
  font = "${smallFont}"
  color = "${spec.labelColor}"
}`;
  } else {
    timerBlock = `+ progress_bar {
  id = "__timeout__"
  left = "${timerLeft}"
  top = "${timerTop}"
  width = "${timerWidth}"
  height = "26"
  font = "${smallFont}"
  text_color = "${spec.selectedColor}"
  fg_color = "${spec.accentColor}"
  bg_color = "${spec.menuBg}"
  border_color = "${spec.menuBorder}"
  text = "${spec.progressText}"
}`;
  }

  return `# ${spec.name} — GRUB2 Theme
# By ${spec.author}
title-text: ""
desktop-image: "background.png"
desktop-image-scale-method: "crop"
desktop-color: "${spec.desktopColor}"
terminal-font: "DejaVu Sans Mono Regular 16"
terminal-left: "8%"
terminal-top: "12%"
terminal-width: "84%"
terminal-height: "76%"
message-font: "${smallFont}"
message-color: "${spec.itemColor}"

+ label {
  left = "${labelLeft}"
  top = "${labelTop}"
  width = "${labelWidth}"
  align = "${labelAlign}"
  text = "${spec.titleText}"
  font = "${titleFont}"
  color = "${spec.labelColor}"
}

+ boot_menu {
  left = "${menuLeft}"
  top = "${menuTop}"
  width = "${menuWidth}"
  height = "${menuHeight}"
  item_font = "${itemFont}"
  item_color = "${spec.itemColor}"
  selected_item_font = "${selFont}"
  selected_item_color = "${spec.selectedColor}"
  selected_item_bg_color = "${spec.selectedBg}"
  selected_item_border_color = "${spec.accentColor}"
  menu_bg_color = "${actualMenuBg}"
  menu_border_color = "${actualMenuBorder}"
  menu_radius = ${menuRadius}
  item_height = ${itemHeight}
  item_padding = ${itemPadding}
  item_spacing = ${itemSpacing}
  icon_width = ${iconSize}
  icon_height = ${iconSize}
  item_icon_space = 14
  scrollbar = true
  scrollbar_width = 6
}

${timerBlock}

+ label {
  left = "${keymapLeft}"
  top = "${keymapTop}"
  width = "${keymapWidth}"
  align = "${keymapAlign}"
  text = "${keymap}"
  font = "${smallFont}"
  color = "${spec.itemColor}"
}`;
}

function makePreset(spec: ThemeTemplateSpec): GrubPreset {
  return {
    id: spec.id,
    name: spec.name,
    subtitle: spec.subtitle,
    author: spec.author,
    category: spec.category,
    layoutStyle: spec.layout,
    accentColor: spec.accentColor,
    baseColor: spec.desktopColor,
    menuBgColor: spec.borderlessMenu || spec.layout === 'floating' || spec.layout === 'bottom-shelf' ? 'transparent' : spec.menuBg,
    selectedBgColor: spec.selectedBg,
    selectedTextColor: spec.selectedColor,
    itemTextColor: spec.itemColor,
    backgroundUrl: spec.backgroundUrl ?? '',
    proceduralBg: spec.proceduralBg,
    timeoutSeconds: spec.timeoutSeconds ?? 8,
    entries: DEFAULT_BOOT_ENTRIES,
    themeTxt: buildThemeTxtFromSpec(spec),
  };
}

const PRESET_SPECS: ThemeTemplateSpec[] = [
  // ── FEATURED (7) ─────────────────────────────────────────────────────────────
  {
    id: 'office-minimal',
    name: 'Office Minimal',
    subtitle: 'Inspired by yeyushengfan258 — floating minimal list over layered slate waves',
    author: 'Inspired by yeyushengfan258',
    category: 'featured',
    layout: 'floating',
    desktopColor: '#12151C',
    menuBg: '#181C25',
    menuBorder: '#2B3242',
    itemColor: '#9AA5B8',
    selectedColor: '#FFFFFF',
    selectedBg: '#2563EB',
    accentColor: '#60A5FA',
    labelColor: '#F1F5F9',
    titleText: 'GNU GRUB  ·  Workstation',
    progressText: 'Booting selected system in %d seconds',
    proceduralBg: {
      style: 'waves',
      baseColor: '#10141C',
      accentColor: '#3B82F6',
      secondaryColor: '#1E293B',
      density: 5,
      grain: 12,
    },
    timeoutSeconds: 8,
  },
  {
    id: 'steam-big-picture',
    name: 'Steam Big Picture',
    subtitle: 'Inspired by LegendaryBibo — wide console highlight cards & radial glow',
    author: 'Inspired by LegendaryBibo',
    category: 'featured',
    layout: 'wide-console',
    desktopColor: '#0E1A2B',
    menuBg: '#132236',
    menuBorder: '#244061',
    itemColor: '#8FB0CC',
    selectedColor: '#FFFFFF',
    selectedBg: '#1F3B5C',
    accentColor: '#2374AB',
    labelColor: '#C7D5E0',
    titleText: 'BIG PICTURE BOOT MENU',
    progressText: 'Launching selected OS in %d seconds...',
    keymapText: '↑↓ Navigate   Enter Launch   E Edit   C Console',
    proceduralBg: {
      style: 'radial',
      baseColor: '#0B1421',
      accentColor: '#66C0F4',
      secondaryColor: '#1B2838',
      density: 5,
      grain: 10,
    },
    timeoutSeconds: 10,
  },
  {
    id: 'comet-cosmic',
    name: 'Comet Cosmic',
    subtitle: 'Inspired by fenrir-lupus-canis/comet-grub-themes — starfield & comet trail',
    author: 'Inspired by fenrir-lupus-canis',
    category: 'featured',
    layout: 'right-split',
    desktopColor: '#070912',
    menuBg: '#0E1222',
    menuBorder: '#262B45',
    itemColor: '#98A2C4',
    selectedColor: '#FFFFFF',
    selectedBg: '#312E81',
    accentColor: '#818CF8',
    labelColor: '#E0E7FF',
    titleText: 'COMET // SYSTEM SELECT',
    progressText: 'Ignition in %ds',
    proceduralBg: {
      style: 'starfield',
      baseColor: '#070912',
      accentColor: '#818CF8',
      secondaryColor: '#38BDF8',
      density: 7,
      grain: 12,
    },
    timeoutSeconds: 8,
  },
  {
    id: 'graphite-dark',
    name: 'Graphite Dark',
    subtitle: 'Inspired by vinceliuice/Graphite-gtk-theme — sharp monochrome precision',
    author: 'Inspired by vinceliuice',
    category: 'featured',
    layout: 'floating',
    sharpCorners: true,
    desktopColor: '#1C1C1E',
    menuBg: '#232326',
    menuBorder: '#3A3A3F',
    itemColor: '#A1A1AA',
    selectedColor: '#18181B',
    selectedBg: '#F4F4F5',
    accentColor: '#FFFFFF',
    labelColor: '#FAFAFA',
    titleText: 'GRUB2  ·  Graphite Dark',
    progressText: 'Booting in %d seconds',
    proceduralBg: {
      style: 'stripes',
      baseColor: '#18181B',
      accentColor: '#52525B',
      secondaryColor: '#27272A',
      density: 6,
      grain: 18,
    },
    timeoutSeconds: 7,
  },
  {
    id: 'graphite-light',
    name: 'Graphite Light',
    subtitle: 'Inspired by vinceliuice Graphite Light — porcelain & charcoal contrast',
    author: 'Inspired by vinceliuice',
    category: 'featured',
    layout: 'left-dock',
    sharpCorners: true,
    desktopColor: '#E5E7EB',
    menuBg: '#F4F5F7',
    menuBorder: '#CBD5E1',
    itemColor: '#4B5563',
    selectedColor: '#FFFFFF',
    selectedBg: '#1F2937',
    accentColor: '#111827',
    labelColor: '#111827',
    titleText: 'GRUB2  ·  Graphite Light',
    progressText: 'Starting default OS in %ds',
    proceduralBg: {
      style: 'stripes',
      baseColor: '#E5E7EB',
      accentColor: '#9CA3AF',
      secondaryColor: '#D1D5DB',
      density: 5,
      grain: 10,
    },
    timeoutSeconds: 7,
  },
  {
    id: 'nordic-slate',
    name: 'Nordic Slate',
    subtitle: 'Centered glass card over deep twilight Nordic peaks',
    author: 'Awaiz Azam',
    category: 'featured',
    layout: 'centered-card',
    desktopColor: '#0B1120',
    menuBg: '#0F172A',
    menuBorder: '#1E293B',
    itemColor: '#94A3B8',
    selectedColor: '#FFFFFF',
    selectedBg: '#1E293B',
    accentColor: '#0284C7',
    labelColor: '#E2E8F0',
    titleText: 'GNU GRUB  ·  Select Operating System',
    progressText: 'Booting selected entry in %d seconds...',
    backgroundUrl: nordicBg,
    timeoutSeconds: 8,
  },
  {
    id: 'copper-monolith',
    name: 'Copper Monolith',
    subtitle: 'Left-docked architectural concrete & brushed amber highlights',
    author: 'Awaiz Azam',
    category: 'featured',
    layout: 'left-dock',
    desktopColor: '#11100F',
    menuBg: '#1C1917',
    menuBorder: '#292524',
    itemColor: '#A8A29E',
    selectedColor: '#FEF3C7',
    selectedBg: '#292524',
    accentColor: '#D97706',
    labelColor: '#F59E0B',
    titleText: 'SYSTEM BOOTLOADER // UEFI',
    progressText: 'Automatic boot in %ds',
    backgroundUrl: tokyoBg,
    timeoutSeconds: 10,
  },

  // ── MINIMAL DARK (10) ────────────────────────────────────────────────────────
  {
    id: 'obsidian-matte',
    name: 'Obsidian Matte',
    subtitle: 'Borderless bottom shelf leaving upper geometric canvas clear',
    author: 'GrubCraft',
    category: 'minimal-dark',
    layout: 'bottom-shelf',
    desktopColor: '#09090B',
    menuBg: '#111114',
    menuBorder: '#27272A',
    itemColor: '#A1A1AA',
    selectedColor: '#FAFAFA',
    selectedBg: '#27272A',
    accentColor: '#71717A',
    labelColor: '#E4E4E7',
    titleText: 'Select Boot Volume',
    progressText: 'Booting in %ds',
    proceduralBg: { style: 'mesh', baseColor: '#09090B', accentColor: '#27272A', secondaryColor: '#18181B', density: 4, grain: 16 },
  },
  {
    id: 'carbon-fiber',
    name: 'Carbon Precision',
    subtitle: 'Left-docked industrial grid with crisp sky blue selection',
    author: 'GrubCraft',
    category: 'minimal-dark',
    layout: 'left-dock',
    desktopColor: '#111317',
    menuBg: '#171A20',
    menuBorder: '#262C36',
    itemColor: '#8B95A5',
    selectedColor: '#F8FAFC',
    selectedBg: '#202632',
    accentColor: '#0EA5E9',
    labelColor: '#E2E8F0',
    titleText: 'UEFI Boot Manager',
    progressText: '%ds until default boot',
    proceduralBg: { style: 'grid', baseColor: '#111317', accentColor: '#0EA5E9', density: 7, grain: 14 },
  },
  {
    id: 'onyx-circle',
    name: 'Onyx Ring',
    subtitle: 'Asymmetric HUD layout with dedicated circular countdown ring',
    author: 'GrubCraft',
    category: 'minimal-dark',
    layout: 'circle-hud',
    desktopColor: '#0D0E12',
    menuBg: '#14161D',
    menuBorder: '#272B38',
    itemColor: '#9CA3AF',
    selectedColor: '#FFFFFF',
    selectedBg: '#1F2430',
    accentColor: '#38BDF8',
    labelColor: '#F3F4F6',
    titleText: 'GNU GRUB',
    progressText: '%d',
    proceduralBg: { style: 'radial', baseColor: '#0D0E12', accentColor: '#38BDF8', density: 4, grain: 12 },
  },
  {
    id: 'midnight-ink',
    name: 'Midnight Ink',
    subtitle: 'Right-split navy studio canvas with cobalt accents',
    author: 'GrubCraft',
    category: 'minimal-dark',
    layout: 'right-split',
    desktopColor: '#080D1A',
    menuBg: '#0E1629',
    menuBorder: '#1E2D4D',
    itemColor: '#8EA4C8',
    selectedColor: '#FFFFFF',
    selectedBg: '#1D4ED8',
    accentColor: '#60A5FA',
    labelColor: '#DBEAFE',
    titleText: 'Boot Configuration',
    progressText: 'Starting in %d seconds',
    proceduralBg: { style: 'waves', baseColor: '#080D1A', accentColor: '#2563EB', secondaryColor: '#1E3A8A', density: 5, grain: 14 },
  },
  {
    id: 'basalt-stone',
    name: 'Basalt Stone',
    subtitle: 'Warm dark basalt topographic map with muted lime indicator',
    author: 'GrubCraft',
    category: 'minimal-dark',
    layout: 'centered-card',
    desktopColor: '#141513',
    menuBg: '#1C1E1B',
    menuBorder: '#2E312B',
    itemColor: '#9CA397',
    selectedColor: '#F7FAF5',
    selectedBg: '#272B25',
    accentColor: '#84CC16',
    labelColor: '#ECFCCB',
    titleText: 'System Select',
    progressText: 'Auto-boot in %ds',
    proceduralBg: { style: 'topo', baseColor: '#141513', accentColor: '#65A30D', density: 6, grain: 18 },
  },
  {
    id: 'zinc-studio',
    name: 'Zinc Studio',
    subtitle: 'Wide architectural zinc console with Swiss diagonal bands',
    author: 'GrubCraft',
    category: 'minimal-dark',
    layout: 'wide-console',
    desktopColor: '#18181B',
    menuBg: '#202024',
    menuBorder: '#34343B',
    itemColor: '#A1A1AA',
    selectedColor: '#FFFFFF',
    selectedBg: '#3F3F46',
    accentColor: '#E4E4E7',
    labelColor: '#FAFAFA',
    titleText: 'Workstation Boot Menu',
    progressText: 'Continuing in %d seconds',
    proceduralBg: { style: 'stripes', baseColor: '#18181B', accentColor: '#52525B', secondaryColor: '#27272A', density: 5, grain: 15 },
  },
  {
    id: 'void-minimal',
    name: 'Void Minimal',
    subtitle: 'Pitch-black OLED borderless menu with emerald pill selection',
    author: 'GrubCraft',
    category: 'minimal-dark',
    layout: 'floating',
    desktopColor: '#000000',
    menuBg: '#09090B',
    menuBorder: '#18181B',
    itemColor: '#71717A',
    selectedColor: '#ECFDF5',
    selectedBg: '#065F46',
    accentColor: '#10B981',
    labelColor: '#D1FAE5',
    titleText: 'GRUB // BOOT',
    progressText: 'Booting in %d seconds',
    proceduralBg: { style: 'radial', baseColor: '#000000', accentColor: '#10B981', density: 2, grain: 8 },
  },
  {
    id: 'charcoal-slate',
    name: 'Charcoal Rose',
    subtitle: 'Left-aligned slate panel with crisp rose-crimson accent',
    author: 'GrubCraft',
    category: 'minimal-dark',
    layout: 'left-dock',
    desktopColor: '#131416',
    menuBg: '#1B1D20',
    menuBorder: '#2D3035',
    itemColor: '#9CA3AF',
    selectedColor: '#FFFFFF',
    selectedBg: '#881337',
    accentColor: '#F43F5E',
    labelColor: '#F3F4F6',
    titleText: 'Boot Target',
    progressText: 'Booting in %d seconds',
    proceduralBg: { style: 'waves', baseColor: '#131416', accentColor: '#E11D48', secondaryColor: '#27272A', density: 4, grain: 16 },
  },
  {
    id: 'iron-oxide',
    name: 'Iron & Rust',
    subtitle: 'Bottom-shelf iron canvas with warm terracotta-orange bar',
    author: 'GrubCraft',
    category: 'minimal-dark',
    layout: 'bottom-shelf',
    desktopColor: '#141110',
    menuBg: '#1E1917',
    menuBorder: '#332A26',
    itemColor: '#A89F9A',
    selectedColor: '#FFF7ED',
    selectedBg: '#9A3412',
    accentColor: '#EA580C',
    labelColor: '#FFEDD5',
    titleText: 'Kernel Selector',
    progressText: 'Booting selected kernel in %ds',
    proceduralBg: { style: 'mesh', baseColor: '#141110', accentColor: '#EA580C', secondaryColor: '#431407', density: 4, grain: 20 },
  },
  {
    id: 'deep-espresso',
    name: 'Espresso Ring',
    subtitle: 'Dark roast radial backdrop paired with amber circular HUD',
    author: 'GrubCraft',
    category: 'minimal-dark',
    layout: 'circle-hud',
    desktopColor: '#14100E',
    menuBg: '#1D1714',
    menuBorder: '#332924',
    itemColor: '#B5A69E',
    selectedColor: '#FEFCE8',
    selectedBg: '#2D231E',
    accentColor: '#D97706',
    labelColor: '#F5EFEA',
    titleText: 'GNU GRUB',
    progressText: '%d',
    proceduralBg: { style: 'radial', baseColor: '#14100E', accentColor: '#B45309', density: 4, grain: 16 },
  },

  // ── MINIMAL LIGHT (9) ────────────────────────────────────────────────────────
  {
    id: 'alpine-daylight',
    name: 'Alpine Daylight',
    subtitle: 'High-key light card over pale silver limestone ridges',
    author: 'Awaiz Azam',
    category: 'minimal-light',
    layout: 'centered-card',
    desktopColor: '#E2E8F0',
    menuBg: '#F8FAFC',
    menuBorder: '#CBD5E1',
    itemColor: '#475569',
    selectedColor: '#0F172A',
    selectedBg: '#FFFFFF',
    accentColor: '#2563EB',
    labelColor: '#0F172A',
    titleText: 'Boot Menu',
    progressText: 'Starting default OS in %ds',
    backgroundUrl: alpineBg,
    timeoutSeconds: 6,
  },
  {
    id: 'paper-porcelain',
    name: 'Paper Porcelain',
    subtitle: 'Left-docked warm paper editorial layout with cobalt selection',
    author: 'GrubCraft',
    category: 'minimal-light',
    layout: 'left-dock',
    desktopColor: '#F4F4F0',
    menuBg: '#FFFFFF',
    menuBorder: '#D6D3CD',
    itemColor: '#57534E',
    selectedColor: '#FFFFFF',
    selectedBg: '#1D4ED8',
    accentColor: '#1E40AF',
    labelColor: '#1C1917',
    titleText: 'System Bootloader',
    progressText: 'Booting in %d seconds',
    proceduralBg: { style: 'waves', baseColor: '#F4F4F0', accentColor: '#93C5FD', secondaryColor: '#D6D3CD', density: 4, grain: 8 },
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    subtitle: 'Floating borderless arctic menu over cool blue horizons',
    author: 'GrubCraft',
    category: 'minimal-light',
    layout: 'floating',
    desktopColor: '#EEF4FA',
    menuBg: '#FFFFFF',
    menuBorder: '#BFDBFE',
    itemColor: '#475569',
    selectedColor: '#FFFFFF',
    selectedBg: '#0284C7',
    accentColor: '#0369A1',
    labelColor: '#0C4A6E',
    titleText: 'GNU GRUB · Frost',
    progressText: 'Launching in %d seconds',
    proceduralBg: { style: 'horizon', baseColor: '#EEF4FA', accentColor: '#38BDF8', density: 5, grain: 8 },
  },
  {
    id: 'alabaster-mist',
    name: 'Alabaster Grid',
    subtitle: 'Right-split architectural light grid with forest-green bar',
    author: 'GrubCraft',
    category: 'minimal-light',
    layout: 'right-split',
    desktopColor: '#F3F5F4',
    menuBg: '#FFFFFF',
    menuBorder: '#D1D9D5',
    itemColor: '#4B5952',
    selectedColor: '#FFFFFF',
    selectedBg: '#15803D',
    accentColor: '#166534',
    labelColor: '#14291E',
    titleText: 'Select OS',
    progressText: '%ds remaining',
    proceduralBg: { style: 'grid', baseColor: '#F3F5F4', accentColor: '#94A3B8', density: 4, grain: 8 },
  },
  {
    id: 'warm-ivory',
    name: 'Warm Ivory',
    subtitle: 'Bottom-shelf studio ivory canvas with burnt sienna accent',
    author: 'GrubCraft',
    category: 'minimal-light',
    layout: 'bottom-shelf',
    desktopColor: '#F5EFE6',
    menuBg: '#FFFDF9',
    menuBorder: '#DFD3C3',
    itemColor: '#6B5E51',
    selectedColor: '#FFFFFF',
    selectedBg: '#C2410C',
    accentColor: '#9A3412',
    labelColor: '#29201B',
    titleText: 'Boot Menu',
    progressText: 'Auto-booting in %d seconds',
    proceduralBg: { style: 'mesh', baseColor: '#F5EFE6', accentColor: '#FDBA74', secondaryColor: '#E7D8C5', density: 4, grain: 10 },
  },
  {
    id: 'silver-birch',
    name: 'Silver Birch',
    subtitle: 'Scandinavian light surface with monochrome circular timer',
    author: 'GrubCraft',
    category: 'minimal-light',
    layout: 'circle-hud',
    desktopColor: '#E5E7EB',
    menuBg: '#F9FAFB',
    menuBorder: '#D1D5DB',
    itemColor: '#4B5563',
    selectedColor: '#FFFFFF',
    selectedBg: '#111827',
    accentColor: '#111827',
    labelColor: '#111827',
    titleText: 'GNU GRUB',
    progressText: '%d',
    proceduralBg: { style: 'stripes', baseColor: '#E5E7EB', accentColor: '#9CA3AF', secondaryColor: '#D1D5DB', density: 5, grain: 10 },
  },
  {
    id: 'cloud-nine',
    name: 'Cloud Nine',
    subtitle: 'Wide airy pastel-sky console with crisp indigo focus bar',
    author: 'GrubCraft',
    category: 'minimal-light',
    layout: 'wide-console',
    desktopColor: '#EEF2FF',
    menuBg: '#FFFFFF',
    menuBorder: '#C7D2FE',
    itemColor: '#4338CA',
    selectedColor: '#FFFFFF',
    selectedBg: '#4F46E5',
    accentColor: '#3730A3',
    labelColor: '#1E1B4B',
    titleText: 'Operating System Selector',
    progressText: 'Booting selected item in %ds',
    proceduralBg: { style: 'aurora', baseColor: '#EEF2FF', accentColor: '#818CF8', secondaryColor: '#38BDF8', density: 4, grain: 6 },
  },
  {
    id: 'chalk-slate',
    name: 'Chalk Slate',
    subtitle: 'Matte off-white topographic canvas with deep slate box',
    author: 'GrubCraft',
    category: 'minimal-light',
    layout: 'terminal-box',
    desktopColor: '#F1F5F9',
    menuBg: '#FFFFFF',
    menuBorder: '#0F172A',
    itemColor: '#475569',
    selectedColor: '#FFFFFF',
    selectedBg: '#0F172A',
    accentColor: '#334155',
    labelColor: '#0F172A',
    titleText: 'GRUB2 Bootloader',
    progressText: 'Starting OS in %ds',
    monoFont: true,
    proceduralBg: { style: 'topo', baseColor: '#F1F5F9', accentColor: '#94A3B8', density: 5, grain: 8 },
  },
  {
    id: 'mint-porcelain',
    name: 'Mint Porcelain',
    subtitle: 'Daylight mint-tinted surface with floating teal selection',
    author: 'GrubCraft',
    category: 'minimal-light',
    layout: 'floating',
    desktopColor: '#ECFDF5',
    menuBg: '#FFFFFF',
    menuBorder: '#A7F3D0',
    itemColor: '#065F46',
    selectedColor: '#FFFFFF',
    selectedBg: '#0D9488',
    accentColor: '#0F766E',
    labelColor: '#064E3B',
    titleText: 'Boot Selection',
    progressText: 'Booting in %d seconds',
    proceduralBg: { style: 'waves', baseColor: '#ECFDF5', accentColor: '#6EE7B7', secondaryColor: '#A7F3D0', density: 4, grain: 8 },
  },

  // ── GLASS & EDITORIAL (9) ────────────────────────────────────────────────────
  {
    id: 'indigo-velvet',
    name: 'Indigo Velvet',
    subtitle: 'Right-split indigo editorial layout with lavender glow',
    author: 'GrubCraft',
    category: 'glass-editorial',
    layout: 'right-split',
    desktopColor: '#0E0D24',
    menuBg: '#161436',
    menuBorder: '#2E2A66',
    itemColor: '#A5B4FC',
    selectedColor: '#FFFFFF',
    selectedBg: '#4338CA',
    accentColor: '#818CF8',
    labelColor: '#E0E7FF',
    titleText: 'GNU GRUB · Indigo',
    progressText: 'Booting in %ds',
    proceduralBg: { style: 'mesh', baseColor: '#0E0D24', accentColor: '#6366F1', secondaryColor: '#A855F7', density: 5, grain: 14 },
  },
  {
    id: 'rose-quartz',
    name: 'Rose Quartz',
    subtitle: 'Floating burgundy-charcoal menu over layered dusk waves',
    author: 'GrubCraft',
    category: 'glass-editorial',
    layout: 'floating',
    desktopColor: '#190F14',
    menuBg: '#24161D',
    menuBorder: '#472938',
    itemColor: '#D6B4C2',
    selectedColor: '#FFF1F2',
    selectedBg: '#9F1239',
    accentColor: '#FB7185',
    labelColor: '#FFE4E6',
    titleText: 'Boot Menu',
    progressText: 'Starting in %d seconds',
    proceduralBg: { style: 'waves', baseColor: '#190F14', accentColor: '#FB7185', secondaryColor: '#4C0519', density: 5, grain: 16 },
  },
  {
    id: 'sage-botanical',
    name: 'Sage Botanical',
    subtitle: 'Left-docked forest-moss slate with clean mint highlights',
    author: 'GrubCraft',
    category: 'glass-editorial',
    layout: 'left-dock',
    desktopColor: '#0F1814',
    menuBg: '#16231D',
    menuBorder: '#273E34',
    itemColor: '#98B8A8',
    selectedColor: '#ECFDF5',
    selectedBg: '#20362C',
    accentColor: '#34D399',
    labelColor: '#D1FAE5',
    titleText: 'System Loader',
    progressText: 'Automatic boot in %d seconds',
    proceduralBg: { style: 'topo', baseColor: '#0F1814', accentColor: '#34D399', density: 6, grain: 15 },
  },
  {
    id: 'steel-blue',
    name: 'Steel Marine',
    subtitle: 'Bottom-anchored marine bar over dark fjord photography',
    author: 'GrubCraft',
    category: 'glass-editorial',
    layout: 'bottom-shelf',
    desktopColor: '#0C1622',
    menuBg: '#122133',
    menuBorder: '#243C5A',
    itemColor: '#CBD5E1',
    selectedColor: '#FFFFFF',
    selectedBg: '#0369A1',
    accentColor: '#38BDF8',
    labelColor: '#E0F2FE',
    titleText: 'GRUB2  ·  Marine',
    progressText: 'Booting in %ds',
    backgroundUrl: nordicBg,
  },
  {
    id: 'velvet-plum',
    name: 'Velvet Plum',
    subtitle: 'Deep plum radial backdrop with orchid circular countdown',
    author: 'GrubCraft',
    category: 'glass-editorial',
    layout: 'circle-hud',
    desktopColor: '#170E1E',
    menuBg: '#21142B',
    menuBorder: '#3E2552',
    itemColor: '#C4B5D6',
    selectedColor: '#FAF5FF',
    selectedBg: '#581C87',
    accentColor: '#C084FC',
    labelColor: '#F3E8FF',
    titleText: 'GNU GRUB',
    progressText: '%d',
    proceduralBg: { style: 'radial', baseColor: '#170E1E', accentColor: '#C084FC', density: 5, grain: 15 },
  },
  {
    id: 'amber-atelier',
    name: 'Amber Atelier',
    subtitle: 'Centered editorial card over anodized concrete horizon',
    author: 'GrubCraft',
    category: 'glass-editorial',
    layout: 'centered-card',
    desktopColor: '#12100C',
    menuBg: '#1C1912',
    menuBorder: '#3B3222',
    itemColor: '#BFB399',
    selectedColor: '#FFFBEB',
    selectedBg: '#92400E',
    accentColor: '#FBBF24',
    labelColor: '#FEF3C7',
    titleText: 'Atelier Boot Manager',
    progressText: 'Booting in %d seconds',
    backgroundUrl: tokyoBg,
  },
  {
    id: 'terracotta-noir',
    name: 'Terracotta Noir',
    subtitle: 'Borderless terracotta-orange selection over diagonal mesh',
    author: 'GrubCraft',
    category: 'glass-editorial',
    layout: 'floating',
    desktopColor: '#140F0E',
    menuBg: '#1F1715',
    menuBorder: '#3B2B27',
    itemColor: '#C2A8A1',
    selectedColor: '#FFFFFF',
    selectedBg: '#9A3412',
    accentColor: '#FB923C',
    labelColor: '#FFEDD5',
    titleText: 'Select OS',
    progressText: 'Booting in %ds',
    proceduralBg: { style: 'stripes', baseColor: '#140F0E', accentColor: '#EA580C', secondaryColor: '#291713', density: 5, grain: 16 },
  },
  {
    id: 'slate-monograph',
    name: 'Slate Monograph',
    subtitle: 'Wide high-contrast console over pale alpine photography',
    author: 'GrubCraft',
    category: 'glass-editorial',
    layout: 'wide-console',
    desktopColor: '#1E293B',
    menuBg: '#0F172A',
    menuBorder: '#334155',
    itemColor: '#94A3B8',
    selectedColor: '#FFFFFF',
    selectedBg: '#1D4ED8',
    accentColor: '#60A5FA',
    labelColor: '#0F172A',
    titleText: 'Monograph Bootloader',
    progressText: 'Launching selected OS in %ds',
    backgroundUrl: alpineBg,
  },
  {
    id: 'oceanic-glass',
    name: 'Oceanic Glass',
    subtitle: 'Right-split teal glass panel with crisp cyan highlights',
    author: 'GrubCraft',
    category: 'glass-editorial',
    layout: 'right-split',
    desktopColor: '#09191E',
    menuBg: '#0E242B',
    menuBorder: '#1A424F',
    itemColor: '#8FBAC7',
    selectedColor: '#ECFEFF',
    selectedBg: '#0E7490',
    accentColor: '#22D3EE',
    labelColor: '#CFFAFE',
    titleText: 'GNU GRUB · Oceanic',
    progressText: 'Booting in %ds',
    proceduralBg: { style: 'horizon', baseColor: '#09191E', accentColor: '#06B6D4', density: 6, grain: 14 },
  },

  // ── AURORA & GRADIENT (10) ───────────────────────────────────────────────────
  {
    id: 'northern-aurora',
    name: 'Northern Aurora',
    subtitle: 'Floating emerald & cyan polar ribbons over midnight sky',
    author: 'GrubCraft',
    category: 'aurora-gradient',
    layout: 'floating',
    desktopColor: '#061118',
    menuBg: '#0A1C26',
    menuBorder: '#163B4D',
    itemColor: '#93C5D1',
    selectedColor: '#042F2E',
    selectedBg: '#2DD4BF',
    accentColor: '#5EEAD4',
    labelColor: '#CCFBF1',
    titleText: 'Aurora Boot Menu',
    progressText: 'Booting in %d seconds',
    proceduralBg: { style: 'aurora', baseColor: '#061118', accentColor: '#2DD4BF', secondaryColor: '#38BDF8', density: 6, grain: 14 },
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    subtitle: 'Left-docked deep space charcoal lit by golden solar arcs',
    author: 'GrubCraft',
    category: 'aurora-gradient',
    layout: 'left-dock',
    desktopColor: '#120C08',
    menuBg: '#1D130D',
    menuBorder: '#40291B',
    itemColor: '#C9B2A3',
    selectedColor: '#FFFFFF',
    selectedBg: '#B45309',
    accentColor: '#F59E0B',
    labelColor: '#FDE68A',
    titleText: 'SOLAR // GRUB2',
    progressText: 'Launching in %ds',
    proceduralBg: { style: 'aurora', baseColor: '#120C08', accentColor: '#F59E0B', secondaryColor: '#EF4444', density: 5, grain: 16 },
  },
  {
    id: 'twilight-violet',
    name: 'Twilight Nebula',
    subtitle: 'Starfield nebula backdrop with violet right-split menu',
    author: 'GrubCraft',
    category: 'aurora-gradient',
    layout: 'right-split',
    desktopColor: '#0E0A1F',
    menuBg: '#171133',
    menuBorder: '#312569',
    itemColor: '#B8B0DB',
    selectedColor: '#FFFFFF',
    selectedBg: '#6D28D9',
    accentColor: '#A78BFA',
    labelColor: '#EDE9FE',
    titleText: 'Boot Selector',
    progressText: 'Booting in %ds',
    proceduralBg: { style: 'starfield', baseColor: '#0E0A1F', accentColor: '#8B5CF6', secondaryColor: '#EC4899', density: 6, grain: 12 },
  },
  {
    id: 'deep-ocean',
    name: 'Deep Trench',
    subtitle: 'Wide console layout over abyssal blue radial glow',
    author: 'GrubCraft',
    category: 'aurora-gradient',
    layout: 'wide-console',
    desktopColor: '#050E1D',
    menuBg: '#091830',
    menuBorder: '#163566',
    itemColor: '#93B4E0',
    selectedColor: '#FFFFFF',
    selectedBg: '#1D4ED8',
    accentColor: '#0EA5E9',
    labelColor: '#E0F2FE',
    titleText: 'GNU GRUB · Deep Trench',
    progressText: 'Starting in %d seconds',
    proceduralBg: { style: 'radial', baseColor: '#050E1D', accentColor: '#0284C7', secondaryColor: '#1D4ED8', density: 6, grain: 12 },
  },
  {
    id: 'crimson-dusk',
    name: 'Crimson Dusk',
    subtitle: 'Bottom-shelf ruby menu over layered dusk wave ridges',
    author: 'GrubCraft',
    category: 'aurora-gradient',
    layout: 'bottom-shelf',
    desktopColor: '#17080D',
    menuBg: '#240D15',
    menuBorder: '#4C1A2B',
    itemColor: '#D1A3B1',
    selectedColor: '#FFFFFF',
    selectedBg: '#BE123C',
    accentColor: '#FB7185',
    labelColor: '#FFE4E6',
    titleText: 'System Boot',
    progressText: 'Booting in %ds',
    proceduralBg: { style: 'waves', baseColor: '#17080D', accentColor: '#E11D48', secondaryColor: '#FB923C', density: 5, grain: 14 },
  },
  {
    id: 'emerald-canopy',
    name: 'Emerald Canopy',
    subtitle: 'Deep forest emerald radial canvas with circular HUD ring',
    author: 'GrubCraft',
    category: 'aurora-gradient',
    layout: 'circle-hud',
    desktopColor: '#06140E',
    menuBg: '#0B2118',
    menuBorder: '#174532',
    itemColor: '#98C7B2',
    selectedColor: '#FFFFFF',
    selectedBg: '#047857',
    accentColor: '#10B981',
    labelColor: '#D1FAE5',
    titleText: 'GNU GRUB',
    progressText: '%d',
    proceduralBg: { style: 'radial', baseColor: '#06140E', accentColor: '#10B981', secondaryColor: '#059669', density: 5, grain: 14 },
  },
  {
    id: 'cobalt-wave',
    name: 'Cobalt Wave',
    subtitle: 'Sweeping royal cobalt mesh planes with left-docked menu',
    author: 'GrubCraft',
    category: 'aurora-gradient',
    layout: 'left-dock',
    desktopColor: '#070E24',
    menuBg: '#0D193D',
    menuBorder: '#1E367A',
    itemColor: '#9EB5EB',
    selectedColor: '#FFFFFF',
    selectedBg: '#2563EB',
    accentColor: '#60A5FA',
    labelColor: '#DBEAFE',
    titleText: 'Cobalt Bootloader',
    progressText: 'Booting in %d seconds',
    proceduralBg: { style: 'mesh', baseColor: '#070E24', accentColor: '#3B82F6', secondaryColor: '#6366F1', density: 7, grain: 12 },
  },
  {
    id: 'cyber-jade',
    name: 'Jade Matrix',
    subtitle: 'Clean jade-teal isometric grid with centered glass panel',
    author: 'GrubCraft',
    category: 'aurora-gradient',
    layout: 'centered-card',
    desktopColor: '#071414',
    menuBg: '#0C2121',
    menuBorder: '#194545',
    itemColor: '#8EC4C4',
    selectedColor: '#FFFFFF',
    selectedBg: '#0F766E',
    accentColor: '#14B8A6',
    labelColor: '#CCFBF1',
    titleText: 'System Select',
    progressText: 'Booting in %ds',
    proceduralBg: { style: 'grid', baseColor: '#071414', accentColor: '#14B8A6', density: 6, grain: 12 },
  },
  {
    id: 'sunset-ridge',
    name: 'Sunset Ridge',
    subtitle: 'Floating menu over warm violet-to-amber mountain waves',
    author: 'GrubCraft',
    category: 'aurora-gradient',
    layout: 'floating',
    desktopColor: '#140C18',
    menuBg: '#1F1324',
    menuBorder: '#3F274A',
    itemColor: '#D8C8E0',
    selectedColor: '#FFFFFF',
    selectedBg: '#EA580C',
    accentColor: '#FDBA74',
    labelColor: '#FFEDD5',
    titleText: 'GNU GRUB · Horizon',
    progressText: 'Auto-booting in %d seconds',
    proceduralBg: { style: 'waves', baseColor: '#140C18', accentColor: '#F97316', secondaryColor: '#7E22CE', density: 6, grain: 14 },
  },
  {
    id: 'arctic-dawn',
    name: 'Arctic Dawn',
    subtitle: 'Diagonal arctic stripes with bright sky-blue selection bar',
    author: 'GrubCraft',
    category: 'aurora-gradient',
    layout: 'centered-card',
    desktopColor: '#0C1520',
    menuBg: '#132130',
    menuBorder: '#27425E',
    itemColor: '#A3BDD6',
    selectedColor: '#FFFFFF',
    selectedBg: '#0284C7',
    accentColor: '#38BDF8',
    labelColor: '#E0F2FE',
    titleText: 'Dawn Boot Menu',
    progressText: '%ds',
    proceduralBg: { style: 'stripes', baseColor: '#0C1520', accentColor: '#38BDF8', secondaryColor: '#1E3A5F', density: 6, grain: 10 },
  },

  // ── TERMINAL & RETRO (10) ────────────────────────────────────────────────────
  {
    id: 'phosphor-crt',
    name: 'Phosphor Console',
    subtitle: 'Classic P1 green-phosphor terminal frame with CRT scanlines',
    author: 'Awaiz Azam',
    category: 'terminal-retro',
    layout: 'terminal-box',
    desktopColor: '#050B07',
    menuBg: '#050B07',
    menuBorder: '#22C55E',
    itemColor: '#4ADE80',
    selectedColor: '#052E16',
    selectedBg: '#4ADE80',
    accentColor: '#86EFAC',
    labelColor: '#4ADE80',
    titleText: 'GNU GRUB  version 2.12  [EFI x86_64]',
    progressText: 'AUTO_BOOT IN %d SEC',
    keymapText: '[UP/DN] SELECT  [RET] BOOT  [E] EDIT  [C] SHELL',
    monoFont: true,
    sharpCorners: true,
    proceduralBg: { style: 'phosphor', baseColor: '#050B07', accentColor: '#22C55E', density: 6, grain: 18 },
    timeoutSeconds: 12,
  },
  {
    id: 'amber-crt',
    name: 'Amber Terminal',
    subtitle: 'Vintage P3 amber phosphor display with sharp terminal border',
    author: 'GrubCraft',
    category: 'terminal-retro',
    layout: 'terminal-box',
    desktopColor: '#0D0904',
    menuBg: '#120C05',
    menuBorder: '#F59E0B',
    itemColor: '#FBBF24',
    selectedColor: '#1C1003',
    selectedBg: '#F59E0B',
    accentColor: '#FDE68A',
    labelColor: '#FCD34D',
    titleText: 'GNU GRUB  //  VT220 AMBER',
    progressText: 'BOOT_TIMER: %ds',
    keymapText: '[UP/DN] MOVE  [ENTER] EXEC  [E] EDIT  [C] CLI',
    monoFont: true,
    sharpCorners: true,
    proceduralBg: { style: 'phosphor', baseColor: '#0D0904', accentColor: '#F59E0B', density: 6, grain: 20 },
  },
  {
    id: 'ibm-mainframe',
    name: 'IBM Blue',
    subtitle: 'Classic BIOS/mainframe cobalt blue with crisp white frame',
    author: 'GrubCraft',
    category: 'terminal-retro',
    layout: 'terminal-box',
    desktopColor: '#000080',
    menuBg: '#0000AA',
    menuBorder: '#FFFFFF',
    itemColor: '#D1D5DB',
    selectedColor: '#000080',
    selectedBg: '#FFFFFF',
    accentColor: '#FFFF55',
    labelColor: '#FFFFFF',
    titleText: 'GNU GRUB  2.12  SYSTEM BOOT',
    progressText: 'Highlighted entry boots in %d s',
    monoFont: true,
    sharpCorners: true,
    proceduralBg: { style: 'grid', baseColor: '#000080', accentColor: '#3B82F6', density: 3, grain: 10 },
  },
  {
    id: 'gruvbox-dark',
    name: 'Gruvbox Material',
    subtitle: 'Left-docked warm retro palette with goldenrod selection',
    author: 'GrubCraft',
    category: 'terminal-retro',
    layout: 'left-dock',
    desktopColor: '#1D2021',
    menuBg: '#282828',
    menuBorder: '#504945',
    itemColor: '#EBDBB2',
    selectedColor: '#1D2021',
    selectedBg: '#FABD2F',
    accentColor: '#FE8019',
    labelColor: '#FBF1C7',
    titleText: 'GNU GRUB · Gruvbox',
    progressText: 'Booting in %d seconds',
    monoFont: true,
    proceduralBg: { style: 'topo', baseColor: '#1D2021', accentColor: '#665C54', density: 5, grain: 16 },
  },
  {
    id: 'nord-polar',
    name: 'Nord Polar Night',
    subtitle: 'Arctic bluish-gray Nord palette with frost cyan selection',
    author: 'GrubCraft',
    category: 'terminal-retro',
    layout: 'floating',
    desktopColor: '#2E3440',
    menuBg: '#3B4252',
    menuBorder: '#4C566A',
    itemColor: '#D8DEE9',
    selectedColor: '#2E3440',
    selectedBg: '#88C0D0',
    accentColor: '#81A1C1',
    labelColor: '#ECEFF4',
    titleText: 'GNU GRUB · Nord',
    progressText: 'Booting in %ds',
    monoFont: true,
    proceduralBg: { style: 'waves', baseColor: '#2E3440', accentColor: '#5E81AC', secondaryColor: '#3B4252', density: 4, grain: 12 },
  },
  {
    id: 'catppuccin-mocha',
    name: 'Catppuccin Mocha',
    subtitle: 'Right-split pastel lavender & mauve over warm mocha slate',
    author: 'GrubCraft',
    category: 'terminal-retro',
    layout: 'right-split',
    desktopColor: '#1E1E2E',
    menuBg: '#181825',
    menuBorder: '#313244',
    itemColor: '#BAC2DE',
    selectedColor: '#1E1E2E',
    selectedBg: '#CBA6F7',
    accentColor: '#B4BEFE',
    labelColor: '#CDD6F4',
    titleText: 'GNU GRUB · Mocha',
    progressText: 'Booting in %ds',
    proceduralBg: { style: 'aurora', baseColor: '#1E1E2E', accentColor: '#CBA6F7', secondaryColor: '#89B4FA', density: 5, grain: 12 },
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    subtitle: 'Stormy indigo grid with crisp cyan & blue highlights',
    author: 'GrubCraft',
    category: 'terminal-retro',
    layout: 'left-dock',
    desktopColor: '#1A1B26',
    menuBg: '#16161E',
    menuBorder: '#292E42',
    itemColor: '#A9B1D6',
    selectedColor: '#FFFFFF',
    selectedBg: '#3D59A1',
    accentColor: '#7AA2F7',
    labelColor: '#C0CAF5',
    titleText: 'Tokyo Night // Bootloader',
    progressText: 'Booting in %d seconds',
    monoFont: true,
    proceduralBg: { style: 'grid', baseColor: '#1A1B26', accentColor: '#7AA2F7', density: 5, grain: 14 },
  },
  {
    id: 'dracula-night',
    name: 'Dracula Slate',
    subtitle: 'Dark purple-gray circular HUD with pink & orchid accents',
    author: 'GrubCraft',
    category: 'terminal-retro',
    layout: 'circle-hud',
    desktopColor: '#282A36',
    menuBg: '#21222C',
    menuBorder: '#44475A',
    itemColor: '#F8F8F2',
    selectedColor: '#282A36',
    selectedBg: '#BD93F9',
    accentColor: '#FF79C6',
    labelColor: '#F8F8F2',
    titleText: 'GNU GRUB · Dracula',
    progressText: '%d',
    monoFont: true,
    proceduralBg: { style: 'radial', baseColor: '#282A36', accentColor: '#BD93F9', density: 4, grain: 14 },
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Teal',
    subtitle: 'Sharp framed Solarized dark teal workstation console',
    author: 'GrubCraft',
    category: 'terminal-retro',
    layout: 'terminal-box',
    desktopColor: '#002B36',
    menuBg: '#073642',
    menuBorder: '#2AA198',
    itemColor: '#93A1A1',
    selectedColor: '#FDF6E3',
    selectedBg: '#268BD2',
    accentColor: '#2AA198',
    labelColor: '#EEE8D5',
    titleText: 'GNU GRUB · Solarized',
    progressText: 'Booting in %ds',
    monoFont: true,
    sharpCorners: true,
    proceduralBg: { style: 'grid', baseColor: '#002B36', accentColor: '#2AA198', density: 4, grain: 10 },
  },
  {
    id: 'one-dark-pro',
    name: 'One Dark Pro',
    subtitle: 'Bottom-shelf editor charcoal with sky & amber accents',
    author: 'GrubCraft',
    category: 'terminal-retro',
    layout: 'bottom-shelf',
    desktopColor: '#21252B',
    menuBg: '#282C34',
    menuBorder: '#3E4451',
    itemColor: '#ABB2BF',
    selectedColor: '#FFFFFF',
    selectedBg: '#3B82F6',
    accentColor: '#61AFEF',
    labelColor: '#E5C07B',
    titleText: 'GNU GRUB · One Dark',
    progressText: 'Booting in %d seconds',
    monoFont: true,
    proceduralBg: { style: 'stripes', baseColor: '#21252B', accentColor: '#61AFEF', secondaryColor: '#282C34', density: 5, grain: 14 },
  },

  // ── DISTRO INSPIRED (10) ─────────────────────────────────────────────────────
  {
    id: 'ubuntu-noble',
    name: 'Ubuntu Noble',
    subtitle: 'Canonical aubergine radial glow with bold orange highlight',
    author: 'GrubCraft',
    category: 'distro-inspired',
    layout: 'centered-card',
    desktopColor: '#2C001E',
    menuBg: '#3B0A29',
    menuBorder: '#5E1A44',
    itemColor: '#E8D5E0',
    selectedColor: '#FFFFFF',
    selectedBg: '#E95420',
    accentColor: '#FB923C',
    labelColor: '#FFFFFF',
    titleText: 'Ubuntu Boot Manager',
    progressText: 'Booting Ubuntu in %d seconds',
    proceduralBg: { style: 'radial', baseColor: '#2C001E', accentColor: '#E95420', secondaryColor: '#77216F', density: 5, grain: 14 },
  },
  {
    id: 'arch-crystal',
    name: 'Arch Crystal',
    subtitle: 'Left-docked Arch #1793D1 blueprint over obsidian topo',
    author: 'GrubCraft',
    category: 'distro-inspired',
    layout: 'left-dock',
    desktopColor: '#0B1016',
    menuBg: '#101821',
    menuBorder: '#1D2D3E',
    itemColor: '#98AFC7',
    selectedColor: '#FFFFFF',
    selectedBg: '#0369A1',
    accentColor: '#1793D1',
    labelColor: '#38BDF8',
    titleText: 'ARCH LINUX // GRUB2',
    progressText: 'Booting kernel in %ds',
    proceduralBg: { style: 'topo', baseColor: '#0B1016', accentColor: '#1793D1', density: 6, grain: 14 },
  },
  {
    id: 'fedora-blue',
    name: 'Fedora Workstation',
    subtitle: 'Clean Fedora navy & sky blue floating workstation menu',
    author: 'GrubCraft',
    category: 'distro-inspired',
    layout: 'floating',
    desktopColor: '#0E1729',
    menuBg: '#15223B',
    menuBorder: '#283F6B',
    itemColor: '#B3C6E6',
    selectedColor: '#FFFFFF',
    selectedBg: '#294172',
    accentColor: '#51A2DA',
    labelColor: '#E0F2FE',
    titleText: 'Fedora Workstation Boot',
    progressText: 'Starting Fedora in %ds',
    proceduralBg: { style: 'waves', baseColor: '#0E1729', accentColor: '#51A2DA', secondaryColor: '#1E3A8A', density: 5, grain: 12 },
  },
  {
    id: 'debian-spiral',
    name: 'Debian Crimson',
    subtitle: 'Right-split dark charcoal with Debian ruby crimson accents',
    author: 'GrubCraft',
    category: 'distro-inspired',
    layout: 'right-split',
    desktopColor: '#130D10',
    menuBg: '#1D1418',
    menuBorder: '#3B252E',
    itemColor: '#C9B3BC',
    selectedColor: '#FFFFFF',
    selectedBg: '#A80030',
    accentColor: '#D70A53',
    labelColor: '#FFE4EC',
    titleText: 'Debian GNU/Linux',
    progressText: 'Booting Debian in %d seconds',
    proceduralBg: { style: 'topo', baseColor: '#130D10', accentColor: '#D70A53', density: 5, grain: 16 },
  },
  {
    id: 'endeavour-cosmic',
    name: 'Endeavour Space',
    subtitle: 'Deep space starfield & violet nebula inspired by EndeavourOS',
    author: 'GrubCraft',
    category: 'distro-inspired',
    layout: 'centered-card',
    desktopColor: '#100B1C',
    menuBg: '#18112B',
    menuBorder: '#332559',
    itemColor: '#C4B5E3',
    selectedColor: '#FFFFFF',
    selectedBg: '#5B21B6',
    accentColor: '#7F7FFF',
    labelColor: '#EDE9FE',
    titleText: 'EndeavourOS Boot Menu',
    progressText: 'Launching in %ds',
    proceduralBg: { style: 'starfield', baseColor: '#100B1C', accentColor: '#7F7FFF', secondaryColor: '#FF6699', density: 7, grain: 14 },
  },
  {
    id: 'nixos-lambda',
    name: 'NixOS Reproducible',
    subtitle: 'Wide declarative Nix blue console over crisp blueprint grid',
    author: 'GrubCraft',
    category: 'distro-inspired',
    layout: 'wide-console',
    desktopColor: '#0B1220',
    menuBg: '#111C33',
    menuBorder: '#233863',
    itemColor: '#A6C1EE',
    selectedColor: '#FFFFFF',
    selectedBg: '#1E40AF',
    accentColor: '#7EBAE4',
    labelColor: '#E0F2FE',
    titleText: 'NixOS Generations',
    progressText: 'Activating generation in %ds',
    proceduralBg: { style: 'grid', baseColor: '#0B1220', accentColor: '#5277C3', density: 5, grain: 12 },
  },
  {
    id: 'manjaro-emerald',
    name: 'Manjaro Emerald',
    subtitle: 'Bottom-shelf slate menu with signature Manjaro #35BF5C green',
    author: 'GrubCraft',
    category: 'distro-inspired',
    layout: 'bottom-shelf',
    desktopColor: '#0B1410',
    menuBg: '#111F19',
    menuBorder: '#203B2F',
    itemColor: '#9AC2AE',
    selectedColor: '#FFFFFF',
    selectedBg: '#15803D',
    accentColor: '#35BF5C',
    labelColor: '#DCFCE7',
    titleText: 'Manjaro Linux',
    progressText: 'Booting in %d seconds',
    proceduralBg: { style: 'mesh', baseColor: '#0B1410', accentColor: '#35BF5C', secondaryColor: '#064E3B', density: 5, grain: 14 },
  },
  {
    id: 'pop-teal',
    name: 'Pop!_OS Teal',
    subtitle: 'System76 cosmic slate with Pop teal & warm amber radial',
    author: 'GrubCraft',
    category: 'distro-inspired',
    layout: 'centered-card',
    desktopColor: '#10181C',
    menuBg: '#162228',
    menuBorder: '#283E4A',
    itemColor: '#A3C0CC',
    selectedColor: '#FFFFFF',
    selectedBg: '#0E7490',
    accentColor: '#48B9C7',
    labelColor: '#E0F7FA',
    titleText: 'Pop!_OS Boot Menu',
    progressText: 'Booting in %ds',
    proceduralBg: { style: 'radial', baseColor: '#10181C', accentColor: '#48B9C7', secondaryColor: '#FAA41A', density: 5, grain: 14 },
  },
  {
    id: 'cachyos-velocity',
    name: 'CachyOS Velocity',
    subtitle: 'Asymmetric circular HUD with high-speed teal aurora ribbons',
    author: 'GrubCraft',
    category: 'distro-inspired',
    layout: 'circle-hud',
    desktopColor: '#071312',
    menuBg: '#0D211F',
    menuBorder: '#1A403C',
    itemColor: '#92C7C0',
    selectedColor: '#FFFFFF',
    selectedBg: '#0F766E',
    accentColor: '#00AA88',
    labelColor: '#CCFBF1',
    titleText: 'CachyOS',
    progressText: '%d',
    proceduralBg: { style: 'aurora', baseColor: '#071312', accentColor: '#00AA88', secondaryColor: '#2DD4BF', density: 6, grain: 12 },
  },
  {
    id: 'alpine-hex',
    name: 'Alpine Hexagon',
    subtitle: 'Left-docked lightweight Alpine blue-slate minimal build',
    author: 'GrubCraft',
    category: 'distro-inspired',
    layout: 'left-dock',
    desktopColor: '#0A151C',
    menuBg: '#10212C',
    menuBorder: '#1F4156',
    itemColor: '#98BDD1',
    selectedColor: '#FFFFFF',
    selectedBg: '#0D597F',
    accentColor: '#38BDF8',
    labelColor: '#E0F2FE',
    titleText: 'Alpine Linux',
    progressText: '%ds',
    proceduralBg: { style: 'stripes', baseColor: '#0A151C', accentColor: '#0D597F', secondaryColor: '#1E3A5F', density: 5, grain: 12 },
  },
];

export const GRUB_PRESETS: GrubPreset[] = PRESET_SPECS.map(makePreset);
