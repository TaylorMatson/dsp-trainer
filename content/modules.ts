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
            text: 'A continuous sound is a smooth curve of air pressure over time — think of a guitar string’s motion drawn as a wavy line. Digital audio cannot store that infinite curve. Instead we sample: take amplitude snapshots at evenly spaced moments and keep only those numbers.',
          },
          {
            type: 'paragraph',
            text: 'Sample rate fs (hertz) is how many snapshots we take per second. Compact discs use 44,100 Hz; many DAWs use 48,000 Hz. The time between samples is Ts = 1/fs seconds. Double fs and you pack twice as many points into each second of sound.',
          },
          {
            type: 'paragraph',
            text: 'In plain English: the Nyquist frequency is simply half the sample rate — the fastest oscillation those snapshots can still tell apart.',
          },
          {
            type: 'callout',
            text: 'Nyquist frequency fN = fs / 2. It is the highest frequency you can represent without aliasing at that sample rate. Example: at fs = 1,000 Hz, fN = 500 Hz.',
          },
          {
            type: 'paragraph',
            text: 'If a pure tone sits below Nyquist, the samples can reconstruct it. If it sits at or above Nyquist, the same samples look like a different, lower frequency — an alias. Metaphor: filming a spinning wagon wheel with a slow camera; the wheel appears to turn the wrong way because the shutter missed the true motion.',
          },
          {
            type: 'paragraph',
            text: 'Static example: a 900 Hz sine sampled at fs = 1,000 Hz (Nyquist 500 Hz) folds to about 100 Hz. Raise fs above 1,800 Hz and the same 900 Hz tone becomes uniquely representable again. In the demo, change sample rate while playing — playback restarts so you hear the fold without pressing Play again.',
          },
        ],
      },
    ],
    demos: [
      {
        id: 'aliasing-visual',
        title: 'See & hear aliasing',
        summary:
          'Raise the tone frequency relative to sample rate, watch the wave fold, and hear the aliased pitch. Changing sample rate auto-restarts playback.',
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
            text: 'A discrete signal is a list of numbers x[n] — one amplitude per sample index n = 0, 1, 2, …. Real time between samples is Ts = 1/fs seconds, so sample n happens at t = n/fs. Metaphor: x[n] is a flip-book; fs is how fast you flip the pages.',
          },
          {
            type: 'paragraph',
            text: 'In plain English: each sample is amplitude × sin (or cos) of (frequency × time-index / sample-rate), then plus or minus a phase offset that slides the wave.',
          },
          {
            type: 'callout',
            text: 'Digital sine: x[n] = A · sin(2π · f · n / fs + φ)',
          },
          {
            type: 'paragraph',
            text: 'Symbol legend — x[n]: amplitude at sample n. n: integer sample index (0, 1, 2, …). A: peak amplitude (how tall the wave is; A = 1 reaches ±1). f: tone frequency in hertz (cycles per second). fs: sample rate in hertz. φ (phi): phase offset in radians (slides the wave left/right; φ = 0 starts at zero going up). 2π: one full cycle in radians.',
          },
          {
            type: 'paragraph',
            text: 'Static example: A = 1, f = 220, fs = 2000, φ = 0. Each step advances phase by 2π·220/2000 radians. After n = 2000/220 ≈ 9.09 samples you complete one cycle. Raise f and more cycles pack into the same buffer; raise A and peaks get taller without changing pitch.',
          },
          {
            type: 'paragraph',
            text: 'Sample rate still matters for hearing: the demo builds the sine at teaching fs, then plays it through the device. If f sits above Nyquist (fs/2), the numbers describe an alias — changing fs can audibly fold the pitch even when the “Frequency” slider stays put.',
          },
        ],
      },
    ],
    demos: [
      {
        id: 'sine-gen',
        title: 'Generate a sine',
        summary:
          'Adjust frequency, amplitude, and sample rate — watch the discrete waveform and hear true pitch or an alias when you cross Nyquist.',
        componentId: 'sine-generator',
        audio: { mode: 'continuous' },
        params: [
          {
            id: 'frequencyHz',
            label: 'Frequency',
            min: 50,
            max: 800,
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
            min: 800,
            max: 4000,
            step: 200,
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
            text: 'The time domain plots amplitude versus sample index — the familiar wavy line. The frequency domain asks a different question: which tones are present, and how strong is each? A piano chord looks messy in time but shows neat peaks at each note’s frequency.',
          },
          {
            type: 'paragraph',
            text: 'A Fast Fourier Transform (FFT) turns a block of N samples into frequency bins. In plain English: each bin’s frequency is (bin index × sample rate) ÷ FFT length, and the gap between bins is sample rate ÷ length.',
          },
          {
            type: 'callout',
            text: 'Bin frequency ≈ k · fs / N. Example: fs = 256 Hz, N = 128 → Δf = 2 Hz, so bin 8 ≈ 16 Hz.',
          },
          {
            type: 'paragraph',
            text: 'Why neighboring peaks appear: a pure sine only lands exactly on one bin when it completes an integer number of cycles in the FFT frame. Otherwise energy leaks into neighbors (spectral leakage). If Δf ≈ 1 Hz and the tone sits on an integer Hz, the plot looks “clean” even though leakage is the lesson — the demo defaults to a non-integer cycle count so you can see side energy, then slide onto an integer count to watch it collapse.',
          },
          {
            type: 'paragraph',
            text: 'Metaphor: photographing a picket fence through a coarse grid. Shift the grid spacing and different slats align with gaps — “extra” bars flicker even though the fence did not grow new posts. Windowing (next module) softens the grid edges so leakage is quieter.',
          },
        ],
      },
    ],
    demos: [
      {
        id: 'spectrum-demo',
        title: 'Time and spectrum',
        summary:
          'Defaults land off-bin so leakage is visible (≈8.75 cycles/frame). Slide onto an integer cycle count to collapse neighbors; change fs to move Δf = fs/N.',
        componentId: 'spectrum-visualizer',
        audio: { mode: 'continuous' },
        params: [
          {
            id: 'frequencyHz',
            label: 'Tone frequency',
            min: 4,
            max: 40,
            step: 0.5,
            defaultValue: 17.5,
            unit: 'Hz',
          },
          {
            id: 'sampleRateHz',
            label: 'Sample rate',
            min: 128,
            max: 512,
            step: 64,
            defaultValue: 256,
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
          prompt: 'With fs = 256 Hz and N = 128, what frequency is bin k = 8?',
          kind: 'multipleChoice',
          choices: ['1 Hz', '8 Hz', '16 Hz', '32 Hz'],
          correctIndex: 2,
          explanation: 'f = k · fs / N = 8 · 256 / 128 = 16 Hz. Same formula as the lesson — peek back if needed.',
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
            text: 'An FFT pretends the buffer is one period of an infinite loop. If your sine does not land on an integer number of cycles inside those N samples, the wrap-around jump (end ≠ start) sprays energy into neighboring bins — spectral leakage. The tone is still one frequency; the display just smears it.',
          },
          {
            type: 'paragraph',
            text: 'Cycles in the frame ≈ frequency × FFT length ÷ sample rate. Example with N = 256 and fs = 4,096 Hz: f = 448 Hz → exactly 28 cycles (clean peak). f = 437.5 Hz → 27.34 cycles (leakage). A window multiplies the buffer by a taper that goes to zero at the ends before the FFT, softening that discontinuity.',
          },
          {
            type: 'paragraph',
            text: 'In plain English: Rectangular means “no taper” (raw edges leak). Hann gently fades the ends so side lobes quiet down, at the cost of a slightly wider main peak.',
          },
          {
            type: 'callout',
            text: 'Rectangular (no taper) leaks more. Hann reduces side lobes but slightly widens the main peak. Trade sharpness for cleaner skirts — like closing curtains so streetlight glare does not wash out the room.',
          },
          {
            type: 'paragraph',
            text: 'This demo uses mid-audio teaching rates (kilohertz-scale fs and hundreds of hertz for the tone) so the pitch you hear matches the spectrum you study. Nudge frequency off an integer cycle count, then flip Rectangular ↔ Hann and watch side energy drop.',
          },
        ],
      },
    ],
    demos: [
      {
        id: 'window-demo',
        title: 'Leakage vs Hann',
        summary:
          'Hear a mid-range tone at a sensible sample rate. Park frequency off an integer cycle count, then switch Rectangular ↔ Hann and watch side energy drop.',
        componentId: 'windowing-visualizer',
        audio: { mode: 'continuous' },
        params: [
          {
            id: 'frequencyHz',
            label: 'Tone frequency',
            min: 200,
            max: 800,
            step: 0.5,
            defaultValue: 437.5,
            unit: 'Hz',
          },
          {
            id: 'sampleRateHz',
            label: 'Sample rate',
            min: 2048,
            max: 8192,
            step: 1024,
            defaultValue: 4096,
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
            text: 'A filter reshapes a signal’s spectrum. Lowpass keeps slow (low-frequency) motion and attenuates fast wiggles — like muffling a room so you still hear the bass. Highpass does the opposite: it favors rapid changes and thins out the slow swell.',
          },
          {
            type: 'paragraph',
            text: 'FIR (finite impulse response) filters are weighted sums of recent input samples only. In plain English: each output is a mix of the newest few inputs — no memory of past outputs. Written: y[n] = b0 x[n] + b1 x[n−1] + … + bM x[n−M]. Hit them with a single click (impulse) and the output dies after M+1 samples — finite memory. A moving-average lowpass is the classic teaching FIR: more taps → smoother, slower output (stronger lowpass). A first-difference highpass y[n] = x[n] − x[n−1] emphasizes sample-to-sample jumps — high “speed” in the signal.',
          },
          {
            type: 'paragraph',
            text: 'IIR (infinite impulse response) filters also feed past outputs back in. In plain English: today’s output remembers yesterday’s output, so a short recipe can ring for a long time. Written: y[n] = … + a1 y[n−1] + …. A one-pole smoother y[n] = y[n−1] + α (x[n] − y[n−1]) is the teaching IIR lowpass: small α → sluggish follow (stronger lowpass); α near 1 → tracks quickly. Highpass is often “input minus that smoother.”',
          },
          {
            type: 'callout',
            text: 'Frequency ↔ “speed” intuition: low-frequency content changes slowly from sample to sample; high-frequency content flips faster. FIR averages or differences those neighbors. IIR remembers previous outputs, so transients can ring longer and phase/delay feel different even when the magnitude story is similar.',
          },
          {
            type: 'paragraph',
            text: 'In the demo, mix a slow teaching tone with a fast one, then toggle FIR/IIR and LP/HP. Visually, lowpass should calm the trace toward the slow wave; highpass should leave the rapid ripple. Audio follows the same filter after mapping teaching frequencies into the audible range so you can actually hear the contrast — slider and chip changes rebuild playback live.',
          },
        ],
      },
    ],
    demos: [
      {
        id: 'filter-demo',
        title: 'LP / HP demo',
        summary:
          'Mix a low and high sine, then toggle FIR/IIR and lowpass/highpass — hear and see what survives. Changes apply while playing.',
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
            text: 'An impulse is a single “click”: 1 at n = 0 and 0 elsewhere. How a linear system answers that click is its impulse response (IR), often written h[n]. Metaphor: clap once in a cathedral; the decaying echoes you hear are the room’s IR. Every later sound is that clap-pattern painted onto the music.',
          },
          {
            type: 'paragraph',
            text: 'Discrete convolution mixes the IR across the input. In plain English: for each output time, flip and slide the impulse response across the input, multiply overlaps, and add them up. Written: y[n] = Σ_k x[k] · h[n − k]. That is exactly what FIR filtering is — the b coefficients are h[n]. Linear time-invariant filters are completely described by their IR.',
          },
          {
            type: 'paragraph',
            text: 'In plain English: a unit impulse IR (just [1]) leaves the signal alone; an echo IR keeps a full-strength click at delay 0 and adds a quieter tap later so you hear a delayed copy.',
          },
          {
            type: 'callout',
            text: 'Unit impulse IR h = [1] leaves the signal unchanged (identity). Echo IR: 1 at delay 0, plus a quieter tap g at delay D → y gets a delayed copy scaled by g. Example: D = 8 samples, g = 0.5 → a half-loud repeat eight samples later.',
          },
          {
            type: 'paragraph',
            text: 'Static walk-through: burst x = [1, 0.5, 0], echo h = [1, 0, 0, 0.4]. Convolution yields a copy of the burst starting at n = 0 and another starting at n = 3 scaled by 0.4. In the demo, tap Use echo, stretch delay, change burst frequency, and hear the second tap move — the plots show the same IR you are hearing.',
          },
          {
            type: 'paragraph',
            text: 'Why care? Reverb, EQ, and many “effects” are convolution (or fast FFT approximations of it) with carefully designed IRs. Once you see filtering as mixing memory into a signal, FIR math and echo demos stop feeling like separate topics.',
          },
        ],
      },
    ],
    demos: [
      {
        id: 'conv-demo',
        title: 'Echo by convolution',
        summary:
          'Play a short burst through a unit impulse or echo kernel — hear the delayed tap and compare plots. Use echo is a button; frequency is a slider.',
        componentId: 'convolution-visualizer',
        audio: { mode: 'oneshot' },
        params: [
          {
            id: 'frequencyHz',
            label: 'Burst frequency',
            min: 4,
            max: 16,
            step: 1,
            defaultValue: 8,
            unit: 'Hz',
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

/** Next ready module in curriculum order, if any. */
export function getNextModule(moduleId: string): ModuleContent | undefined {
  const ready = listReadyModules();
  const index = ready.findIndex((module) => module.id === moduleId);
  if (index < 0 || index >= ready.length - 1) {
    return undefined;
  }
  return ready[index + 1];
}
