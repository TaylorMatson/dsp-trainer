import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
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

  return (
    <>
      <Stack.Screen options={{ title: lesson.title }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{lesson.title}</Text>
        {lesson.blocks.map((block, index) => (
          <LessonBlockView key={`${lesson.id}-${index}`} block={block} />
        ))}
        <Pressable
          style={styles.primary}
          onPress={() => {
            void markLessonDone(module.id);
          }}>
          <Text style={styles.primaryText}>Mark lesson complete</Text>
        </Pressable>
        <Link href={`/module/${module.id}/demo`} style={styles.link}>
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
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  callout: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(27, 108, 168, 0.12)',
  },
  calloutText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  primary: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#1B6CA8',
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1B6CA8',
  },
});
