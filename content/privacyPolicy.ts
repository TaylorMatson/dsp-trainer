/**
 * Offline privacy policy stub mirrored from assets/legal/privacy-policy.md.
 * Keep both in sync when editing. Hosted URL remains a Taylor P5 task.
 */
export const PRIVACY_POLICY_TITLE = 'Privacy Policy';

export const PRIVACY_POLICY_SECTIONS: { heading: string; body: string }[] = [
  {
    heading: 'Status',
    body: 'Placeholder for TestFlight / Play internal testing. Replace with a hosted URL before public store submit (P5 · Taylor gate). Last updated: 2026-09-29.',
  },
  {
    heading: 'Summary',
    body: 'DSP Trainer is offline-first. v1 has no accounts, no cloud sync, no analytics or ads SDKs, and no microphone access. Progress stays on your device.',
  },
  {
    heading: 'Data we collect',
    body: 'The current v1 build does not collect personal information, contact details, precise location, or usage analytics. Local progress (module completion and practice scores) uses on-device storage. Clear app data or use Reset local progress in Settings to remove it.',
  },
  {
    heading: 'Third parties',
    body: 'We do not sell or share learner data with third parties in v1. Installing via EAS, Apple TestFlight, or Google Play internal testing may be subject to those platforms’ own terms.',
  },
  {
    heading: 'Children’s privacy',
    body: 'The app is intended for audio / music-tech learners. We do not knowingly collect personal information from children.',
  },
  {
    heading: 'Contact',
    body: 'Questions about this stub: contact the project owner (Taylor) via the repository or the App Store / Play Console support email once configured.',
  },
  {
    heading: 'Changes',
    body: 'When a real policy is hosted, Settings can link to that URL. Until then, this in-app stub is the source of truth and works offline.',
  },
];
