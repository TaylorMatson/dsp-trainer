import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AvDemoShell, paramDefaults } from '@/components/AvDemoShell';
import { WaveformPlot } from '@/components/WaveformPlot';
import type { AvRenderContext } from '@/audio/types';
import { AvTheme } from '@/constants/AvTheme';
import type { Demo } from '@/content/schema';
import {
  generateSineSamples,
  isAliasing,
  nyquistHz,
  resampleLinear,
} from '@/signal';

type Props = {
  demo: Demo;
  onInteracted?: () => void;
};

export function SineGeneratorVisualizer({ demo, onInteracted }: Props) {
  const [values, setValues] = useState(() => paramDefaults(demo.params));
  const frequencyHz = values.frequencyHz ?? 220;
  const amplitude = values.amplitude ?? 1;
  const sampleRateHz = values.sampleRateHz ?? 2000;

  const samples = useMemo(
    () =>
      generateSineSamples({
        frequencyHz,
        sampleRateHz,
        amplitude,
        sampleCount: 128,
      }),
    [frequencyHz, sampleRateHz, amplitude],
  );

  const nyquist = nyquistHz(sampleRateHz);
  const aliasing = isAliasing(frequencyHz, sampleRateHz);

  // Generate at teaching fs, then upsample — sample-rate / Nyquist changes are audible.
  const source = useCallback(
    (ctx: AvRenderContext) => {
      const f = ctx.params.frequencyHz ?? frequencyHz;
      const a = ctx.params.amplitude ?? amplitude;
      const fs = ctx.params.sampleRateHz ?? sampleRateHz;
      const teachingCount = Math.max(
        64,
        Math.round(fs * (ctx.frameCount / ctx.outputSampleRateHz)),
      );
      const teaching = generateSineSamples({
        frequencyHz: f,
        sampleRateHz: fs,
        amplitude: a * 0.55,
        sampleCount: teachingCount,
      });
      return resampleLinear(teaching, fs, ctx.outputSampleRateHz);
    },
    [frequencyHz, amplitude, sampleRateHz],
  );

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
      hint="Play, then drop sample rate until the tone folds past Nyquist — pitch should jump with the alias.">
      <WaveformPlot samples={samples} />
      <Text style={styles.stat}>
        Discrete sine · {frequencyHz.toFixed(0)} Hz @ fs {sampleRateHz.toFixed(0)} Hz ·
        Nyquist {nyquist.toFixed(0)} Hz
        {aliasing ? ' · aliasing' : ''}
      </Text>
    </AvDemoShell>
  );
}

const styles = StyleSheet.create({
  stat: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: AvTheme.ink,
    alignSelf: 'stretch',
  },
});
