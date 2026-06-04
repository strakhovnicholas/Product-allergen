import { StyleSheet, Text, View } from 'react-native';

import { useOffline } from '../context/OfflineContext';
import { COLORS } from '../styles/palette';

export function OfflineBanner() {
  const { isOnline } = useOffline();
  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Нет сети — данные сохраняются локально в SQLite</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
