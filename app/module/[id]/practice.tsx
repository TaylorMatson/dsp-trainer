import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { getModuleById } from '@/content/modules';
import { useProgress } from '@/progress/ProgressContext';
import { scorePractice } from '@/progress/types';

export default function ModulePracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const module = getModuleById(id ?? '');
  const practice = module?.practice;
  const { recordPractice } = useProgress();

  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    practice ? practice.challenges.map(() => null) : [],
  );
  const [submitted, setSubmitted] = useState(false);

  const correctIndexes = useMemo(
    () => practice?.challenges.map((c) => c.correctIndex) ?? [],
    [practice],
  );

  if (!module || !practice) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Practice unavailable</Text>
      </View>
    );
  }

  const score = scorePractice(answers, correctIndexes);
  const passed = score >= practice.passScore;
  const allAnswered = answers.every((a) => a !== null);

  const submit = () => {
    setSubmitted(true);
    void recordPractice(module.id, score, passed);
  };

  return (
    <>
      <Stack.Screen options={{ title: practice.title }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{practice.title}</Text>
        <Text style={styles.caption}>
          Pass with {practice.passScore} of {practice.challenges.length} correct.
        </Text>

        {practice.challenges.map((challenge, index) => (
          <View key={challenge.id} style={styles.card}>
            <Text style={styles.prompt}>
              {index + 1}. {challenge.prompt}
            </Text>
            {challenge.kind === 'multipleChoice' ? (
              challenge.choices.map((choice, choiceIndex) => {
                const selected = answers[index] === choiceIndex;
                const showResult = submitted;
                const isCorrect = choiceIndex === challenge.correctIndex;
                return (
                  <Pressable
                    key={choice}
                    disabled={submitted}
                    onPress={() => {
                      setAnswers((prev) => {
                        const next = [...prev];
                        next[index] = choiceIndex;
                        return next;
                      });
                    }}
                    style={[
                      styles.choice,
                      selected && styles.choiceSelected,
                      showResult && isCorrect && styles.choiceCorrect,
                      showResult && selected && !isCorrect && styles.choiceWrong,
                    ]}>
                    <Text style={styles.choiceText}>{choice}</Text>
                  </Pressable>
                );
              })
            ) : (
              (() => {
                const _exhaustive: never = challenge.kind;
                return _exhaustive;
              })()
            )}
            {submitted ? (
              <Text style={styles.explanation}>{challenge.explanation}</Text>
            ) : null}
          </View>
        ))}

        {!submitted ? (
          <Pressable
            style={[styles.primary, !allAnswered && styles.primaryDisabled]}
            disabled={!allAnswered}
            onPress={submit}>
            <Text style={styles.primaryText}>Check answers</Text>
          </Pressable>
        ) : (
          <View style={styles.result}>
            <Text style={styles.resultTitle}>
              Score {score}/{practice.challenges.length}{' '}
              {passed ? '— passed' : '— try again'}
            </Text>
            {!passed ? (
              <Pressable
                style={styles.secondary}
                onPress={() => {
                  setSubmitted(false);
                  setAnswers(practice.challenges.map(() => null));
                }}>
                <Text style={styles.secondaryText}>Retry</Text>
              </Pressable>
            ) : (
              <Link href={`/module/${module.id}`} style={styles.link}>
                Back to module ✓
              </Link>
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  caption: {
    fontSize: 14,
    opacity: 0.7,
  },
  card: {
    gap: 8,
    paddingBottom: 8,
  },
  prompt: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  choice: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(27, 108, 168, 0.1)',
  },
  choiceSelected: {
    backgroundColor: 'rgba(27, 108, 168, 0.28)',
  },
  choiceCorrect: {
    backgroundColor: 'rgba(34, 140, 80, 0.28)',
  },
  choiceWrong: {
    backgroundColor: 'rgba(180, 60, 60, 0.22)',
  },
  choiceText: {
    fontSize: 15,
  },
  explanation: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.75,
    marginTop: 4,
  },
  primary: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#1B6CA8',
    alignItems: 'center',
  },
  primaryDisabled: {
    opacity: 0.45,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  result: {
    gap: 10,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  secondary: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(27, 108, 168, 0.15)',
    alignSelf: 'flex-start',
  },
  secondaryText: {
    fontWeight: '600',
  },
  link: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B6CA8',
  },
});
