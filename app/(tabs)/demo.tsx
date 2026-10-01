import { useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { SinePlot } from '@/components/SinePlot';
import { Text, View } from '@/components/Themed';
import { AvTheme } from '@/constants/AvTheme';
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
      <Text style={styles.kicker}>SMOKE</Text>
      <Text style={styles.title}>Sine smoke</Text>
      <Text style={styles.caption}>
        Synth-only plot at {frequencyHz} Hz. Peak |amp| ≈ {peak.toFixed(3)}.
      </Text>
      <View style={styles.canvas}>
        <SinePlot frequencyHz={frequencyHz} strokeColor={AvTheme.plotPrimary} />
      </View>
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
    paddingTop: 24,
    gap: 14,
    alignItems: 'stretch',
    backgroundColor: AvTheme.bg,
  },
  kicker: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    letterSpacing: 1.2,
    color: AvTheme.teal,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AvTheme.ink,
  },
  caption: {
    fontSize: 14,
    color: AvTheme.muted,
  },
  canvas: {
    backgroundColor: AvTheme.canvas,
    borderColor: AvTheme.line,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
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
    backgroundColor: AvTheme.accentFill,
  },
  chipText: {
    fontWeight: '600',
    color: AvTheme.ink,
  },
});
