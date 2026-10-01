/** Beat clock used by wavenerd-deck's BeatManager.
 *  Formulas match src/BeatManager.ts and src/utils/mod.ts. */

export const BLOCK_SIZE = 128;

export function mod(value: number, divisor: number): number {
  return value - Math.floor(value / divisor) * divisor;
}

export function beatSeconds(bpm: number): number {
  return 60.0 / bpm;
}

export function barSeconds(bpm: number): number {
  return 240.0 / bpm;
}

export function sixteenBarSeconds(bpm: number): number {
  return 3840.0 / bpm;
}

export class BeatClock {
  private bpmValue = 140;
  private timeValue = 0;
  private sixteenValue = 0;

  get bpm(): number {
    return this.bpmValue;
  }

  set bpm(value: number) {
    const previous = this.bpmValue;
    this.bpmValue = Math.max(0, value);
    if (previous > 0) {
      this.sixteenValue = this.sixteenValue * previous / this.bpmValue;
    }
  }

  get time(): number {
    return this.timeValue;
  }

  get sixteenBar(): number {
    return this.sixteenValue;
  }

  get bar(): number {
    return mod(this.sixteenValue, barSeconds(this.bpmValue));
  }

  get beat(): number {
    return mod(this.bar, beatSeconds(this.bpmValue));
  }

  reset(): void {
    this.timeValue = 0;
    this.sixteenValue = 0;
  }

  update(time: number): void {
    const delta = time - this.timeValue;
    this.sixteenValue = mod(this.sixteenValue + delta, sixteenBarSeconds(this.bpmValue));
    this.timeValue = time;
  }
}

/** play() / pause() both assign blockOffset = readBlocks - blockOffset. */
export function flipBlockOffset(readBlocks: number, blockOffset: number): number {
  return readBlocks - blockOffset;
}

/** While stopped, play() will flip the offset once. Store the preimage of
 *  writeBlocks so that flip brings generation time back to 0. While playing,
 *  the next render uses the offset directly, so it is writeBlocks itself. */
export function rewindOffset(readBlocks: number, writeBlocks: number, playing: boolean): number {
  if (playing) return writeBlocks;
  return readBlocks - writeBlocks;
}

export function generationTime(writeBlocks: number, blockOffset: number, sampleRate: number): number {
  return BLOCK_SIZE * (writeBlocks - blockOffset) / sampleRate;
}

export function catchUpWriteBlocks(
  readBlocks: number,
  latencyBlocks: number,
  blocksPerRender: number,
): number {
  return Math.floor((readBlocks + latencyBlocks) / blocksPerRender) * blocksPerRender;
}
