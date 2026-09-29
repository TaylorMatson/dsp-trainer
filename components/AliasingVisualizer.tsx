import { useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { WaveformPlot } from '@/components/WaveformPlot';
import type { Demo } from '@/content/schema';
import {
  aliasedFrequencyHz,
  generateSineSamples,
  isAliasing,
  nyquistHz,
} from '@/signal';

type AliasingVisualizerProps = {
  demo: Demo;
  onInteracted?: () => void;
};

function paramDefaults(demo: Demo): Record<string, number> {
  const values: Record<string, number> = {};
  for (const param of demo.params) {
    values[param.id] = param.defaultValue;
  }
  return values;
}

export function AliasingVisualizer({ demo, onInteracted }: AliasingVisualizerProps) {
  const [values, setValues] = useState(() => paramDefaults(demo));
  const frequencyHz = values.frequencyHz ?? 200;
  const sampleRateHz = values.sampleRateHz ?? 1000;

  const analysis = useMemo(() => {
    const nyquist = nyquistHz(sampleRateHz);
    const aliasing = isAliasing(frequencyHz, sampleRateHz);
    const aliasHz = aliasedFrequencyHz(frequencyHz, sampleRateHz);
    // Sampling the true tone at fs naturally folds into the visible alias.
    const samples = generateSineSamples({
      frequencyHz,
      sampleRateHz,
      sampleCount: 64,
    });
    return { nyquist, aliasing, aliasHz, samples };
  }, [frequencyHz, sampleRateHz]);

  const bump = (paramId: string, delta: number, min: number, max: number) => {
    setValues((prev) => {
      const next = Math.min(max, Math.max(min, (prev[paramId] ?? min) + delta));
      return { ...prev, [paramId]: next };
    });
    onInteracted?.();
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.caption}>{demo.summary}</Text>
      <WaveformPlot samples={analysis.samples} />
      <Text style={styles.stat}>
        Nyquist {analysis.nyquist.toFixed(0)} Hz ·{' '}
        {analysis.aliasing
          ? `Aliasing → ~${analysis.aliasHz.toFixed(0)} Hz`
          : 'No aliasing'}
      </Text>
      {demo.params.map((param) => {
        const value = values[param.id] ?? param.defaultValue;
        return (
          <View key={param.id} style={styles.paramRow}>
            <Text style={styles.paramLabel}>
              {param.label}: {value}
              {param.unit ? ` ${param.unit}` : ''}
            </Text>
            <View style={styles.paramButtons}>
              <Pressable
                onPress={() => bump(param.id, -param.step, param.min, param.max)}
                style={styles.chip}>
                <Text style={styles.chipText}>−</Text>
              </Pressable>
              <Pressable
                onPress={() => bump(param.id, param.step, param.min, param.max)}
                style={styles.chip}>
                <Text style={styles.chipText}>+</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
    alignItems: 'center',
    width: '100%',
  },
  caption: {
    fontSize: 14,
    opacity: 0.75,
    alignSelf: 'stretch',
    lineHeight: 20,
  },
  stat: {
    fontSize: 14,
    fontWeight: '600',
    alignSelf: 'stretch',
  },
  paramRow: {
    alignSelf: 'stretch',
    gap: 8,
  },
  paramLabel: {
    fontSize: 15,
  },
  paramButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(27, 108, 168, 0.18)',
  },
  chipText: {
    fontWeight: '700',
    fontSize: 16,
  },
});
