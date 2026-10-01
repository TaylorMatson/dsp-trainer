import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvDemoShell, paramDefaults } from '@/components/AvDemoShell';
import { SpectrumPlot } from '@/components/SpectrumPlot';
import type { AvRenderContext } from '@/audio/types';
import { AvTheme } from '@/constants/AvTheme';
import type { Demo } from '@/content/schema';
import {
  audibleFrequencyHz,
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

const FFT_SIZE = 256;

export function WindowingVisualizer({ demo, onInteracted }: Props) {
  const [values, setValues] = useState(() => paramDefaults(demo.params));
  const [windowKind, setWindowKind] = useState<WindowKind>('rectangular');
  const frequencyHz = values.frequencyHz ?? 437.5;
  const sampleRateHz = values.sampleRateHz ?? 4096;

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
    const cyclesInFrame = (frequencyHz * FFT_SIZE) / sampleRateHz;
    return { magnitude, peak, sideEnergy, cyclesInFrame };
  }, [frequencyHz, sampleRateHz, windowKind]);

  const source = useCallback(
    (ctx: AvRenderContext) => {
      const f = ctx.params.frequencyHz ?? frequencyHz;
      const fs = ctx.params.sampleRateHz ?? sampleRateHz;
      const playHz = audibleFrequencyHz(f, fs, ctx.outputSampleRateHz);
      return new Float32Array(
        generateSineSamples({
          frequencyHz: playHz,
          sampleRateHz: ctx.outputSampleRateHz,
          amplitude: 0.45,
          sampleCount: ctx.frameCount,
        }),
      );
    },
    [frequencyHz, sampleRateHz],
  );

  const selectWindow = (kind: WindowKind) => {
    setWindowKind(kind);
    onInteracted?.();
  };

  return (
    <AvDemoShell
      title={demo.title}
      summary={demo.summary}
      params={demo.params}
      values={values}
      onValuesChange={setValues}
      audioMode="continuous"
      analysisSampleRateHz={sampleRateHz}
      source={source}
      onInteracted={onInteracted}
      hint="Play a mid-range tone, nudge frequency off an integer cycle count, then flip Rectangular ↔ Hann."
      extraControls={
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
      }>
      <SpectrumPlot magnitude={analysis.magnitude} fromBin={1} height={110} />
      <Text style={styles.stat}>
        {windowKind === 'hann' ? 'Hann' : 'Rectangular'} · {frequencyHz.toFixed(1)} Hz @{' '}
        {sampleRateHz.toFixed(0)} Hz · ~{analysis.cyclesInFrame.toFixed(2)} cycles/frame ·
        side energy {analysis.sideEnergy.toFixed(3)}
      </Text>
    </AvDemoShell>
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
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'stretch',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderColor: AvTheme.line,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  chipActive: {
    borderColor: AvTheme.accent,
    backgroundColor: 'rgba(223, 242, 90, 0.12)',
  },
  chipText: {
    fontWeight: '600',
    fontSize: 14,
    color: AvTheme.ink,
  },
  stat: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: AvTheme.ink,
    alignSelf: 'stretch',
  },
});
