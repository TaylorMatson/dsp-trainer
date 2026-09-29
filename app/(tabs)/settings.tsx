import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useProgress } from '@/progress/ProgressContext';

/** Stub until Taylor hosts a real policy URL (P4 store packaging). */
const PRIVACY_POLICY_STUB_URL = 'https://example.com/dsp-trainer-privacy';

export default function SettingsScreen() {
  const { resetAll, map, ready } = useProgress();
  const savedCount = Object.keys(map).length;

  return (
    <View style={styles.container}>
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
        accessibilityRole="button"
        style={styles.linkButton}
        onPress={() => {
          void WebBrowser.openBrowserAsync(PRIVACY_POLICY_STUB_URL);
        }}>
        <Text style={styles.linkText}>Privacy policy (stub)</Text>
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
    paddingTop: 48,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.6,
  },
  linkButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B6CA8',
  },
  reset: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(180, 60, 60, 0.12)',
    alignSelf: 'flex-start',
  },
  resetText: {
    fontWeight: '600',
    color: '#8B2E2E',
  },
});
