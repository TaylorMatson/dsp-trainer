import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvDemoShell, paramDefaults } from '@/components/AvDemoShell';
import { WaveformPlot } from '@/components/WaveformPlot';
import type { AvRenderContext } from '@/audio/types';
import { AvTheme } from '@/constants/AvTheme';
import type { Demo } from '@/content/schema';
import {
  convolve,
  generateSineSamples,
  makeEchoKernel,
  makeImpulse,
  resampleLinear,
} from '@/signal';

type Props = {
  demo: Demo;
  onInteracted?: () => void;
};

/** Mid-audio teaching rate: labeled burst Hz survives resample as heard pitch. */
const ANALYSIS_FS = 4000;
const PLOT_BURST_LEN = 80;
/** Playback burst long enough for a clear audible tone + echo spacing. */
const PLAY_BURST_LEN = 320;

export function ConvolutionVisualizer({ demo, onInteracted }: Props) {
  const [values, setValues] = useState(() => paramDefaults(demo.params));
  const [useEcho, setUseEcho] = useState(true);
  const delaySamples = Math.round(values.delaySamples ?? 400);
  const decay = values.decay ?? 0.5;
  const frequencyHz = values.frequencyHz ?? 400;

  const analysis = useMemo(() => {
    const { burst, kernel, output } = buildConvolution(
      delaySamples,
      decay,
      useEcho,
      PLOT_BURST_LEN,
      frequencyHz,
    );
    return { burst, kernel, output };
  }, [delaySamples, decay, useEcho, frequencyHz]);

  const source = useCallback(
    (ctx: AvRenderContext) => {
      const delay = Math.round(ctx.params.delaySamples ?? delaySamples);
      const dec = ctx.params.decay ?? decay;
      const f = ctx.params.frequencyHz ?? frequencyHz;
      const { output } = buildConvolution(delay, dec, useEcho, PLAY_BURST_LEN, f);
      return resampleLinear(output, ANALYSIS_FS, ctx.outputSampleRateHz);
    },
    [delaySamples, decay, useEcho, frequencyHz],
  );

  const toggleEcho = () => {
    setUseEcho((prev) => !prev);
    onInteracted?.();
  };

  const delayMs = (delaySamples / ANALYSIS_FS) * 1000;

  return (
    <AvDemoShell
      title={demo.title}
      summary={demo.summary}
      params={demo.params}
      values={values}
      onValuesChange={setValues}
      audioMode="oneshot"
      analysisSampleRateHz={ANALYSIS_FS}
      source={source}
      onInteracted={onInteracted}
      audioRefreshKey={useEcho ? 'echo' : 'impulse'}
      hint="Press Play for an audible burst through the IR. Toggle Use echo and change frequency — audio rebuilds if you are in a play cycle."
      extraControls={
        <View style={styles.toggleRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: useEcho }}
            onPress={toggleEcho}
            style={[styles.chip, useEcho && styles.chipActive]}
            testID="conv-use-echo">
            <Text style={styles.chipText}>{useEcho ? 'Use echo: on' : 'Use echo: off'}</Text>
          </Pressable>
        </View>
      }>
      <Text style={styles.label}>Input burst · {frequencyHz.toFixed(0)} Hz</Text>
      <WaveformPlot samples={analysis.burst} height={80} />
      <Text style={styles.label}>
        Impulse response (
        {useEcho
          ? `echo @ ${delaySamples} samples (~${delayMs.toFixed(0)} ms)`
          : 'unit impulse'}
        )
      </Text>
      <WaveformPlot
        samples={analysis.kernel}
        height={70}
        strokeColor={AvTheme.plotKernel}
      />
      <Text style={styles.label}>Convolution output</Text>
      <WaveformPlot
        samples={analysis.output}
        height={90}
        strokeColor={AvTheme.plotFiltered}
      />
    </AvDemoShell>
  );
}

function buildConvolution(
  delaySamples: number,
  decay: number,
  useEcho: boolean,
  burstLen: number,
  frequencyHz: number,
): { burst: Float64Array; kernel: Float64Array; output: Float64Array } {
  const signal = generateSineSamples({
    frequencyHz,
    sampleRateHz: ANALYSIS_FS,
    amplitude: 0.9,
    sampleCount: burstLen,
  });
  const burst = new Float64Array(burstLen);
  // Keep most of the buffer as live tone so the pitch is unmistakable.
  const live = Math.max(8, Math.floor((burstLen * 3) / 4));
  for (let i = 0; i < live; i += 1) {
    burst[i] = signal[i] ?? 0;
  }
  const kernel = useEcho
    ? makeEchoKernel(Math.max(1, delaySamples), decay)
    : makeImpulse(1);
  const output = convolve(burst, kernel);
  return { burst, kernel, output };
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignSelf: 'stretch',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
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
  label: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: AvTheme.muted,
    alignSelf: 'stretch',
  },
});
