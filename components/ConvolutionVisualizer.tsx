import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

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

const ANALYSIS_FS = 64;
const BURST_LEN = 48;

export function ConvolutionVisualizer({ demo, onInteracted }: Props) {
  const [values, setValues] = useState(() => paramDefaults(demo.params));
  const delaySamples = Math.round(values.delaySamples ?? 8);
  const decay = values.decay ?? 0.5;
  const useEcho = (values.useEcho ?? 1) >= 1;

  const analysis = useMemo(() => {
    const { burst, kernel, output } = buildConvolution(
      delaySamples,
      decay,
      useEcho,
      BURST_LEN,
    );
    return { burst, kernel, output };
  }, [delaySamples, decay, useEcho]);

  const source = useCallback(
    (ctx: AvRenderContext) => {
      const delay = Math.round(ctx.params.delaySamples ?? delaySamples);
      const dec = ctx.params.decay ?? decay;
      const echo = (ctx.params.useEcho ?? (useEcho ? 1 : 0)) >= 1;
      // Longer burst for a hearable oneshot, same IR shape as the plot.
      const { output } = buildConvolution(delay, dec, echo, 96);
      const teachingRate = ANALYSIS_FS;
      return resampleLinear(output, teachingRate, ctx.outputSampleRateHz);
    },
    [delaySamples, decay, useEcho],
  );

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
      hint="Press Play for a burst through the IR. Toggle echo and hear the delayed tap.">
      <Text style={styles.label}>Input burst</Text>
      <WaveformPlot samples={analysis.burst} height={80} />
      <Text style={styles.label}>
        Impulse response ({useEcho ? `echo @ ${delaySamples}` : 'unit impulse'})
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
): { burst: Float64Array; kernel: Float64Array; output: Float64Array } {
  const signal = generateSineSamples({
    frequencyHz: 8,
    sampleRateHz: ANALYSIS_FS,
    amplitude: 0.9,
    sampleCount: burstLen,
  });
  const burst = new Float64Array(burstLen);
  const live = Math.max(4, Math.floor(burstLen / 4));
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
  label: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: AvTheme.muted,
    alignSelf: 'stretch',
  },
});
