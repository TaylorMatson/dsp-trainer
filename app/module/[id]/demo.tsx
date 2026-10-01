import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { AliasingVisualizer } from '@/components/AliasingVisualizer';
import { ConvolutionVisualizer } from '@/components/ConvolutionVisualizer';
import { FilterVisualizer } from '@/components/FilterVisualizer';
import { SineGeneratorVisualizer } from '@/components/SineGeneratorVisualizer';
import { SpectrumVisualizer } from '@/components/SpectrumVisualizer';
import { WindowingVisualizer } from '@/components/WindowingVisualizer';
import { AvTheme } from '@/constants/AvTheme';
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
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.unavailable}>Demo unavailable</Text>
      </ScrollView>
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
      <Stack.Screen
        options={{
          title: demo.title,
          headerStyle: { backgroundColor: AvTheme.bg },
          headerTintColor: AvTheme.ink,
          headerTitleStyle: { color: AvTheme.ink },
        }}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <DemoBody componentId={demo.componentId} demo={demo} onInteracted={onInteracted} />
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
  scroll: {
    flex: 1,
    backgroundColor: AvTheme.bg,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 48,
    gap: 16,
    alignItems: 'stretch',
    backgroundColor: AvTheme.bg,
  },
  unavailable: {
    fontSize: 24,
    fontWeight: '700',
    color: AvTheme.ink,
  },
  link: {
    fontSize: 16,
    fontWeight: '600',
    color: AvTheme.accent,
  },
});
