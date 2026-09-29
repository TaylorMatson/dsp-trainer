import { useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import {
  bumpParam,
  DemoParamControls,
  paramDefaults,
} from '@/components/DemoParamControls';
import { SpectrumPlot } from '@/components/SpectrumPlot';
import { Text, View } from '@/components/Themed';
import type { Demo } from '@/content/schema';
import {
  applyWindow,
  fftMagnitude,
  generateSineSamples,
  makeWindow,
  peakBin,
  type WindowKind,
} from '@/signal';

type Props = {
  demo: Demo;
  onInteracted?: () => void;
};

const FFT_SIZE = 128;

export function WindowingVisualizer({ demo, onInteracted }: Props) {
  const [values, setValues] = useState(() => paramDefaults(demo.params));
  const [windowKind, setWindowKind] = useState<WindowKind>('rectangular');
  const frequencyHz = values.frequencyHz ?? 17.5;
  const sampleRateHz = values.sampleRateHz ?? 128;

  const analysis = useMemo(() => {
    const raw = generateSineSamples({
      frequencyHz,
      sampleRateHz,
      sampleCount: FFT_SIZE,
    });
    const window = makeWindow(windowKind, FFT_SIZE);
    const windowed = applyWindow(raw, window);
    const magnitude = fftMagnitude(windowed);
    const peak = peakBin(magnitude, 1);
    const sideEnergy = sideLobeEnergy(magnitude, peak);
    return { magnitude, peak, sideEnergy };
  }, [frequencyHz, sampleRateHz, windowKind]);

  const selectWindow = (kind: WindowKind) => {
    setWindowKind(kind);
    onInteracted?.();
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.caption}>{demo.summary}</Text>
      <View style={styles.toggleRow}>
        <WindowChip
          label="Rectangular"
          active={windowKind === 'rectangular'}
          onPress={() => selectWindow('rectangular')}
        />
        <WindowChip
          label="Hann"
          active={windowKind === 'hann'}
          onPress={() => selectWindow('hann')}
        />
      </View>
      <SpectrumPlot magnitude={analysis.magnitude} fromBin={1} height={110} />
      <Text style={styles.stat}>
        {windowKind === 'hann' ? 'Hann' : 'Rectangular'} · peak bin {analysis.peak} ·
        side energy {analysis.sideEnergy.toFixed(3)}
      </Text>
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

function WindowChip({
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

function sideLobeEnergy(magnitude: ArrayLike<number>, peak: number): number {
  let side = 0;
  let total = 0;
  for (let i = 1; i < magnitude.length; i += 1) {
    const v = magnitude[i] ?? 0;
    const e = v * v;
    total += e;
    if (Math.abs(i - peak) > 1) {
      side += e;
    }
  }
  return total > 0 ? side / total : 0;
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
    gap: 10,
    alignSelf: 'stretch',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(27, 108, 168, 0.12)',
  },
  chipActive: {
    backgroundColor: 'rgba(27, 108, 168, 0.32)',
  },
  chipText: {
    fontWeight: '600',
    fontSize: 14,
  },
  stat: {
    fontSize: 14,
    fontWeight: '600',
    alignSelf: 'stretch',
  },
});
