import type { ReactNode } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenSafeAreaProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Отступ сверху под статус-бар (Wi‑Fi, время) на Android edge-to-edge. */
export function ScreenSafeArea({ children, style }: ScreenSafeAreaProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top, Platform.OS === 'android' ? 32 : 12);

  return <View style={[{ flex: 1, paddingTop }, style]}>{children}</View>;
}
