import { useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { SinePlot } from '@/components/SinePlot';
import { Text, View } from '@/components/Themed';
import { generateSineSamples, peakAmplitude } from '@/signal/sine';

const FREQUENCIES = [220, 440, 880] as const;

export default function DemoScreen() {
  const [frequencyHz, setFrequencyHz] = useState<(typeof FREQUENCIES)[number]>(440);

  const peak = useMemo(() => {
    const samples = generateSineSamples({
      frequencyHz,
      sampleRateHz: 48_000,
      sampleCount: 480,
    });
    return peakAmplitude(samples);
  }, [frequencyHz]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sine smoke</Text>
      <Text style={styles.caption}>
        Synth-only plot at {frequencyHz} Hz. Peak |amp| ≈ {peak.toFixed(3)}.
      </Text>
      <SinePlot frequencyHz={frequencyHz} />
      <View style={styles.row}>
        {FREQUENCIES.map((hz) => (
          <Pressable
            key={hz}
            onPress={() => setFrequencyHz(hz)}
            style={[styles.chip, frequencyHz === hz && styles.chipActive]}>
            <Text style={styles.chipText}>{hz} Hz</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    gap: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    alignSelf: 'flex-start',
  },
  caption: {
    fontSize: 14,
    opacity: 0.75,
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(27, 108, 168, 0.12)',
  },
  chipActive: {
    backgroundColor: 'rgba(27, 108, 168, 0.35)',
  },
  chipText: {
    fontWeight: '600',
  },
});
