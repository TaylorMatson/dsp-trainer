import { Link } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AvTheme } from '@/constants/AvTheme';
import { MODULES } from '@/content/modules';
import { useProgress } from '@/progress/ProgressContext';
import { isModuleComplete } from '@/progress/types';

export default function HomeScreen() {
  const { getProgress } = useProgress();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>DSP TRAINER</Text>
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
        Open coding lab
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: AvTheme.bg,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    gap: 12,
    backgroundColor: AvTheme.bg,
  },
  kicker: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    letterSpacing: 1.4,
    color: AvTheme.teal,
  },
  brand: {
    fontSize: 32,
    fontWeight: '700',
    color: AvTheme.ink,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
    color: AvTheme.muted,
  },
  moduleBlock: {
    marginTop: 8,
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: AvTheme.bgRaise,
    borderColor: AvTheme.line,
    borderWidth: 1,
  },
  moduleTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: AvTheme.ink,
  },
  moduleMeta: {
    fontSize: 13,
    color: AvTheme.muted,
  },
  link: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    color: AvTheme.accent,
  },
  secondaryLink: {
    marginTop: 24,
    fontSize: 15,
    fontWeight: '500',
    color: AvTheme.teal,
  },
});
