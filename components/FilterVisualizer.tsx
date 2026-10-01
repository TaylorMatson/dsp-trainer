import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvDemoShell, paramDefaults } from '@/components/AvDemoShell';
import { WaveformPlot } from '@/components/WaveformPlot';
import type { AvRenderContext } from '@/audio/types';
import { AvTheme } from '@/constants/AvTheme';
import type { Demo } from '@/content/schema';
import {
  applyTeachingFilter,
  generateSineSamples,
  normalizePeak,
  resampleLinear,
  type FilterFamily,
  type FilterKind,
} from '@/signal';

type Props = {
  demo: Demo;
  onInteracted?: () => void;
};

/** Mid-audio teaching rate so labeled Hz == heard pitch after resample. */
const ANALYSIS_FS = 8000;
const ANALYSIS_COUNT = 256;

export function FilterVisualizer({ demo, onInteracted }: Props) {
  const [values, setValues] = useState(() => paramDefaults(demo.params));
  const [family, setFamily] = useState<FilterFamily>('fir');
  const [kind, setKind] = useState<FilterKind>('lowpass');
  const lowHz = values.lowHz ?? 220;
  const highHz = values.highHz ?? 2000;
  const strength = values.strength ?? (family === 'fir' ? 5 : 0.15);

  const analysis = useMemo(() => {
    const mixed = mixTones(lowHz, highHz, ANALYSIS_FS, ANALYSIS_COUNT);
    const filtered = applyTeachingFilter(mixed, family, kind, strength);
    return { mixed, filtered };
  }, [lowHz, highHz, family, kind, strength]);

  const source = useCallback(
    (ctx: AvRenderContext) => {
      const low = ctx.params.lowHz ?? lowHz;
      const high = ctx.params.highHz ?? highHz;
      const str = ctx.params.strength ?? strength;
      // Filter at teaching fs with the labeled Hz, then resample — pitch matches UI.
      const teachingCount = Math.max(
        64,
        Math.round(ANALYSIS_FS * (ctx.frameCount / ctx.outputSampleRateHz)),
      );
      const mixed = mixTones(low, high, ANALYSIS_FS, teachingCount);
      const filtered = applyTeachingFilter(mixed, family, kind, str);
      return normalizePeak(
        resampleLinear(filtered, ANALYSIS_FS, ctx.outputSampleRateHz),
        0.55,
      );
    },
    [lowHz, highHz, strength, family, kind],
  );

  const pickFamily = (next: FilterFamily) => {
    setFamily(next);
    onInteracted?.();
  };
  const pickKind = (next: FilterKind) => {
    setKind(next);
    onInteracted?.();
  };

  return (
    <AvDemoShell
      title={demo.title}
      summary={demo.summary}
      params={demo.params}
      values={values}
      onValuesChange={setValues}
      audioMode="continuous"
      analysisSampleRateHz={ANALYSIS_FS}
      source={source}
      onInteracted={onInteracted}
      audioRefreshKey={`${family}-${kind}`}
      hint="Play the mix, then flip FIR/IIR or LP/HP — audio rebuilds live (no Rewind needed). Slider Hz is the pitch you hear."
      extraControls={
        <View style={styles.toggleRow}>
          <Chip label="FIR" active={family === 'fir'} onPress={() => pickFamily('fir')} />
          <Chip label="IIR" active={family === 'iir'} onPress={() => pickFamily('iir')} />
          <Chip
            label="Lowpass"
            active={kind === 'lowpass'}
            onPress={() => pickKind('lowpass')}
          />
          <Chip
            label="Highpass"
            active={kind === 'highpass'}
            onPress={() => pickKind('highpass')}
          />
        </View>
      }>
      <Text style={styles.label}>
        Input (low {lowHz.toFixed(0)} Hz + high {highHz.toFixed(0)} Hz)
      </Text>
      <WaveformPlot samples={analysis.mixed} height={90} />
      <Text style={styles.label}>
        Output · {family.toUpperCase()} {kind}
      </Text>
      <WaveformPlot
        samples={analysis.filtered}
        height={90}
        strokeColor={AvTheme.plotFiltered}
      />
    </AvDemoShell>
  );
}

function mixTones(
  lowHz: number,
  highHz: number,
  sampleRateHz: number,
  sampleCount: number,
): Float64Array {
  const low = generateSineSamples({
    frequencyHz: lowHz,
    sampleRateHz,
    amplitude: 0.55,
    sampleCount,
  });
  const high = generateSineSamples({
    frequencyHz: highHz,
    sampleRateHz,
    amplitude: 0.45,
    sampleCount,
  });
  const mixed = new Float64Array(sampleCount);
  for (let i = 0; i < sampleCount; i += 1) {
    mixed[i] = (low[i] ?? 0) + (high[i] ?? 0);
  }
  return mixed;
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}>
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignSelf: 'stretch',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    fontSize: 13,
    color: AvTheme.ink,
  },
  label: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: AvTheme.muted,
    alignSelf: 'stretch',
  },
});
