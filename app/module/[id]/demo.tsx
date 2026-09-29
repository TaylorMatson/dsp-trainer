import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AliasingVisualizer } from '@/components/AliasingVisualizer';
import { Text, View } from '@/components/Themed';
import { getModuleById } from '@/content/modules';
import { useProgress } from '@/progress/ProgressContext';

export default function ModuleDemoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const module = getModuleById(id ?? '');
  const demo = module?.demos[0];
  const { markDemoDone } = useProgress();
  const interacted = useRef(false);

  if (!module || !demo) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Demo unavailable</Text>
      </View>
    );
  }

  const onInteracted = () => {
    if (!interacted.current) {
      interacted.current = true;
      void markDemoDone(module.id);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: demo.title }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{demo.title}</Text>
        {demo.componentId === 'aliasing-visualizer' ? (
          <AliasingVisualizer demo={demo} onInteracted={onInteracted} />
        ) : (
          (() => {
            const _exhaustive: never = demo.componentId;
            return _exhaustive;
          })()
        )}
        <Pressable
          style={styles.primary}
          onPress={() => {
            void markDemoDone(module.id);
          }}>
          <Text style={styles.primaryText}>Mark demo complete</Text>
        </Pressable>
        <Link href={`/module/${module.id}/practice`} style={styles.link}>
          Continue to practice →
        </Link>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 16,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  primary: {
    marginTop: 8,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1B6CA8',
  },
});
