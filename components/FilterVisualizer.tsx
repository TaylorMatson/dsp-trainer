import { useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import {
  bumpParam,
  DemoParamControls,
  paramDefaults,
} from '@/components/DemoParamControls';
import { Text, View } from '@/components/Themed';
import { WaveformPlot } from '@/components/WaveformPlot';
import type { Demo } from '@/content/schema';
import {
  applyTeachingFilter,
  generateSineSamples,
  type FilterFamily,
  type FilterKind,
} from '@/signal';

type Props = {
  demo: Demo;
  onInteracted?: () => void;
};

export function FilterVisualizer({ demo, onInteracted }: Props) {
  const [values, setValues] = useState(() => paramDefaults(demo.params));
  const [family, setFamily] = useState<FilterFamily>('fir');
  const [kind, setKind] = useState<FilterKind>('lowpass');
  const lowHz = values.lowHz ?? 4;
  const highHz = values.highHz ?? 32;
  const strength = values.strength ?? (family === 'fir' ? 5 : 0.15);
  const sampleRateHz = 128;

  const analysis = useMemo(() => {
    const low = generateSineSamples({
      frequencyHz: lowHz,
      sampleRateHz,
      amplitude: 0.55,
      sampleCount: 128,
    });
    const high = generateSineSamples({
      frequencyHz: highHz,
      sampleRateHz,
      amplitude: 0.45,
      sampleCount: 128,
    });
    const mixed = new Float64Array(128);
    for (let i = 0; i < 128; i += 1) {
      mixed[i] = (low[i] ?? 0) + (high[i] ?? 0);
    }
    const filtered = applyTeachingFilter(mixed, family, kind, strength);
    return { mixed, filtered };
  }, [lowHz, highHz, family, kind, strength]);

  const pickFamily = (next: FilterFamily) => {
    setFamily(next);
    onInteracted?.();
  };
  const pickKind = (next: FilterKind) => {
    setKind(next);
    onInteracted?.();
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.caption}>{demo.summary}</Text>
      <View style={styles.toggleRow}>
        <Chip label="FIR" active={family === 'fir'} onPress={() => pickFamily('fir')} />
        <Chip label="IIR" active={family === 'iir'} onPress={() => pickFamily('iir')} />
        <Chip
          label="Lowpass"
          active={kind === 'lowpass'}
          onPress={() => pickKind('lowpass')}
        />
        <Chip
          label="Highpass"
          active={kind === 'highpass'}
          onPress={() => pickKind('highpass')}
        />
      </View>
      <Text style={styles.label}>Input (low + high sine)</Text>
      <WaveformPlot samples={analysis.mixed} height={90} />
      <Text style={styles.label}>
        Output · {family.toUpperCase()} {kind}
      </Text>
      <WaveformPlot samples={analysis.filtered} height={90} strokeColor="#2E8B57" />
      <DemoParamControls
        params={demo.params}
        values={values}
        onBump={(id, delta, min, max) => {
          setValues((prev) => bumpParam(prev, id, delta, min, max));
          onInteracted?.();
        }}
      />
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}>
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    alignItems: 'center',
    width: '100%',
  },
  caption: {
    fontSize: 14,
    opacity: 0.75,
    alignSelf: 'stretch',
    lineHeight: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignSelf: 'stretch',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(27, 108, 168, 0.12)',
  },
  chipActive: {
    backgroundColor: 'rgba(27, 108, 168, 0.32)',
  },
  chipText: {
    fontWeight: '600',
    fontSize: 13,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
    alignSelf: 'stretch',
  },
});
