import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AvDemoShell, paramDefaults } from '@/components/AvDemoShell';
import { SpectrumPlot } from '@/components/SpectrumPlot';
import { WaveformPlot } from '@/components/WaveformPlot';
import type { AvRenderContext } from '@/audio/types';
import { AvTheme } from '@/constants/AvTheme';
import type { Demo } from '@/content/schema';
import {
  audibleFrequencyHz,
  binFrequencyHz,
  fftMagnitude,
  generateSineSamples,
  peakBin,
} from '@/signal';

type Props = {
  demo: Demo;
  onInteracted?: () => void;
};

const FFT_SIZE = 128;

export function SpectrumVisualizer({ demo, onInteracted }: Props) {
  const [values, setValues] = useState(() => paramDefaults(demo.params));
  const frequencyHz = values.frequencyHz ?? 16;
  const sampleRateHz = values.sampleRateHz ?? 128;

  const analysis = useMemo(() => {
    const samples = generateSineSamples({
      frequencyHz,
      sampleRateHz,
      sampleCount: FFT_SIZE,
    });
    const magnitude = fftMagnitude(samples);
    const peak = peakBin(magnitude, 1);
    const peakHz = binFrequencyHz(peak, sampleRateHz, FFT_SIZE);
    return { samples, magnitude, peak, peakHz };
  }, [frequencyHz, sampleRateHz]);

  const source = useCallback((ctx: AvRenderContext) => {
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
  }, [frequencyHz, sampleRateHz]);

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
      hint="Play the tone, then move frequency — the magnitude peak tracks what you hear.">
      <Text style={styles.label}>Time domain</Text>
      <WaveformPlot samples={analysis.samples} height={100} />
      <Text style={styles.label}>Magnitude spectrum</Text>
      <SpectrumPlot magnitude={analysis.magnitude} fromBin={1} height={100} />
      <Text style={styles.stat}>
        Peak bin {analysis.peak} ≈ {analysis.peakHz.toFixed(1)} Hz
      </Text>
    </AvDemoShell>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: AvTheme.muted,
    alignSelf: 'stretch',
  },
  stat: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: AvTheme.ink,
    alignSelf: 'stretch',
  },
});
