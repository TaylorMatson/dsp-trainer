import { Link, Stack, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AvTheme } from '@/constants/AvTheme';
import { getModuleById, getNextModule } from '@/content/modules';
import { useProgress } from '@/progress/ProgressContext';
import { scorePractice } from '@/progress/types';

export default function ModulePracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const module = getModuleById(id ?? '');
  const practice = module?.practice;
  const nextModule = module ? getNextModule(module.id) : undefined;
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
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>PRACTICE</Text>
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
            <PostCheckNav
              moduleId={module.id}
              nextModuleId={nextModule?.id}
              nextModuleTitle={nextModule?.title}
              showRetry={!displayPassed}
              onRetry={retry}
            />
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
          <View style={styles.result} testID="practice-result-nav">
            <Text style={styles.resultTitle}>
              Score {displayScore}/{practice.challenges.length}{' '}
              {displayPassed ? '— passed' : '— try again'}
            </Text>
            <PostCheckNav
              moduleId={module.id}
              nextModuleId={nextModule?.id}
              nextModuleTitle={nextModule?.title}
              showRetry={!displayPassed}
              onRetry={retry}
            />
          </View>
        )}
      </ScrollView>
    </>
  );
}

function PostCheckNav({
  moduleId,
  nextModuleId,
  nextModuleTitle,
  showRetry,
  onRetry,
}: {
  moduleId: string;
  nextModuleId?: string;
  nextModuleTitle?: string;
  showRetry: boolean;
  onRetry: () => void;
}) {
  return (
    <View style={styles.navRow}>
      {showRetry ? (
        <Pressable
          accessibilityRole="button"
          style={styles.secondary}
          onPress={onRetry}
          testID="practice-retry">
          <Text style={styles.secondaryText}>Retry</Text>
        </Pressable>
      ) : null}
      {nextModuleId ? (
        <Link
          href={`/module/${nextModuleId}` as Href}
          style={styles.navPrimary}
          testID="practice-next-module">
          <Text style={styles.navPrimaryText}>
            Next module{nextModuleTitle ? `: ${nextModuleTitle}` : ''}
          </Text>
        </Link>
      ) : (
        <Link href={`/module/${moduleId}` as Href} style={styles.navPrimary} testID="practice-back-module">
          <Text style={styles.navPrimaryText}>Back to module ✓</Text>
        </Link>
      )}
      <Link href={'/' as Href} style={styles.link} testID="practice-back-menu">
        Back to menu
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: AvTheme.bg,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 16,
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
  scoreBanner: {
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: AvTheme.bgRaise,
    borderColor: AvTheme.line,
    borderWidth: 1,
  },
  scoreBannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AvTheme.ink,
  },
  scoreBannerStatus: {
    fontSize: 15,
    lineHeight: 20,
    color: AvTheme.muted,
  },
  card: {
    gap: 8,
    paddingBottom: 8,
  },
  prompt: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    color: AvTheme.ink,
  },
  choice: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: AvTheme.bgRaise,
    borderColor: AvTheme.line,
    borderWidth: 1,
  },
  choiceSelected: {
    borderColor: AvTheme.accent,
    backgroundColor: AvTheme.accentFill,
  },
  choiceCorrect: {
    borderColor: AvTheme.success,
    backgroundColor: AvTheme.successFill,
  },
  choiceWrong: {
    borderColor: AvTheme.danger,
    backgroundColor: AvTheme.dangerFill,
  },
  choiceText: {
    fontSize: 15,
    color: AvTheme.ink,
  },
  explanation: {
    fontSize: 13,
    lineHeight: 18,
    color: AvTheme.muted,
    marginTop: 4,
  },
  primary: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: AvTheme.accent,
    backgroundColor: AvTheme.accent,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  primaryDisabled: {
    opacity: 0.45,
  },
  primaryText: {
    color: AvTheme.accentInk,
    fontWeight: '700',
    fontSize: 16,
  },
  result: {
    gap: 10,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AvTheme.ink,
  },
  navRow: {
    gap: 10,
    marginTop: 4,
  },
  secondary: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: AvTheme.line,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryText: {
    fontWeight: '600',
    color: AvTheme.ink,
  },
  navPrimary: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: AvTheme.accent,
    backgroundColor: AvTheme.accent,
    alignSelf: 'stretch',
    minHeight: 44,
    justifyContent: 'center',
  },
  navPrimaryText: {
    color: AvTheme.accentInk,
    fontWeight: '700',
    fontSize: 15,
  },
  link: {
    fontSize: 16,
    fontWeight: '600',
    color: AvTheme.accent,
  },
});
