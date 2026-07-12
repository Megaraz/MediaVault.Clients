/**
 * Design tokens matching the MediaVault web app.
 * Primary: #0d7ff2 (blue), Background: #101922 (dark navy), Cards: #182634
 */

import { Platform, StyleSheet } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';

export const Colors = {
  // Core palette
  background: '#101922',
  surface: '#182634',
  surfaceElevated: '#1e2d3d',
  border: '#1e293b',

  primary: '#0d7ff2',
  primaryDim: 'rgba(13, 127, 242, 0.15)',
  primaryHover: 'rgba(13, 127, 242, 0.9)',

  // Text
  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',

  // Status/feedback
  error: '#ef4444',
  errorDim: 'rgba(239, 68, 68, 0.15)',
  warning: '#f59e0b',
  success: '#22c55e',

  // Tab bar (kept for Expo Tabs API)
  tabIconDefault: '#64748b',
  tabIconSelected: '#0d7ff2',
  tabBarBackground: '#101922',
  tabBarBorder: '#1e293b',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/** Shared reusable VIEW styles. */
export const SV: {
  screen: ViewStyle;
  card: ViewStyle;
  primaryBtn: ViewStyle;
  dangerBtn: ViewStyle;
  separator: ViewStyle;
} = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dangerBtn: {
    backgroundColor: Colors.error,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
});

/** Shared reusable TEXT styles. */
export const ST: {
  title: TextStyle;
  subtitle: TextStyle;
  sectionTitle: TextStyle;
  label: TextStyle;
  input: TextStyle;
  primaryBtnText: TextStyle;
  dangerBtnText: TextStyle;
  linkText: TextStyle;
} = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 17,
    color: Colors.text,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  dangerBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

/** Placeholder color for TextInput. */
export const inputPlaceholderColor = Colors.textMuted;

/** Backwards-compat alias grouping all shared styles. */
export const S = { ...SV, ...ST, inputPlaceholder: inputPlaceholderColor };
