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

  return (
    <View style={styles.wrap}>
      <Text style={styles.caption}>{demo.summary}</Text>
      <WaveformPlot samples={samples} />
      <Text style={styles.stat}>
        Discrete sine · {frequencyHz.toFixed(0)} Hz @ fs {sampleRateHz.toFixed(0)} Hz
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
    gap: 14,
    alignItems: 'center',
    width: '100%',
  },
  caption: {
    fontSize: 14,
    opacity: 0.75,
    alignSelf: 'stretch',
    lineHeight: 20,
  },
  stat: {
    fontSize: 14,
    fontWeight: '600',
    alignSelf: 'stretch',
  },
});
