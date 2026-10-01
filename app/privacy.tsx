import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { AvTheme } from '@/constants/AvTheme';
import {
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_TITLE,
} from '@/content/privacyPolicy';

export default function PrivacyScreen() {
  return (
    <>
      <Stack.Screen options={{ title: PRIVACY_POLICY_TITLE }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        accessibilityRole="scrollbar">
        <Text style={styles.kicker}>LEGAL</Text>
        <Text style={styles.title}>{PRIVACY_POLICY_TITLE}</Text>
        <Text style={styles.eyebrow}>Offline stub · works without network</Text>
        {PRIVACY_POLICY_SECTIONS.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: AvTheme.bg,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
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
  eyebrow: {
    fontSize: 13,
    color: AvTheme.muted,
    marginBottom: 4,
  },
  section: {
    gap: 6,
    backgroundColor: 'transparent',
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: AvTheme.ink,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: AvTheme.muted,
  },
});
