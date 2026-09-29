import { Link } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { MODULES } from '@/content/modules';
import { useProgress } from '@/progress/ProgressContext';
import { isModuleComplete } from '@/progress/types';

export default function HomeScreen() {
  const { getProgress } = useProgress();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.brand}>DSP Trainer</Text>
      <Text style={styles.subtitle}>
        Lesson → demo → practice. Hear and see signals change.
      </Text>

      {MODULES.map((module) => {
        const progress = getProgress(module.id);
        const complete = isModuleComplete(progress);
        const ready = module.status === 'ready';
        return (
          <View key={module.id} style={styles.moduleBlock}>
            <Text style={styles.moduleTitle}>
              Module {module.order}: {module.title}
            </Text>
            <Text style={styles.moduleMeta}>
              {ready
                ? complete
                  ? 'Complete'
                  : '~' + module.estimatedMinutes + ' min · Ready'
                : 'Coming soon'}
            </Text>
            {ready ? (
              <Link href={`/module/${module.id}`} style={styles.link}>
                {complete ? 'Review module' : 'Start module'}
              </Link>
            ) : null}
          </View>
        );
      })}

      <Link href="/(tabs)/demo" style={styles.secondaryLink}>
        Open sine smoke demo
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
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
    marginBottom: 8,
  },
  moduleBlock: {
    marginTop: 8,
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(27, 108, 168, 0.1)',
  },
  moduleTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  moduleMeta: {
    fontSize: 13,
    opacity: 0.65,
  },
  link: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#1B6CA8',
  },
  secondaryLink: {
    marginTop: 24,
    fontSize: 15,
    fontWeight: '500',
    color: '#1B6CA8',
    opacity: 0.85,
  },
});
