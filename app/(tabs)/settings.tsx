import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { AvTheme } from '@/constants/AvTheme';
import { useProgress } from '@/progress/ProgressContext';

export default function SettingsScreen() {
  const { resetAll, map, ready } = useProgress();
  const savedCount = Object.keys(map).length;

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>LOCAL</Text>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.body}>
        Progress stays on-device in v1. No accounts, mic, or analytics by default.
      </Text>

      <Text style={styles.section}>About</Text>
      <Text style={styles.body}>
        DSP Trainer — offline lesson → demo → practice for core digital signal
        processing intuition. Synth-only demos. Free v1.
      </Text>
      <Text style={styles.meta}>
        Stack: Expo + TypeScript + EAS
        {ready ? ` · ${savedCount} module record${savedCount === 1 ? '' : 's'}` : ''}
      </Text>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Open privacy policy"
        style={styles.linkButton}
        onPress={() => {
          router.push('/privacy');
        }}>
        <Text style={styles.linkText}>Privacy policy</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        style={styles.reset}
        onPress={() => {
          void resetAll();
        }}>
        <Text style={styles.resetText}>Reset local progress</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 12,
    backgroundColor: AvTheme.bg,
  },
  kicker: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    letterSpacing: 1.2,
    color: AvTheme.teal,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AvTheme.ink,
  },
  section: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '700',
    color: AvTheme.ink,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: AvTheme.muted,
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    color: AvTheme.muted,
  },
  linkButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: AvTheme.accent,
  },
  reset: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: AvTheme.danger,
    backgroundColor: AvTheme.dangerFill,
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  resetText: {
    fontWeight: '600',
    color: AvTheme.danger,
  },
});
