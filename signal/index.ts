export { generateSineSamples, peakAmplitude } from './sine';
export type { SineOptions } from './sine';

export { aliasedFrequencyHz, isAliasing, nyquistHz } from './sampleRate';

export { binFrequencyHz, fftInPlace, fftMagnitude, peakBin } from './fft';
export type { Complex } from './fft';

export {
  applyWindow,
  hannWindow,
  makeWindow,
  rectangularWindow,
} from './window';
export type { WindowKind } from './window';

export {
  applyTeachingFilter,
  firFirstDifference,
  firMovingAverage,
  iirOnePoleHighpass,
  iirOnePoleLowpass,
} from './filters';
export type { FilterFamily, FilterKind } from './filters';

export {
  applyImpulseResponse,
  convolve,
  makeEchoKernel,
  makeImpulse,
} from './convolve';

export {
  audibleFrequencyHz,
  bytesToBase64,
  encodeWavBytes,
  encodeWavDataUri,
  fadeEdges,
  resampleLinear,
  toFloat32,
} from './pcm';
