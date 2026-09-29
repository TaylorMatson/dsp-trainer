import { Link, Stack, useLocalSearchParams, type Href } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { getModuleById } from '@/content/modules';
import { useModuleProgress } from '@/progress/ProgressContext';
import { isModuleComplete } from '@/progress/types';

export default function ModuleHomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const module = getModuleById(id ?? '');
  const progress = useModuleProgress(id ?? '');

  if (!module) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Module not found</Text>
      </View>
    );
  }

  const complete = isModuleComplete(progress);

  return (
    <>
      <Stack.Screen options={{ title: module.title }} />
      <View style={styles.container}>
        <Text style={styles.title}>{module.title}</Text>
        <Text style={styles.summary}>{module.summary}</Text>
        <Text style={styles.meta}>
          ~{module.estimatedMinutes} min ·{' '}
          {complete ? 'Complete' : 'In progress'}
        </Text>

        <View style={styles.steps}>
          <StepLink
            href={`/module/${module.id}/lesson`}
            label="1. Lesson"
            done={progress.lessonDone}
          />
          <StepLink
            href={`/module/${module.id}/demo`}
            label="2. Demo"
            done={progress.demoDone}
          />
          <StepLink
            href={`/module/${module.id}/practice`}
            label="3. Practice"
            done={progress.practicePassed}
            detail={
              progress.practiceScore !== null
                ? `Score ${progress.practiceScore}`
                : undefined
            }
          />
        </View>
      </View>
    </>
  );
}

function StepLink({
  href,
  label,
  done,
  detail,
}: {
  href: Href;
  label: string;
  done: boolean;
  detail?: string;
}) {
  return (
    <Link href={href} style={styles.step}>
      <Text style={styles.stepLabel}>
        {label}
        {done ? ' ✓' : ''}
      </Text>
      {detail ? <Text style={styles.stepDetail}>{detail}</Text> : null}
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  meta: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 8,
  },
  steps: {
    gap: 10,
    marginTop: 8,
  },
  step: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(27, 108, 168, 0.12)',
  },
  stepLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  stepDetail: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.7,
  },
});
