import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AliasingVisualizer } from '@/components/AliasingVisualizer';
import { ConvolutionVisualizer } from '@/components/ConvolutionVisualizer';
import { FilterVisualizer } from '@/components/FilterVisualizer';
import { SineGeneratorVisualizer } from '@/components/SineGeneratorVisualizer';
import { SpectrumVisualizer } from '@/components/SpectrumVisualizer';
import { Text, View } from '@/components/Themed';
import { WindowingVisualizer } from '@/components/WindowingVisualizer';
import { getModuleById } from '@/content/modules';
import type { DemoComponentId } from '@/content/schema';
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
        <DemoBody componentId={demo.componentId} demo={demo} onInteracted={onInteracted} />
        <Pressable
          accessibilityRole="button"
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

function DemoBody({
  componentId,
  demo,
  onInteracted,
}: {
  componentId: DemoComponentId;
  demo: NonNullable<ReturnType<typeof getModuleById>>['demos'][number];
  onInteracted: () => void;
}) {
  switch (componentId) {
    case 'aliasing-visualizer':
      return <AliasingVisualizer demo={demo} onInteracted={onInteracted} />;
    case 'sine-generator':
      return <SineGeneratorVisualizer demo={demo} onInteracted={onInteracted} />;
    case 'spectrum-visualizer':
      return <SpectrumVisualizer demo={demo} onInteracted={onInteracted} />;
    case 'windowing-visualizer':
      return <WindowingVisualizer demo={demo} onInteracted={onInteracted} />;
    case 'filter-visualizer':
      return <FilterVisualizer demo={demo} onInteracted={onInteracted} />;
    case 'convolution-visualizer':
      return <ConvolutionVisualizer demo={demo} onInteracted={onInteracted} />;
    default: {
      const _exhaustive: never = componentId;
      return _exhaustive;
    }
  }
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
