import Slider from '@react-native-community/slider';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvPlaybackController } from '@/audio/playback';
import type { AvAudioMode, AvSampleSource } from '@/audio/types';
import { AvTheme } from '@/constants/AvTheme';
import type { DemoParam } from '@/content/schema';

export type AvDemoShellProps = {
  title: string;
  summary: string;
  params: DemoParam[];
  values: Record<string, number>;
  onValuesChange: (next: Record<string, number>) => void;
  audioMode: AvAudioMode;
  /** Teaching / analysis rate used when building the audible buffer context. */
  analysisSampleRateHz: number;
  source: AvSampleSource;
  /** Visual stage — module owns plot composition. */
  children: ReactNode;
  /** Extra controls (mode toggles) rendered under param sliders. */
  extraControls?: ReactNode;
  onInteracted?: () => void;
  allowMute?: boolean;
  /** Short “try changing…” caption under transport. */
  hint?: string;
};

export function AvDemoShell({
  title,
  summary,
  params,
  values,
  onValuesChange,
  audioMode,
  analysisSampleRateHz,
  source,
  children,
  extraControls,
  onInteracted,
  allowMute = true,
  hint = 'Press Play, then change a parameter — listen and watch together.',
}: AvDemoShellProps) {
  const [transport, setTransport] = useState<'stopped' | 'playing' | 'paused'>('stopped');
  const [muted, setMuted] = useState(false);
  const valuesRef = useRef(values);
  const controllerRef = useRef<AvPlaybackController | null>(null);
  const sourceRef = useRef(source);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  useEffect(() => {
    const controller = new AvPlaybackController({
      audioMode,
      source: (ctx) => sourceRef.current(ctx),
      analysisSampleRateHz,
      getParams: () => valuesRef.current,
    });
    controllerRef.current = controller;
    return () => {
      controller.release();
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    };
  }, [audioMode, analysisSampleRateHz]);

  useEffect(() => {
    controllerRef.current?.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    if (transport !== 'playing') return;
    const handle = setTimeout(() => {
      void controllerRef.current?.refreshIfPlaying();
    }, 80);
    return () => clearTimeout(handle);
  }, [transport, values]);

  const mark = useCallback(() => {
    onInteracted?.();
  }, [onInteracted]);

  const onPlay = async () => {
    mark();
    const controller = controllerRef.current;
    if (!controller) return;
    await controller.play();
    setTransport('playing');
  };

  const onPause = () => {
    controllerRef.current?.pause();
    setTransport('paused');
  };

  const onRewind = async () => {
    mark();
    const controller = controllerRef.current;
    if (!controller) return;
    await controller.rewind();
    setTransport(controller.isPlaying ? 'playing' : 'stopped');
  };

  const setParam = (paramId: string, nextValue: number, min: number, max: number) => {
    const clamped = Math.min(max, Math.max(min, nextValue));
    onValuesChange({ ...values, [paramId]: clamped });
    mark();
  };

  return (
    <View style={styles.stage}>
      <View style={styles.stageHead}>
        <Text style={styles.kicker}>{title}</Text>
        <View style={styles.lamps} accessibilityElementsHidden>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[styles.lamp, transport === 'playing' && i < 3 ? styles.lampOn : null]}
            />
          ))}
        </View>
      </View>

      <Text style={styles.summary}>{summary}</Text>

      <View style={styles.canvas}>{children}</View>

      <View style={styles.actions}>
        {transport === 'playing' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Pause"
            onPress={onPause}
            style={styles.actionPrimary}>
            <Text style={styles.actionPrimaryText}>Pause</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Play"
            onPress={() => {
              void onPlay();
            }}
            style={styles.actionPrimary}>
            <Text style={styles.actionPrimaryText}>Play</Text>
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Rewind"
          onPress={() => {
            void onRewind();
          }}
          style={styles.actionGhost}>
          <Text style={styles.actionGhostText}>Rewind</Text>
        </Pressable>
        {allowMute ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={muted ? 'Unmute' : 'Mute'}
            onPress={() => setMuted((m) => !m)}
            style={styles.actionGhost}>
            <Text style={styles.actionGhostText}>{muted ? 'Unmute' : 'Mute'}</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.hint}>{hint}</Text>

      <View style={styles.sliders}>
        {params.map((param) => {
          const value = values[param.id] ?? param.defaultValue;
          return (
            <View key={param.id} style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>
                {param.label}{' '}
                <Text style={styles.sliderValue}>
                  {formatValue(value, param.step)}
                  {param.unit ? ` ${param.unit}` : ''}
                </Text>
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={param.min}
                maximumValue={param.max}
                step={param.step}
                value={value}
                minimumTrackTintColor={AvTheme.accent}
                maximumTrackTintColor={AvTheme.line}
                thumbTintColor={AvTheme.accent}
                onValueChange={(next) => setParam(param.id, next, param.min, param.max)}
              />
            </View>
          );
        })}
      </View>

      {extraControls}
    </View>
  );
}

export function paramDefaults(params: DemoParam[]): Record<string, number> {
  const values: Record<string, number> = {};
  for (const param of params) {
    values[param.id] = param.defaultValue;
  }
  return values;
}

function formatValue(value: number, step: number): string {
  if (Number.isInteger(step) && Number.isInteger(value)) {
    return String(value);
  }
  const decimals = Math.min(3, Math.max(0, String(step).split('.')[1]?.length ?? 0));
  return value.toFixed(decimals);
}

const styles = StyleSheet.create({
  stage: {
    alignSelf: 'stretch',
    backgroundColor: AvTheme.bgRaise,
    borderColor: AvTheme.line,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  stageHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kicker: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: AvTheme.teal,
  },
  lamps: {
    flexDirection: 'row',
    gap: 4,
  },
  lamp: {
    width: 18,
    height: 8,
    backgroundColor: '#2a2e22',
  },
  lampOn: {
    backgroundColor: AvTheme.accent,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    color: AvTheme.muted,
  },
  canvas: {
    backgroundColor: AvTheme.canvas,
    borderColor: '#2a2e22',
    borderWidth: 1,
    padding: 10,
    gap: 10,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionPrimary: {
    backgroundColor: AvTheme.accent,
    borderColor: AvTheme.accent,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  actionPrimaryText: {
    color: AvTheme.accentInk,
    fontWeight: '700',
    fontSize: 14,
  },
  actionGhost: {
    borderColor: AvTheme.line,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  actionGhostText: {
    color: AvTheme.ink,
    fontSize: 14,
  },
  hint: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    lineHeight: 17,
    color: AvTheme.teal,
  },
  sliders: {
    gap: 10,
  },
  sliderRow: {
    gap: 4,
  },
  sliderLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: AvTheme.muted,
  },
  sliderValue: {
    color: AvTheme.ink,
    fontVariant: ['tabular-nums'],
  },
  slider: {
    width: '100%',
    height: 36,
  },
});
