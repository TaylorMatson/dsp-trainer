import type { ModuleContent } from '@/content/schema';
import { isModuleReady } from '@/content/schema';

export type { ModuleContent } from '@/content/schema';
export { isModuleReady };

export const MODULES: ModuleContent[] = [
  {
    id: 'sampling-aliasing',
    title: 'Sampling & Aliasing',
    order: 1,
    estimatedMinutes: 15,
    status: 'ready',
    summary:
      'Learn how sample rate and Nyquist frequency decide what you can capture — and hear what happens when you undersample.',
    lessons: [
      {
        id: 'sampling-basics',
        title: 'Sampling, sample rate, and Nyquist',
        blocks: [
          {
            type: 'paragraph',
            text: 'A continuous sound is a smooth curve of pressure over time. To store or process it digitally, we sample — take amplitude snapshots at a fixed rate.',
          },
          {
            type: 'paragraph',
            text: 'Sample rate (fs) is how many snapshots we take per second, measured in hertz. CD audio uses 44,100 Hz; many music apps use 48,000 Hz.',
          },
          {
            type: 'callout',
            text: 'Nyquist frequency = fs / 2. It is the highest frequency you can represent without aliasing at that sample rate.',
          },
          {
            type: 'paragraph',
            text: 'If a tone sits below Nyquist, samples can reconstruct it. If it sits at or above Nyquist, the samples look like a different, lower frequency — an alias.',
          },
        ],
      },
    ],
    demos: [
      {
        id: 'aliasing-visual',
        title: 'See aliasing',
        summary:
          'Raise the tone frequency relative to sample rate and watch the reconstructed wave fold into a lower alias.',
        componentId: 'aliasing-visualizer',
        params: [
          {
            id: 'frequencyHz',
            label: 'Tone frequency',
            min: 100,
            max: 900,
            step: 50,
            defaultValue: 200,
            unit: 'Hz',
          },
          {
            id: 'sampleRateHz',
            label: 'Sample rate',
            min: 400,
            max: 2000,
            step: 100,
            defaultValue: 1000,
            unit: 'Hz',
          },
        ],
      },
    ],
    practice: {
      id: 'sampling-check',
      title: 'Sampling check',
      passScore: 2,
      challenges: [
        {
          id: 'nyquist-def',
          prompt: 'At fs = 48 kHz, what is the Nyquist frequency?',
          kind: 'multipleChoice',
          choices: ['24 kHz', '48 kHz', '96 kHz', '12 kHz'],
          correctIndex: 0,
          explanation: 'Nyquist is always half the sample rate: 48,000 / 2 = 24,000 Hz.',
        },
        {
          id: 'alias-when',
          prompt: 'When does aliasing appear for a pure sine?',
          kind: 'multipleChoice',
          choices: [
            'Only when amplitude is too loud',
            'When its frequency is at or above Nyquist',
            'Only on odd sample counts',
            'Never for digital audio',
          ],
          correctIndex: 1,
          explanation:
            'Frequencies at or above fs/2 cannot be uniquely represented; samples match a lower folded frequency.',
        },
        {
          id: 'alias-fold',
          prompt: 'A 900 Hz sine sampled at 1,000 Hz most closely aliases near which frequency?',
          kind: 'multipleChoice',
          choices: ['900 Hz', '100 Hz', '500 Hz', '1,800 Hz'],
          correctIndex: 1,
          explanation:
            'Nyquist is 500 Hz. 900 Hz folds to |900 − 1,000| = 100 Hz inside the baseband.',
        },
      ],
    },
  },
];

export function getModuleById(id: string): ModuleContent | undefined {
  return MODULES.find((module) => module.id === id);
}

export function listReadyModules(): ModuleContent[] {
  return MODULES.filter(isModuleReady);
}
