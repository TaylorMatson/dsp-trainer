import { Link, Stack, useLocalSearchParams, type Href } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AvTheme } from '@/constants/AvTheme';
import { getModuleById } from '@/content/modules';
import type { LessonBlock } from '@/content/schema';
import { useProgress } from '@/progress/ProgressContext';

export default function ModuleLessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const module = getModuleById(id ?? '');
  const { markLessonDone } = useProgress();
  const lesson = module?.lessons[0];

  if (!module || !lesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Lesson unavailable</Text>
      </View>
    );
  }

  const continueToDemo = () => {
    void markLessonDone(module.id);
  };

  return (
    <>
      <Stack.Screen options={{ title: lesson.title }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.kicker}>LESSON</Text>
        <Text style={styles.title}>{lesson.title}</Text>
        {lesson.blocks.map((block, index) => (
          <LessonBlockView key={`${lesson.id}-${index}`} block={block} />
        ))}
        <Link
          href={`/module/${module.id}/demo` as Href}
          style={styles.link}
          onPress={continueToDemo}>
          Continue to demo →
        </Link>
      </ScrollView>
    </>
  );
}

function LessonBlockView({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <Text style={styles.body}>{block.text}</Text>;
    case 'callout':
      return (
        <View style={styles.callout}>
          <Text style={styles.calloutText}>{block.text}</Text>
        </View>
      );
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: AvTheme.bg,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 14,
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
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: AvTheme.ink,
  },
  callout: {
    padding: 14,
    backgroundColor: AvTheme.bgRaise,
    borderColor: AvTheme.teal,
    borderWidth: 1,
  },
  calloutText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: AvTheme.teal,
  },
  link: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: AvTheme.accent,
  },
});
