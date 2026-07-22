import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { COLORS, RADIUS } from './src/utils/constants';
import AppNavigator from './src/navigation/AppNavigator';

const theme = {
  ...MD3LightTheme,
  roundness: RADIUS.md / 4, // Paper multiplies roundness by 4
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    onPrimary: COLORS.white,
    primaryContainer: COLORS.mint,
    onPrimaryContainer: COLORS.primaryDark,
    secondary: COLORS.accent,
    onSecondary: COLORS.white,
    secondaryContainer: COLORS.mint,
    onSecondaryContainer: COLORS.primaryDark,
    background: COLORS.background,
    surface: COLORS.surface,
    surfaceVariant: COLORS.mint,
    onSurface: COLORS.textPrimary,
    onSurfaceVariant: COLORS.textSecondary,
    outline: COLORS.border,
    outlineVariant: COLORS.border,
    error: COLORS.danger,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: COLORS.surface,
      level2: COLORS.surface,
      level3: COLORS.surface,
    },
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="dark" />
      <AppNavigator />
    </PaperProvider>
  );
}
