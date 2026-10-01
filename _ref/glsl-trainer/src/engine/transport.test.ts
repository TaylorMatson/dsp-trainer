import assert from 'node:assert/strict';
import {
  BeatClock,
  barSeconds,
  beatSeconds,
  catchUpWriteBlocks,
  flipBlockOffset,
  generationTime,
  mod,
  rewindOffset,
  sixteenBarSeconds,
} from './beat.ts';

assert.equal(mod(5, 4), 1);
assert.equal(mod(-0.25, 1), 0.75);

assert.equal(beatSeconds(140), 60 / 140);
assert.equal(barSeconds(140), 240 / 140);
assert.equal(sixteenBarSeconds(120), 3840 / 120);

const clock = new BeatClock();
clock.bpm = 120;
clock.update(1.5);
assert.ok(Math.abs(clock.time - 1.5) < 1e-9);
assert.ok(Math.abs(clock.beat - mod(1.5, 0.5)) < 1e-9);
assert.ok(Math.abs(clock.bar - mod(1.5, 2)) < 1e-9);

const sixteenBefore = clock.sixteenBar;
clock.bpm = 60;
assert.ok(Math.abs(clock.sixteenBar - sixteenBefore * 2) < 1e-9);

clock.reset();
assert.equal(clock.time, 0);
assert.equal(clock.sixteenBar, 0);

assert.equal(rewindOffset(500, 200, true), 200);
const staged = rewindOffset(500, 200, false);
assert.equal(flipBlockOffset(500, staged), 200);
assert.equal(generationTime(200, flipBlockOffset(500, staged), 48000), 0);

assert.equal(flipBlockOffset(100, 0), 100);
assert.equal(flipBlockOffset(180, 100), 80);
assert.equal(generationTime(192, 80, 48000), (128 * 112) / 48000);
assert.equal(catchUpWriteBlocks(180, 16, 16), 192);

let offset = 0;
let write = 0;
const readAtPause = 100;
offset = flipBlockOffset(readAtPause, offset);
write = 116;
const readAtResume = 180;
offset = flipBlockOffset(readAtResume, offset);
write = catchUpWriteBlocks(readAtResume, 16, 16);
const resumed = generationTime(write, offset, 48000);
const beforePause = generationTime(116, 0, 48000);
assert.ok(Math.abs(resumed - beforePause) < 0.05, `${resumed} vs ${beforePause}`);

console.log('transport checks ok');
