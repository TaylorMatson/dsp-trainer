import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import {
  bumpParam,
  DemoParamControls,
  paramDefaults,
} from '@/components/DemoParamControls';
import { SpectrumPlot } from '@/components/SpectrumPlot';
import { Text, View } from '@/components/Themed';
import { WaveformPlot } from '@/components/WaveformPlot';
import type { Demo } from '@/content/schema';
import {
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

  return (
    <View style={styles.wrap}>
      <Text style={styles.caption}>{demo.summary}</Text>
      <Text style={styles.label}>Time domain</Text>
      <WaveformPlot samples={analysis.samples} height={100} />
      <Text style={styles.label}>Magnitude spectrum</Text>
      <SpectrumPlot magnitude={analysis.magnitude} fromBin={1} height={100} />
      <Text style={styles.stat}>
        Peak bin {analysis.peak} ≈ {analysis.peakHz.toFixed(1)} Hz
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
  stat: {
    fontSize: 14,
    fontWeight: '600',
    alignSelf: 'stretch',
  },
});
