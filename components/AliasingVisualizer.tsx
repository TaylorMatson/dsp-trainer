import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AvDemoShell, paramDefaults } from '@/components/AvDemoShell';
import { WaveformPlot } from '@/components/WaveformPlot';
import type { AvRenderContext } from '@/audio/types';
import { AvTheme } from '@/constants/AvTheme';
import type { Demo } from '@/content/schema';
import {
  aliasedFrequencyHz,
  generateSineSamples,
  isAliasing,
  nyquistHz,
  resampleLinear,
} from '@/signal';

type AliasingVisualizerProps = {
  demo: Demo;
  onInteracted?: () => void;
};

export function AliasingVisualizer({ demo, onInteracted }: AliasingVisualizerProps) {
  const [values, setValues] = useState(() => paramDefaults(demo.params));
  const frequencyHz = values.frequencyHz ?? 200;
  const sampleRateHz = values.sampleRateHz ?? 1000;

  const analysis = useMemo(() => {
    const nyquist = nyquistHz(sampleRateHz);
    const aliasing = isAliasing(frequencyHz, sampleRateHz);
    const aliasHz = aliasedFrequencyHz(frequencyHz, sampleRateHz);
    const samples = generateSineSamples({
      frequencyHz,
      sampleRateHz,
      sampleCount: 64,
    });
    return { nyquist, aliasing, aliasHz, samples };
  }, [frequencyHz, sampleRateHz]);

  const source = useCallback(
    (ctx: AvRenderContext) => {
      const fs = ctx.params.sampleRateHz ?? sampleRateHz;
      const f = ctx.params.frequencyHz ?? frequencyHz;
      const teachingCount = Math.max(
        64,
        Math.round(fs * (ctx.frameCount / ctx.outputSampleRateHz)),
      );
      const teaching = generateSineSamples({
        frequencyHz: f,
        sampleRateHz: fs,
        amplitude: 0.55,
        sampleCount: teachingCount,
      });
      return resampleLinear(teaching, fs, ctx.outputSampleRateHz);
    },
    [frequencyHz, sampleRateHz],
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
      hint="Play, then raise frequency past Nyquist — the pitch you hear should match the folded alias.">
      <WaveformPlot samples={analysis.samples} strokeColor={AvTheme.plotPrimary} />
      <Text style={styles.stat}>
        Nyquist {analysis.nyquist.toFixed(0)} Hz ·{' '}
        {analysis.aliasing
          ? `Aliasing → ~${analysis.aliasHz.toFixed(0)} Hz`
          : 'No aliasing'}
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
