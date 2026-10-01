import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AvTheme } from '@/constants/AvTheme';
import {
  checkSignalChainOrder,
  CODING_CHALLENGES,
  type CodingChallenge,
} from '@/content/codingChallenges';

/**
 * Coding-lab MVP (signal-chain order check). Replaces the old sine smoke tab.
 * Full sandboxed code judge is out of scope for this PR — see port plan §6.
 */
export default function LabScreen() {
  const challenge = CODING_CHALLENGES[0]!;
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>LAB</Text>
      <Text style={styles.title}>Coding lab</Text>
      <Text style={styles.caption}>
        Build the demo’s signal chain in order — an audible tone, then resample,
        then play. App checks your graph; full code-judge later.
      </Text>
      <SignalChainChallenge challenge={challenge} />
    </ScrollView>
  );
}

function SignalChainChallenge({ challenge }: { challenge: CodingChallenge }) {
  const [built, setBuilt] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [passed, setPassed] = useState(false);

  const remaining = useMemo(
    () => challenge.pool.filter((node) => !built.includes(node.id)),
    [challenge.pool, built],
  );

  const labelFor = (id: string) =>
    challenge.pool.find((node) => node.id === id)?.label ?? id;

  const add = (id: string) => {
    setChecked(false);
    setPassed(false);
    setBuilt((prev) => [...prev, id]);
  };

  const undo = () => {
    setChecked(false);
    setPassed(false);
    setBuilt((prev) => prev.slice(0, -1));
  };

  const reset = () => {
    setBuilt([]);
    setChecked(false);
    setPassed(false);
  };

  const check = () => {
    const ok = checkSignalChainOrder(challenge.expectedOrder, built);
    setPassed(ok);
    setChecked(true);
  };

  return (
    <View style={styles.card} testID="coding-lab-challenge">
      <Text style={styles.cardTitle}>{challenge.title}</Text>
      <Text style={styles.body}>{challenge.prompt}</Text>

      <Text style={styles.section}>Your chain</Text>
      {built.length === 0 ? (
        <Text style={styles.muted}>Tap nodes below to append steps.</Text>
      ) : (
        built.map((id, index) => (
          <Text key={`${id}-${index}`} style={styles.step}>
            {index + 1}. {labelFor(id)}
          </Text>
        ))
      )}

      <Text style={styles.section}>Available nodes</Text>
      <View style={styles.row}>
        {remaining.map((node) => (
          <Pressable
            key={node.id}
            accessibilityRole="button"
            onPress={() => add(node.id)}
            style={styles.chip}
            testID={`lab-node-${node.id}`}>
            <Text style={styles.chipText}>{node.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          onPress={undo}
          disabled={built.length === 0}
          style={[styles.ghost, built.length === 0 && styles.disabled]}>
          <Text style={styles.ghostText}>Undo</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={reset} style={styles.ghost}>
          <Text style={styles.ghostText}>Reset</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={check}
          style={styles.primary}
          testID="lab-check">
          <Text style={styles.primaryText}>Check chain</Text>
        </Pressable>
      </View>

      {checked ? (
        <Text
          style={passed ? styles.pass : styles.fail}
          testID="lab-result">
          {passed ? challenge.successExplanation : challenge.failHint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: AvTheme.bg,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 14,
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
    lineHeight: 20,
    color: AvTheme.muted,
  },
  card: {
    gap: 10,
    padding: 14,
    backgroundColor: AvTheme.bgRaise,
    borderColor: AvTheme.line,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AvTheme.ink,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: AvTheme.ink,
  },
  section: {
    marginTop: 6,
    fontFamily: 'SpaceMono',
    fontSize: 12,
    letterSpacing: 1.1,
    color: AvTheme.teal,
  },
  muted: {
    fontSize: 14,
    color: AvTheme.muted,
  },
  step: {
    fontSize: 15,
    color: AvTheme.ink,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    borderColor: AvTheme.line,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  chipText: {
    fontWeight: '600',
    color: AvTheme.ink,
    fontSize: 13,
  },
  ghost: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    borderColor: AvTheme.line,
    borderWidth: 1,
  },
  ghostText: {
    color: AvTheme.ink,
    fontWeight: '600',
  },
  primary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: AvTheme.accent,
    borderColor: AvTheme.accent,
    borderWidth: 1,
  },
  primaryText: {
    color: AvTheme.accentInk,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.4,
  },
  pass: {
    fontSize: 14,
    lineHeight: 20,
    color: AvTheme.success,
    fontWeight: '600',
  },
  fail: {
    fontSize: 14,
    lineHeight: 20,
    color: AvTheme.warn,
    fontWeight: '600',
  },
});
