import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AvDemoShell, paramDefaults } from '@/components/AvDemoShell';
import { WaveformPlot } from '@/components/WaveformPlot';
import type { AvRenderContext } from '@/audio/types';
import { AvTheme } from '@/constants/AvTheme';
import type { Demo } from '@/content/schema';
import { generateSineSamples } from '@/signal';

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

  const source = useCallback((ctx: AvRenderContext) => {
    const f = ctx.params.frequencyHz ?? frequencyHz;
    const a = ctx.params.amplitude ?? amplitude;
    return new Float32Array(
      generateSineSamples({
        frequencyHz: f,
        sampleRateHz: ctx.outputSampleRateHz,
        amplitude: a * 0.55,
        sampleCount: ctx.frameCount,
      }),
    );
  }, [frequencyHz, amplitude]);

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
      hint="Play, then nudge frequency or amplitude — the tone and the plot share one formula.">
      <WaveformPlot samples={samples} />
      <Text style={styles.stat}>
        Discrete sine · {frequencyHz.toFixed(0)} Hz @ fs {sampleRateHz.toFixed(0)} Hz
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
