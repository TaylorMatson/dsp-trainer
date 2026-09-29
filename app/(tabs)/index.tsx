import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { MODULES } from '@/content/modules';

export default function HomeScreen() {
  const first = MODULES[0];

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>DSP Trainer</Text>
      <Text style={styles.subtitle}>
        Lesson → demo → practice. Hear and see signals change.
      </Text>
      {first ? (
        <Text style={styles.module}>
          Module 1 stub: {first.title} ({first.status})
        </Text>
      ) : null}
      <Link href="/(tabs)/demo" style={styles.link}>
        Open sine smoke demo
      </Link>
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
  brand: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 22,
  },
  module: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.7,
  },
  link: {
    marginTop: 24,
    fontSize: 17,
    fontWeight: '600',
    color: '#1B6CA8',
  },
});
