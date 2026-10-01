import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AvTheme } from '@/constants/AvTheme';
import type { DemoParam } from '@/content/schema';

type DemoParamControlsProps = {
  params: DemoParam[];
  values: Record<string, number>;
  onBump: (paramId: string, delta: number, min: number, max: number) => void;
};

export function DemoParamControls({
  params,
  values,
  onBump,
}: DemoParamControlsProps) {
  return (
    <>
      {params.map((param) => {
        const value = values[param.id] ?? param.defaultValue;
        return (
          <View key={param.id} style={styles.paramRow}>
            <Text style={styles.paramLabel}>
              {param.label}: {formatValue(value, param.step)}
              {param.unit ? ` ${param.unit}` : ''}
            </Text>
            <View style={styles.paramButtons}>
              <Pressable
                accessibilityRole="button"
                onPress={() => onBump(param.id, -param.step, param.min, param.max)}
                style={styles.chip}>
                <Text style={styles.chipText}>−</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => onBump(param.id, param.step, param.min, param.max)}
                style={styles.chip}>
                <Text style={styles.chipText}>+</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </>
  );
}

export function paramDefaults(params: DemoParam[]): Record<string, number> {
  const values: Record<string, number> = {};
  for (const param of params) {
    values[param.id] = param.defaultValue;
  }
  return values;
}

export function bumpParam(
  prev: Record<string, number>,
  paramId: string,
  delta: number,
  min: number,
  max: number,
): Record<string, number> {
  const next = Math.min(max, Math.max(min, (prev[paramId] ?? min) + delta));
  return { ...prev, [paramId]: next };
}

function formatValue(value: number, step: number): string {
  if (Number.isInteger(step) && Number.isInteger(value)) {
    return String(value);
  }
  const decimals = Math.min(3, Math.max(0, String(step).split('.')[1]?.length ?? 0));
  return value.toFixed(decimals);
}

const styles = StyleSheet.create({
  paramRow: {
    alignSelf: 'stretch',
    gap: 8,
  },
  paramLabel: {
    fontSize: 15,
    color: AvTheme.ink,
  },
  paramButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    borderColor: AvTheme.line,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  chipText: {
    fontWeight: '700',
    fontSize: 16,
    color: AvTheme.ink,
  },
});
