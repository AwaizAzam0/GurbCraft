import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evalGrubDimension,
  normalizeGrubColor,
  parseGrubFontSize,
  parseThemeTxt,
  serializeThemeTxt,
} from './themeParser';
import { buildZipArchive, crc32 } from './zipBuilder';

test('evalGrubDimension handles percentage, pixel, and combined expressions', () => {
  assert.equal(evalGrubDimension('50%', 1920), 960);
  assert.equal(evalGrubDimension('50%-260', 1920), 700);
  assert.equal(evalGrubDimension('15%+24', 1080), 186);
  assert.equal(evalGrubDimension('320', 1080), 320);
  assert.equal(evalGrubDimension(undefined, 1080, 42), 42);
});

test('normalizeGrubColor resolves hex and GRUB named colors', () => {
  assert.equal(normalizeGrubColor('#abc'), '#AABBCC');
  assert.equal(normalizeGrubColor('#1e293b'), '#1E293B');
  assert.equal(normalizeGrubColor('light-gray'), '#AAAAAA');
  assert.equal(normalizeGrubColor('white'), '#FFFFFF');
  assert.equal(normalizeGrubColor(undefined, '#123456'), '#123456');
});

test('parseGrubFontSize extracts trailing pixel size', () => {
  assert.equal(parseGrubFontSize('JetBrains Mono Regular 18'), 18);
  assert.equal(parseGrubFontSize('Unifont Regular 24'), 24);
  assert.equal(parseGrubFontSize('Invalid', 16), 16);
});

test('parseThemeTxt parses globals, components, comments, and round-trips cleanly', () => {
  const sample = `
# Sample GRUB theme
title-text: ""
desktop-image: "background.png"
desktop-color: "#0F172A"
terminal-font: "JetBrains Mono Regular 16"

+ boot_menu {
  left = "50%-260"
  top = "30%"
  width = "520"
  height = "42%"
  item_color = "#CBD5E1"
  selected_item_color = "#FFFFFF"
  item_height = 40
  item_spacing = 8
}

+ label {
  top = "82%"
  left = "0"
  width = "100%"
  align = "center"
  text = "@KEYMAP_SHORT@"
  color = "#94A3B8"
}
`;

  const parsed = parseThemeTxt(sample);
  assert.equal(parsed.diagnostics.length, 0);
  assert.equal(parsed.config.globals['desktop-image'], 'background.png');
  assert.equal(parsed.config.globals['desktop-color'], '#0F172A');
  assert.equal(parsed.config.components.length, 2);
  assert.equal(parsed.config.components[0].type, 'boot_menu');
  assert.equal(parsed.config.components[0].properties.left, '50%-260');
  assert.equal(parsed.config.components[0].properties.item_height, '40');
  assert.equal(parsed.config.components[1].type, 'label');
  assert.equal(parsed.config.components[1].properties.text, '@KEYMAP_SHORT@');

  const serialized = serializeThemeTxt(parsed.config);
  const reparsed = parseThemeTxt(serialized);
  assert.equal(reparsed.diagnostics.length, 0);
  assert.deepEqual(reparsed.config.globals, parsed.config.globals);
  assert.equal(reparsed.config.components.length, 2);
  assert.equal(reparsed.config.components[0].properties.selected_item_color, '#FFFFFF');
});

test('parseThemeTxt reports diagnostic for unclosed block', () => {
  const broken = `
desktop-color: "#000000"
+ boot_menu {
  left = "10%"
`;
  const parsed = parseThemeTxt(broken);
  assert.equal(parsed.diagnostics.some((d) => d.severity === 'error'), true);
});

test('parseThemeTxt parses compact single-line + component { ... } blocks', () => {
  const compact = [
    'title-text: ""',
    'desktop-color: "#07101E"',
    '+ label { top = 14% left = 0 width = 100% align = "center" color = "#E0F2FE" font = "DejaVu Sans Bold 26" text = "AURORA BOOT" }',
    '+ boot_menu { left = 50%-270 top = 28% width = 540 height = 44% item_color = "#94A3B8" selected_item_color = "#FFFFFF" selected_item_bg_color = "#0891B2" }',
  ].join('\n');

  const parsed = parseThemeTxt(compact);
  assert.equal(parsed.diagnostics.length, 0);
  assert.equal(parsed.config.components.length, 2);
  assert.equal(parsed.config.components[0].type, 'label');
  assert.equal(parsed.config.components[0].properties.text, 'AURORA BOOT');
  assert.equal(parsed.config.components[1].type, 'boot_menu');
  assert.equal(parsed.config.components[1].properties.left, '50%-270');
  assert.equal(parsed.config.components[1].properties.selected_item_bg_color, '#0891B2');
});

test('buildZipArchive generates valid ZIP headers and CRC32', () => {
  const payload = new TextEncoder().encode('123456789');
  // Standard IEEE 802.3 CRC32 of "123456789" is 0xCBF43926
  assert.equal(crc32(payload), 0xcbf43926);

  const zipBytes = buildZipArchive([
    { name: 'mytheme/theme.txt', data: 'desktop-color: "#000000"\n' },
    { name: 'mytheme/README.txt', data: 'Install to /boot/grub/themes/' },
  ]);

  const view = new DataView(zipBytes.buffer);
  // Local file header signature PK\x03\x04
  assert.equal(view.getUint32(0, true), 0x04034b50);
  // EOCD signature at end (last 22 bytes) PK\x05\x06
  assert.equal(view.getUint32(zipBytes.length - 22, true), 0x06054b50);
  // Entry count = 2
  assert.equal(view.getUint16(zipBytes.length - 12, true), 2);
});
