/* Course-player ring buffer.
   Same job as wavenerd-deck BufferReaderProcessor: store rendered
   blocks and copy BLOCK_SIZE frames into the audio output. */

const BLOCK_SIZE = 128;
const BLOCKS_PER_CHANNEL = 256;
const FRAMES_PER_CHANNEL = BLOCK_SIZE * BLOCKS_PER_CHANNEL;
const CHANNELS = 2;

class CourseBufferReader extends AudioWorkletProcessor {
  constructor() {
    super();
    this.active = false;
    this.buffer = new Float32Array(CHANNELS * FRAMES_PER_CHANNEL);
    this.blocks = 0;
    this.written = 0;
    this.underrun = false;

    this.port.onmessage = (event) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'active') {
        this.active = Boolean(data.value);
        return;
      }
      if (data.type === 'write') {
        this.store(0, data.block, data.left);
        this.store(1, data.block, data.right);
      }
    };
  }

  store(channel, block, samples) {
    const frame = (block % BLOCKS_PER_CHANNEL) * BLOCK_SIZE;
    const head = FRAMES_PER_CHANNEL * channel;
    if (frame + samples.length <= FRAMES_PER_CHANNEL) {
      this.buffer.set(samples, head + frame);
    } else {
      const first = FRAMES_PER_CHANNEL - frame;
      this.buffer.set(samples.subarray(0, first), head + frame);
      this.buffer.set(samples.subarray(first), head);
    }
    this.written = block + samples.length / BLOCK_SIZE;
  }

  process(_inputs, outputs) {
    const channels = outputs[0];
    const frames = channels[0]?.length ?? BLOCK_SIZE;

    const starved = !this.active || this.written <= this.blocks;
    if (this.active && starved !== this.underrun) {
      this.underrun = starved;
      this.port.postMessage({ type: 'underrun', value: starved });
    }
    if (starved) {
      for (let channel = 0; channel < channels.length; channel += 1) {
        channels[channel].fill(0);
      }
    } else {
      const frame = (this.blocks * BLOCK_SIZE) % FRAMES_PER_CHANNEL;
      for (let channel = 0; channel < channels.length; channel += 1) {
        const head = FRAMES_PER_CHANNEL * channel;
        const slice = this.buffer.subarray(head + frame, head + frame + frames);
        channels[channel].set(slice);
        if (slice.length < frames) channels[channel].fill(0, slice.length);
      }
    }

    this.blocks += frames / BLOCK_SIZE;
    return true;
  }
}

registerProcessor('course-buffer-reader', CourseBufferReader);
