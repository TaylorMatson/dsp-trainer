import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.body}>
        Progress stays on-device in v1. No accounts, mic, or analytics by default.
      </Text>
      <Text style={styles.meta}>Stack: Expo + TypeScript + EAS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  meta: {
    marginTop: 16,
    fontSize: 13,
    opacity: 0.6,
  },
});
