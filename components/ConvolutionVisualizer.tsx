import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import {
  bumpParam,
  DemoParamControls,
  paramDefaults,
} from '@/components/DemoParamControls';
import { Text, View } from '@/components/Themed';
import { WaveformPlot } from '@/components/WaveformPlot';
import type { Demo } from '@/content/schema';
import { convolve, generateSineSamples, makeEchoKernel, makeImpulse } from '@/signal';

type Props = {
  demo: Demo;
  onInteracted?: () => void;
};

export function ConvolutionVisualizer({ demo, onInteracted }: Props) {
  const [values, setValues] = useState(() => paramDefaults(demo.params));
  const delaySamples = Math.round(values.delaySamples ?? 8);
  const decay = values.decay ?? 0.5;
  const useEcho = (values.useEcho ?? 1) >= 1;

  const analysis = useMemo(() => {
    const signal = generateSineSamples({
      frequencyHz: 8,
      sampleRateHz: 64,
      amplitude: 0.9,
      sampleCount: 48,
    });
    // Brief burst: first quarter of a sine, then silence — easier to see echoes.
    const burst = new Float64Array(48);
    for (let i = 0; i < 12; i += 1) {
      burst[i] = signal[i] ?? 0;
    }
    const kernel = useEcho
      ? makeEchoKernel(Math.max(1, delaySamples), decay)
      : makeImpulse(1);
    const output = convolve(burst, kernel);
    return { burst, kernel, output };
  }, [delaySamples, decay, useEcho]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.caption}>{demo.summary}</Text>
      <Text style={styles.label}>Input burst</Text>
      <WaveformPlot samples={analysis.burst} height={80} />
      <Text style={styles.label}>
        Impulse response ({useEcho ? `echo @ ${delaySamples}` : 'unit impulse'})
      </Text>
      <WaveformPlot samples={analysis.kernel} height={70} strokeColor="#8B5A2B" />
      <Text style={styles.label}>Convolution output</Text>
      <WaveformPlot samples={analysis.output} height={90} strokeColor="#2E8B57" />
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
    alignSelf: 'stretch',
  },
});
