/**
 * Simplified theme color hook for the single dark-mode MediaVault theme.
 * Falls back to named Colors tokens; light/dark overrides still supported.
 */

import { Colors } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors,
) {
  // App uses a single dark theme; prefer explicit overrides when provided
  const colorFromProps = props.dark ?? props.light;

  if (colorFromProps) {
    return colorFromProps;
  }

  const value = Colors[colorName];
  return typeof value === 'string' ? value : Colors.text;
}
