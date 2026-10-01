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

/** Keep N fixed; defaults intentionally land off an integer cycle count. */
const FFT_SIZE = 128;

export function SpectrumVisualizer({ demo, onInteracted }: Props) {
  const [values, setValues] = useState(() => paramDefaults(demo.params));
  const frequencyHz = values.frequencyHz ?? 17.5;
  const sampleRateHz = values.sampleRateHz ?? 256;

  const analysis = useMemo(() => {
    const samples = generateSineSamples({
      frequencyHz,
      sampleRateHz,
      sampleCount: FFT_SIZE,
    });
    const magnitude = fftMagnitude(samples);
    const peak = peakBin(magnitude, 1);
    const peakHz = binFrequencyHz(peak, sampleRateHz, FFT_SIZE);
    const cyclesInFrame = (frequencyHz * FFT_SIZE) / sampleRateHz;
    const deltaF = sampleRateHz / FFT_SIZE;
    const sideEnergy = neighborEnergy(magnitude, peak);
    return { samples, magnitude, peak, peakHz, cyclesInFrame, deltaF, sideEnergy };
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

  const integerCycles = Math.abs(analysis.cyclesInFrame - Math.round(analysis.cyclesInFrame)) < 0.02;

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
      hint="Default tone is off-bin on purpose. Slide frequency onto an integer cycle count to collapse leakage, then nudge away and watch neighbors return.">
      <Text style={styles.label}>Time domain</Text>
      <WaveformPlot samples={analysis.samples} height={100} />
      <Text style={styles.label}>Magnitude spectrum</Text>
      <SpectrumPlot magnitude={analysis.magnitude} fromBin={1} height={100} />
      <Text style={styles.stat}>
        Peak bin {analysis.peak} ≈ {analysis.peakHz.toFixed(1)} Hz · Δf ={' '}
        {analysis.deltaF.toFixed(2)} Hz/bin · ~{analysis.cyclesInFrame.toFixed(2)} cycles/frame
        {integerCycles ? ' · on-bin (clean)' : ` · leakage ${analysis.sideEnergy.toFixed(3)}`}
      </Text>
    </AvDemoShell>
  );
}

function neighborEnergy(magnitude: ArrayLike<number>, peak: number): number {
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
