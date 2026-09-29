import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
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
  const scrollRef = useRef<ScrollView>(null);

  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    practice ? practice.challenges.map(() => null) : [],
  );
  const [submitted, setSubmitted] = useState(false);
  const [resultScore, setResultScore] = useState<number | null>(null);
  const [resultPassed, setResultPassed] = useState(false);

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

  const liveScore = scorePractice(answers, correctIndexes);
  const allAnswered = answers.every((a) => a !== null);
  const displayScore = resultScore ?? liveScore;
  const displayPassed = resultScore !== null ? resultPassed : liveScore >= practice.passScore;

  const submit = () => {
    const score = scorePractice(answers, correctIndexes);
    const passed = score >= practice.passScore;
    setResultScore(score);
    setResultPassed(passed);
    setSubmitted(true);
    void recordPractice(module.id, score, passed);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const retry = () => {
    setSubmitted(false);
    setResultScore(null);
    setResultPassed(false);
    setAnswers(practice.challenges.map(() => null));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <>
      <Stack.Screen options={{ title: practice.title }} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{practice.title}</Text>
        <Text style={styles.caption}>
          Pass with {practice.passScore} of {practice.challenges.length} correct.
        </Text>

        {submitted ? (
          <View style={styles.scoreBanner} testID="practice-score-banner">
            <Text style={styles.scoreBannerTitle}>
              Score {displayScore}/{practice.challenges.length}
            </Text>
            <Text style={styles.scoreBannerStatus}>
              {displayPassed ? 'Passed — nice work.' : 'Not yet — review and retry.'}
            </Text>
            {displayPassed ? (
              <Link href={`/module/${module.id}`} style={styles.link}>
                Back to module ✓
              </Link>
            ) : (
              <Pressable
                accessibilityRole="button"
                style={styles.secondary}
                onPress={retry}
                testID="practice-retry">
                <Text style={styles.secondaryText}>Retry</Text>
              </Pressable>
            )}
          </View>
        ) : null}

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
                    accessibilityRole="button"
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
            accessibilityRole="button"
            testID="practice-check-answers"
            style={[styles.primary, !allAnswered && styles.primaryDisabled]}
            disabled={!allAnswered}
            onPress={submit}>
            <Text style={styles.primaryText}>Check answers</Text>
          </Pressable>
        ) : (
          <View style={styles.result}>
            <Text style={styles.resultTitle}>
              Score {displayScore}/{practice.challenges.length}{' '}
              {displayPassed ? '— passed' : '— try again'}
            </Text>
            {!displayPassed ? (
              <Pressable
                accessibilityRole="button"
                style={styles.secondary}
                onPress={retry}>
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
  scoreBanner: {
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(27, 108, 168, 0.14)',
  },
  scoreBannerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scoreBannerStatus: {
    fontSize: 15,
    lineHeight: 20,
    opacity: 0.85,
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
