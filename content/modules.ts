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
        title: 'See & hear aliasing',
        summary:
          'Raise the tone frequency relative to sample rate, watch the wave fold, and hear the aliased pitch.',
        componentId: 'aliasing-visualizer',
        audio: { mode: 'continuous' },
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
  {
    id: 'discrete-sine',
    title: 'Discrete Signals & Sine',
    order: 2,
    estimatedMinutes: 12,
    status: 'ready',
    summary:
      'Build intuition for discrete-time sequences and how a digital sine is generated sample by sample.',
    lessons: [
      {
        id: 'discrete-basics',
        title: 'Samples, index n, and digital sines',
        blocks: [
          {
            type: 'paragraph',
            text: 'A discrete signal is a list of numbers x[n], one amplitude per sample index n. Time between samples is 1/fs seconds.',
          },
          {
            type: 'paragraph',
            text: 'A digital sine is computed as x[n] = A · sin(2π · f · n / fs + φ). Frequency f, amplitude A, and phase φ are just parameters in that formula.',
          },
          {
            type: 'callout',
            text: 'Changing f stretches or compresses the wave across sample indices. Changing A scales height. Phase slides the wave left or right.',
          },
        ],
      },
    ],
    demos: [
      {
        id: 'sine-gen',
        title: 'Generate a sine',
        summary:
          'Adjust frequency and amplitude — watch the discrete waveform and hear the matching tone.',
        componentId: 'sine-generator',
        audio: { mode: 'continuous' },
        params: [
          {
            id: 'frequencyHz',
            label: 'Frequency',
            min: 50,
            max: 600,
            step: 25,
            defaultValue: 220,
            unit: 'Hz',
          },
          {
            id: 'amplitude',
            label: 'Amplitude',
            min: 0.2,
            max: 1,
            step: 0.1,
            defaultValue: 1,
          },
          {
            id: 'sampleRateHz',
            label: 'Sample rate',
            min: 1000,
            max: 4000,
            step: 500,
            defaultValue: 2000,
            unit: 'Hz',
          },
        ],
      },
    ],
    practice: {
      id: 'discrete-check',
      title: 'Discrete sine check',
      passScore: 2,
      challenges: [
        {
          id: 'what-is-xn',
          prompt: 'What is x[n] in a discrete signal?',
          kind: 'multipleChoice',
          choices: [
            'The continuous pressure wave',
            'The amplitude at sample index n',
            'Always the sample rate',
            'Only the phase offset',
          ],
          correctIndex: 1,
          explanation: 'x[n] is the nth sample value — one number per discrete time index.',
        },
        {
          id: 'sine-formula',
          prompt: 'In x[n] = A·sin(2π f n / fs), what does raising f do?',
          kind: 'multipleChoice',
          choices: [
            'Lowers amplitude only',
            'Makes fewer cycles in the same samples',
            'Makes more cycles across the same samples',
            'Changes sample rate',
          ],
          correctIndex: 2,
          explanation: 'Higher f advances phase faster per sample, packing more cycles into the buffer.',
        },
        {
          id: 'amplitude-role',
          prompt: 'What does amplitude A control?',
          kind: 'multipleChoice',
          choices: [
            'Peak height of the sine',
            'Sample rate fs',
            'Nyquist frequency only',
            'FFT bin count',
          ],
          correctIndex: 0,
          explanation: 'A scales sample values; the wave shape and frequency stay the same.',
        },
      ],
    },
  },
  {
    id: 'frequency-domain',
    title: 'Time vs Frequency',
    order: 3,
    estimatedMinutes: 15,
    status: 'ready',
    summary:
      'Meet the FFT: see a sine in time and as a peak on the magnitude spectrum.',
    lessons: [
      {
        id: 'fft-intro',
        title: 'FFT intro and reading magnitude',
        blocks: [
          {
            type: 'paragraph',
            text: 'The time domain plots amplitude versus sample index. The frequency domain asks: which tones are present, and how strong?',
          },
          {
            type: 'paragraph',
            text: 'A Fast Fourier Transform (FFT) turns a block of samples into bins. Each bin covers a narrow band of frequencies.',
          },
          {
            type: 'callout',
            text: 'Bin frequency ≈ k · fs / N. For a pure sine that lands on a bin, the magnitude spectrum shows one clear peak (plus a mirror above Nyquist we usually hide).',
          },
          {
            type: 'paragraph',
            text: 'Reading a spectrum: find the tallest peak, convert its bin index to hertz, and that is the tone you are hearing in the buffer.',
          },
        ],
      },
    ],
    demos: [
      {
        id: 'spectrum-demo',
        title: 'Time and spectrum',
        summary:
          'Change the tone frequency and watch the waveform and magnitude peak move together while you listen.',
        componentId: 'spectrum-visualizer',
        audio: { mode: 'continuous' },
        params: [
          {
            id: 'frequencyHz',
            label: 'Tone frequency',
            min: 4,
            max: 40,
            step: 2,
            defaultValue: 16,
            unit: 'Hz',
          },
          {
            id: 'sampleRateHz',
            label: 'Sample rate',
            min: 64,
            max: 256,
            step: 64,
            defaultValue: 128,
            unit: 'Hz',
          },
        ],
      },
    ],
    practice: {
      id: 'spectrum-check',
      title: 'Spectrum check',
      passScore: 2,
      challenges: [
        {
          id: 'fft-role',
          prompt: 'What does an FFT mainly help you see?',
          kind: 'multipleChoice',
          choices: [
            'Which frequencies are present in a buffer',
            'The microphone brand',
            'Only the sample rate setting',
            'Loudness of the App Store listing',
          ],
          correctIndex: 0,
          explanation: 'The FFT reveals the frequency content of a block of samples.',
        },
        {
          id: 'bin-freq',
          prompt: 'With fs = 128 Hz and N = 128, what frequency is bin k = 16?',
          kind: 'multipleChoice',
          choices: ['1 Hz', '8 Hz', '16 Hz', '32 Hz'],
          correctIndex: 2,
          explanation: 'f = k · fs / N = 16 · 128 / 128 = 16 Hz.',
        },
        {
          id: 'read-peak',
          prompt: 'A magnitude spectrum of a pure sine shows one tall peak. What does that peak tell you?',
          kind: 'multipleChoice',
          choices: [
            'The noise floor only',
            'The tone frequency (and relative strength)',
            'That aliasing is impossible',
            'That the signal is empty',
          ],
          correctIndex: 1,
          explanation: 'Peak location ≈ frequency; peak height relates to amplitude / energy.',
        },
      ],
    },
  },
  {
    id: 'windowing',
    title: 'Windowing & Leakage',
    order: 4,
    estimatedMinutes: 12,
    status: 'ready',
    summary:
      'See spectral leakage when a sine does not fit the FFT frame — and how a Hann window tames it.',
    lessons: [
      {
        id: 'window-basics',
        title: 'Why windows exist',
        blocks: [
          {
            type: 'paragraph',
            text: 'An FFT assumes the buffer is one period of a repeating loop. If your sine does not land on an integer number of cycles, the wrap-around jump sprays energy into neighboring bins — leakage.',
          },
          {
            type: 'paragraph',
            text: 'A window tapers the buffer ends toward zero before the FFT, softening that discontinuity.',
          },
          {
            type: 'callout',
            text: 'Rectangular (no taper) leaks more. Hann reduces side lobes but slightly widens the main peak. Trade sharpness for cleaner skirts.',
          },
        ],
      },
    ],
    demos: [
      {
        id: 'window-demo',
        title: 'Leakage vs Hann',
        summary:
          'Hear the tone, use a non-integer cycle count, then switch Rectangular ↔ Hann and watch side energy drop.',
        componentId: 'windowing-visualizer',
        audio: { mode: 'continuous' },
        params: [
          {
            id: 'frequencyHz',
            label: 'Tone frequency',
            min: 10,
            max: 30,
            step: 0.5,
            defaultValue: 17.5,
            unit: 'Hz',
          },
          {
            id: 'sampleRateHz',
            label: 'Sample rate',
            min: 128,
            max: 128,
            step: 1,
            defaultValue: 128,
            unit: 'Hz',
          },
        ],
      },
    ],
    practice: {
      id: 'window-check',
      title: 'Windowing check',
      passScore: 2,
      challenges: [
        {
          id: 'leakage-cause',
          prompt: 'Spectral leakage is worst when…',
          kind: 'multipleChoice',
          choices: [
            'Amplitude is exactly 1',
            'The sine does not complete an integer number of cycles in the FFT frame',
            'Sample rate is even',
            'You use a Hann window',
          ],
          correctIndex: 1,
          explanation: 'A wrap-around discontinuity spreads energy across bins.',
        },
        {
          id: 'hann-effect',
          prompt: 'Compared with a rectangular window, a Hann window typically…',
          kind: 'multipleChoice',
          choices: [
            'Increases side-lobe leakage',
            'Removes the need for sample rate',
            'Reduces side lobes (with a wider main lobe)',
            'Turns the signal into noise',
          ],
          correctIndex: 2,
          explanation: 'Tapering cuts discontinuous edges; the main peak broadens a little.',
        },
        {
          id: 'when-window',
          prompt: 'When is windowing most helpful before an FFT?',
          kind: 'multipleChoice',
          choices: [
            'Only for DC offsets',
            'When analyzing short arbitrary frames of audio',
            'Only after store submission',
            'Never for pure tones on bin centers',
          ],
          correctIndex: 1,
          explanation: 'Real frames rarely contain exact integer cycles; windows are the default habit.',
        },
      ],
    },
  },
  {
    id: 'fir-iir-filters',
    title: 'FIR vs IIR Filters',
    order: 5,
    estimatedMinutes: 15,
    status: 'ready',
    summary:
      'Compare FIR and IIR ideas, then run simple lowpass and highpass demos on a mixed tone.',
    lessons: [
      {
        id: 'filter-basics',
        title: 'FIR, IIR, lowpass, highpass',
        blocks: [
          {
            type: 'paragraph',
            text: 'A filter reshapes a signal’s spectrum. Lowpass keeps slow (low-frequency) motion; highpass keeps rapid changes.',
          },
          {
            type: 'paragraph',
            text: 'FIR (finite impulse response) filters are weighted sums of recent input samples only. IIR (infinite impulse response) filters also feed past outputs back in — often cheaper, with longer “memory.”',
          },
          {
            type: 'callout',
            text: 'Teaching demos here: FIR moving-average lowpass / first-difference highpass, and a one-pole IIR smoother (and its highpass complement).',
          },
        ],
      },
    ],
    demos: [
      {
        id: 'filter-demo',
        title: 'LP / HP playground',
        summary:
          'Mix a low and high sine, then toggle FIR/IIR and lowpass/highpass — hear and see what survives.',
        componentId: 'filter-visualizer',
        audio: { mode: 'continuous' },
        params: [
          {
            id: 'lowHz',
            label: 'Low tone',
            min: 2,
            max: 10,
            step: 1,
            defaultValue: 4,
            unit: 'Hz',
          },
          {
            id: 'highHz',
            label: 'High tone',
            min: 16,
            max: 48,
            step: 4,
            defaultValue: 32,
            unit: 'Hz',
          },
          {
            id: 'strength',
            label: 'Strength (taps or α)',
            min: 0.05,
            max: 9,
            step: 0.05,
            defaultValue: 5,
          },
        ],
      },
    ],
    practice: {
      id: 'filter-check',
      title: 'Filter check',
      passScore: 2,
      challenges: [
        {
          id: 'lp-keeps',
          prompt: 'A lowpass filter tends to keep…',
          kind: 'multipleChoice',
          choices: [
            'Only the highest harmonics',
            'Slow / low-frequency content',
            'Only DC from a phone mic',
            'Random noise exclusively',
          ],
          correctIndex: 1,
          explanation: 'Lowpass attenuates fast wiggles and passes slower trends.',
        },
        {
          id: 'fir-vs-iir',
          prompt: 'What is a key difference between FIR and IIR?',
          kind: 'multipleChoice',
          choices: [
            'IIR uses feedback of past outputs; FIR does not',
            'FIR requires a microphone',
            'IIR cannot lowpass',
            'FIR only works offline in Notion',
          ],
          correctIndex: 0,
          explanation: 'IIR recursion can create a long impulse response from few coefficients.',
        },
        {
          id: 'hp-effect',
          prompt: 'On a mix of a slow sine and a fast sine, a highpass should…',
          kind: 'multipleChoice',
          choices: [
            'Favor the fast sine',
            'Favor only the slow sine',
            'Delete the sample rate',
            'Always pass both unchanged',
          ],
          correctIndex: 0,
          explanation: 'Highpass attenuates the slow component relative to the rapid one.',
        },
      ],
    },
  },
  {
    id: 'convolution-intro',
    title: 'Convolution Intro',
    order: 6,
    estimatedMinutes: 12,
    status: 'ready',
    summary:
      'Treat filtering as mixing a signal with an impulse response — convolution in discrete time.',
    lessons: [
      {
        id: 'conv-basics',
        title: 'Impulse responses and mixing',
        blocks: [
          {
            type: 'paragraph',
            text: 'An impulse is a single “click.” How a system responds to that click is its impulse response (IR).',
          },
          {
            type: 'paragraph',
            text: 'Convolution slides the IR across the input, scaling and summing copies. That is how linear time-invariant filters “mix” memory into a signal.',
          },
          {
            type: 'callout',
            text: 'A unit impulse IR leaves the signal unchanged. An echo IR is “1 at 0, plus a quieter tap later” — convolution paints a delayed copy onto the output.',
          },
        ],
      },
    ],
    demos: [
      {
        id: 'conv-demo',
        title: 'Echo by convolution',
        summary:
          'Play a short burst through a unit impulse or echo kernel — hear the delayed tap and compare plots.',
        componentId: 'convolution-visualizer',
        audio: { mode: 'oneshot' },
        params: [
          {
            id: 'useEcho',
            label: 'Use echo (0=impulse, 1=echo)',
            min: 0,
            max: 1,
            step: 1,
            defaultValue: 1,
          },
          {
            id: 'delaySamples',
            label: 'Echo delay',
            min: 4,
            max: 20,
            step: 2,
            defaultValue: 8,
            unit: 'samples',
          },
          {
            id: 'decay',
            label: 'Echo decay',
            min: 0.2,
            max: 0.9,
            step: 0.1,
            defaultValue: 0.5,
          },
        ],
      },
    ],
    practice: {
      id: 'conv-check',
      title: 'Convolution check',
      passScore: 2,
      challenges: [
        {
          id: 'ir-meaning',
          prompt: 'An impulse response is…',
          kind: 'multipleChoice',
          choices: [
            'How a system answers a single click',
            'The App Store privacy form',
            'Only the sample rate',
            'A type of window function',
          ],
          correctIndex: 0,
          explanation: 'The IR fully describes an LTI system’s time behavior.',
        },
        {
          id: 'impulse-identity',
          prompt: 'Convolving with a unit impulse…',
          kind: 'multipleChoice',
          choices: [
            'Deletes the signal',
            'Leaves the signal unchanged',
            'Always lowpasses',
            'Doubles the sample rate',
          ],
          correctIndex: 1,
          explanation: 'The impulse is the identity element for convolution.',
        },
        {
          id: 'echo-ir',
          prompt: 'An echo IR adds…',
          kind: 'multipleChoice',
          choices: [
            'A delayed, usually quieter copy of the input',
            'Only DC offset',
            'Random FFT bins',
            'A new Nyquist limit',
          ],
          correctIndex: 0,
          explanation: 'A second tap at delay D with gain g creates that delayed copy.',
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
