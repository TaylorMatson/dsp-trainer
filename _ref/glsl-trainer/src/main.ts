import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/source-serif-4/400.css';
import '@fontsource/source-serif-4/600.css';
import './style.css';
import { lessons, type Lesson, type LessonControlKind, type LessonStage } from './content/lessons';
import { ColorStage } from './engine/color-stage';
import { TeachingDeck, type DeckFrame } from './engine/deck';
import { POST, PRELUDE } from './engine/prelude';

const STORAGE_INDEX = 'glsl-trainer-lesson';
const STORAGE_SEEN = 'glsl-trainer-seen';

function clampIndex(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  if (value >= lessons.length) return lessons.length - 1;
  return Math.floor(value);
}

function loadSeen(): Set<string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_SEEN) ?? '[]') as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((item): item is string => typeof item === 'string'));
  } catch {
    return new Set();
  }
}

function formatControl(value: number, step: number): string {
  if (step >= 1) return String(Math.round(value));
  if (step >= 0.1) return value.toFixed(1);
  if (step >= 0.01) return value.toFixed(2);
  return value.toFixed(3);
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function paintWave(canvas: HTMLCanvasElement, frame: DeckFrame): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(2, Math.floor(rect.width * dpr));
  const height = Math.max(2, Math.floor(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#0c0e0a';
  ctx.fillRect(0, 0, width, height);

  const strip = Math.max(12, Math.floor(height * 0.14));
  const samples = frame.left;
  const count = Math.max(1, samples.length);
  for (let x = 0; x < width; x += 1) {
    const index = Math.min(count - 1, Math.floor((x / width) * count));
    const left = samples[index] ?? 0;
    const right = frame.right[index] ?? 0;
    const red = Math.max(0, Math.min(255, Math.round((0.5 + 0.5 * left) * 255)));
    const green = Math.max(0, Math.min(255, Math.round((0.5 + 0.5 * right) * 255)));
    ctx.fillStyle = `rgb(${red}, ${green}, 36)`;
    ctx.fillRect(x, 0, 1, strip);
  }

  const lanes = frame.voices.length > 1 ? frame.voices.length : 1;
  const laneHeight = (height - strip) / lanes;
  const stroke = (data: Float32Array, y0: number, y1: number, color: string, widthPx: number): void => {
    const mid = (y0 + y1) / 2;
    const amp = (y1 - y0) * 0.72;
    ctx.strokeStyle = 'rgba(231, 225, 209, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(width, mid);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = widthPx;
    ctx.beginPath();
    for (let x = 0; x < width; x += 1) {
      const index = Math.min(data.length - 1, Math.floor((x / width) * data.length));
      const y = mid - (data[index] ?? 0) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  if (frame.voices.length > 1) {
    const colors = ['#dff25a', '#8fd0c4'];
    frame.voices.forEach((voice, index) => {
      const y0 = strip + laneHeight * index;
      stroke(voice.left, y0 + 8, y0 + laneHeight - 4, colors[index] ?? '#dff25a', 1.4);
    });
    return;
  }

  stroke(frame.right, strip, height, '#8fd0c4', 1.2);
  stroke(frame.left, strip, height, '#dff25a', 1.6);
}

function boot(deck: TeachingDeck | null, bootError: string | null): void {
  const app = document.querySelector('#app');
  if (!app) return;

  const seen = loadSeen();
  let index = clampIndex(Number(localStorage.getItem(STORAGE_INDEX) ?? '0'));
  let colorRunning = false;
  const drafts = new Map<string, string[]>();

  const banner = el('p', 'banner');
  if (bootError) banner.textContent = bootError;
  else banner.classList.add('hidden');

  const top = el('header', 'top');
  const brand = el('div', 'brand');
  const kicker = el('div', 'kicker');
  kicker.textContent = 'GLSL Trainer';
  const heading = el('h1');
  heading.textContent = 'How wavenerd-deck turns a shader into sound';
  brand.append(kicker, heading);
  const progressWrap = el('div', 'progress-wrap');
  const progressLabel = el('div', 'progress-label');
  const progress = el('div', 'progress');
  const progressBar = el('span');
  progress.append(progressBar);
  progressWrap.append(progressLabel, progress);
  top.append(brand, progressWrap);

  const layout = el('div', 'layout');
  const toc = el('nav', 'toc');
  toc.setAttribute('aria-label', 'Lessons');
  const lessonGrid = el('div', 'lesson');
  const article = el('article');
  const part = el('div', 'part-label');
  const title = el('h2');
  const files = el('div', 'files');
  const prose = el('div', 'prose');
  article.append(part, title, files, prose);

  const stage = el('section', 'stage');
  const stageHead = el('div', 'stage-head');
  const status = el('div', 'status');
  const lamps = el('div', 'lamps');
  lamps.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 4; i += 1) lamps.append(el('i'));
  stageHead.append(status, lamps);

  const canvasWrap = el('div', 'canvas-wrap');
  const wave = el('canvas');
  wave.id = 'wave';
  const colorCanvas = el('canvas');
  colorCanvas.id = 'color';
  colorCanvas.classList.add('hidden');
  canvasWrap.append(wave, colorCanvas);

  const readout = el('div', 'readout');
  const meterRow = el('div', 'toolbar');
  const meterLabel = el('span', 'meter-label');
  meterLabel.textContent = 'buffer ahead';
  const meter = el('div', 'meter');
  const meterFill = el('span');
  meter.append(meterFill);
  const aheadText = el('span', 'meter-label');
  meterRow.append(meterLabel, meter, aheadText);

  const sliders = el('div', 'sliders');
  const bpmLabel = el('label');
  bpmLabel.textContent = 'BPM ';
  const bpm = el('input');
  bpm.id = 'bpm';
  bpm.type = 'range';
  bpm.min = '70';
  bpm.max = '180';
  bpm.value = '140';
  const bpmValue = el('span', 'slider-value');
  bpmValue.textContent = '140';
  bpmLabel.append(bpm, bpmValue);
  const bpmNote = el('p', 'bpm-note hidden');
  const lessonControls = el('div', 'lesson-controls');
  sliders.append(bpmLabel, bpmNote, lessonControls);

  const stageNote = el('p', 'stage-note hidden');
  stageNote.textContent = 'This buffer writes color, not sound. Play animates the picture. There is no audio on this lesson.';

  const editors = el('div');
  const tryPanel = el('aside', 'try');
  const tryTitle = el('h3');
  tryTitle.textContent = 'Try changing…';
  const tryList = el('ul');
  tryPanel.append(tryTitle, tryList);
  const error = el('p', 'error');
  const actions = el('div', 'actions');
  const play = el('button', 'action');
  play.id = 'play';
  play.type = 'button';
  play.textContent = 'Play';
  const rewind = el('button', 'ghost');
  rewind.id = 'rewind';
  rewind.type = 'button';
  rewind.textContent = 'Rewind';
  const apply = el('button', 'ghost');
  apply.id = 'apply';
  apply.type = 'button';
  apply.textContent = 'Apply now';
  const cue = el('button', 'ghost');
  cue.id = 'cue';
  cue.type = 'button';
  cue.textContent = 'Cue next bar';
  const swap = el('button', 'ghost');
  swap.id = 'swap';
  swap.type = 'button';
  swap.textContent = 'Load square';
  actions.append(play, rewind, apply, cue, swap);

  const wrapper = el('details');
  const summary = el('summary');
  summary.textContent = 'Engine wrapper';
  const wrapperPre = el('pre');
  wrapperPre.textContent = `${PRELUDE}\n/* your mainAudio */\n${POST}`;
  wrapper.append(summary, wrapperPre);

  stage.append(stageHead, canvasWrap, readout, meterRow, stageNote, sliders, actions, editors, tryPanel, error, wrapper);
  lessonGrid.append(article, stage);
  layout.append(toc, lessonGrid);

  const footer = el('nav', 'footer-nav');
  const prev = el('button', 'ghost');
  prev.id = 'prev';
  prev.type = 'button';
  prev.textContent = 'Back';
  const count = el('span', 'readout');
  const next = el('button', 'action');
  next.id = 'next';
  next.type = 'button';
  next.textContent = 'Next';
  footer.append(prev, count, next);

  app.append(banner, top, layout, footer);

  const color = new ColorStage(colorCanvas);
  colorCanvas.addEventListener('pointermove', (event) => {
    const rect = colorCanvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    color.setPointer(
      (event.clientX - rect.left) / rect.width,
      1 - (event.clientY - rect.top) / rect.height,
    );
  });

  function lesson(): Lesson {
    return lessons[index] ?? lessons[0]!;
  }

  function texts(): string[] {
    return [...editors.querySelectorAll('textarea')].map((node) => node.value);
  }

  function sources(): { label: string; code: string }[] {
    const current = lesson();
    return texts().map((code, voiceIndex) => ({
      label: current.voices[voiceIndex]?.label ?? `Voice ${voiceIndex + 1}`,
      code,
    }));
  }

  function rememberDraft(): void {
    const current = lesson();
    drafts.set(current.id, texts());
  }

  function showStage(stageKind: LessonStage): void {
    const audio = stageKind === 'audio';
    wave.classList.toggle('hidden', !audio);
    colorCanvas.classList.toggle('hidden', audio);
    meterRow.classList.toggle('hidden', !audio);
    lamps.classList.toggle('hidden', !audio);
    cue.classList.toggle('hidden', !audio);
    wrapper.classList.toggle('hidden', !audio);
    if (!audio) {
      summary.textContent = 'This shader is the whole fragment program';
    } else {
      summary.textContent = 'Engine wrapper';
    }
  }

  function renderToc(): void {
    toc.replaceChildren();
    let lastPart = '';
    lessons.forEach((item, itemIndex) => {
      if (item.part !== lastPart) {
        const label = el('div', 'part');
        label.textContent = item.part;
        toc.append(label);
        lastPart = item.part;
      }
      const button = el('button');
      button.type = 'button';
      button.textContent = `${itemIndex + 1}. ${item.title}`;
      if (itemIndex === index) button.setAttribute('aria-current', 'true');
      if (seen.has(item.id)) button.classList.add('seen');
      button.addEventListener('click', () => go(itemIndex));
      toc.append(button);
    });
  }

  function renderEditors(item: Lesson): void {
    editors.replaceChildren();
    const saved = drafts.get(item.id);
    item.voices.forEach((voice, voiceIndex) => {
      const label = el('div', 'voice-label');
      label.textContent = voice.label;
      const area = el('textarea');
      area.spellcheck = false;
      area.setAttribute('aria-label', voice.label);
      area.value = saved?.[voiceIndex] ?? voice.code;
      area.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          applyNow();
        }
      });
      editors.append(label, area);
    });
  }

  function applyControl(kind: LessonControlKind, id: string, value: number): void {
    const item = lesson();
    if (item.stage === 'color') {
      color.setUniform(id, value);
      return;
    }
    if (!deck) return;
    switch (kind) {
      case 'uniform':
        deck.setUniform(id, value);
        break;
      case 'param':
        deck.setParam(id, value);
        break;
      default: {
        const neverKind: never = kind;
        return neverKind;
      }
    }
  }

  function renderControls(item: Lesson): void {
    const audio = item.stage === 'audio';
    bpmLabel.classList.toggle('hidden', !audio || !item.bpm);
    bpmNote.textContent = audio && item.bpmNote ? item.bpmNote : '';
    bpmNote.classList.toggle('hidden', bpmNote.textContent.length === 0);
    stageNote.classList.toggle('hidden', item.stage !== 'color');
    lessonControls.replaceChildren();
    for (const control of item.controls) {
      const label = el('label');
      const name = el('span');
      name.textContent = `${control.label} `;
      const input = el('input');
      input.type = 'range';
      input.min = String(control.min);
      input.max = String(control.max);
      input.step = String(control.step);
      input.value = String(control.value);
      input.setAttribute('aria-label', control.label);
      const value = el('span', 'slider-value');
      value.textContent = formatControl(control.value, control.step);
      input.addEventListener('input', () => {
        const next = Number(input.value);
        value.textContent = formatControl(next, control.step);
        applyControl(control.kind, control.id, next);
      });
      label.append(name, input, value);
      lessonControls.append(label);
    }
  }

  function renderSuggestions(item: Lesson): void {
    tryList.replaceChildren();
    tryPanel.classList.toggle('hidden', item.suggestions.length === 0);
    for (const text of item.suggestions) {
      const line = el('li');
      line.textContent = text;
      tryList.append(line);
    }
  }

  function pushControls(item: Lesson): void {
    if (item.stage === 'color') {
      color.clearUniforms();
      for (const control of item.controls) color.setUniform(control.id, control.value);
      return;
    }
    if (!deck) return;
    deck.clearUniforms();
    for (const control of item.controls) {
      applyControl(control.kind, control.id, control.value);
    }
  }

  function syncLesson(): void {
    const item = lesson();
    seen.add(item.id);
    localStorage.setItem(STORAGE_INDEX, String(index));
    localStorage.setItem(STORAGE_SEEN, JSON.stringify([...seen]));
    document.title = `${item.title} · GLSL Trainer`;
    part.textContent = `Lesson ${index + 1} of ${lessons.length} · ${item.part}`;
    title.textContent = item.title;
    prose.innerHTML = item.html;
    files.replaceChildren();
    for (const link of item.files) {
      const anchor = el('a');
      anchor.href = link.href;
      anchor.target = '_blank';
      anchor.rel = 'noreferrer';
      anchor.textContent = link.label;
      files.append(anchor);
    }
    progressLabel.textContent = `${index + 1} / ${lessons.length}`;
    progressBar.style.width = `${((index + 1) / lessons.length) * 100}%`;
    count.textContent = `${index + 1} / ${lessons.length}`;
    prev.disabled = index === 0;
    next.disabled = index === lessons.length - 1;
    swap.classList.toggle('hidden', item.swapExample == null);
    showStage(item.stage);
    renderEditors(item);
    renderControls(item);
    renderSuggestions(item);
    renderToc();
    colorRunning = false;
    if (deck?.playing) deck.pause();
    bpm.value = '140';
    bpmValue.textContent = '140';
    if (item.stage === 'audio' && deck) {
      deck.setBpm(140);
      pushControls(item);
      deck.rewind();
      deck.applySources(sources(), 'now');
    } else {
      pushControls(item);
      color.rewind();
      color.compile(texts()[0] ?? '');
      color.resize();
    }
    paint();
  }

  function applyNow(): void {
    rememberDraft();
    const item = lesson();
    if (item.stage === 'color') {
      color.compile(texts()[0] ?? '');
      error.textContent = color.error ?? '';
      return;
    }
    deck?.applySources(sources(), 'now');
    error.textContent = deck?.latest.error ?? '';
  }

  function cueNext(): void {
    rememberDraft();
    deck?.applySources(sources(), 'bar');
    error.textContent = deck?.latest.error ?? '';
  }

  function go(nextIndex: number): void {
    rememberDraft();
    index = clampIndex(nextIndex);
    syncLesson();
  }

  function paint(): void {
    const item = lesson();
    const frame = deck?.latest;
    if (item.stage === 'audio' && frame) {
      paintWave(wave, frame);
      const beatIndex = frame.beatSeconds > 0 ? Math.floor(frame.bar / frame.beatSeconds) % 4 : 0;
      [...lamps.children].forEach((lamp, lampIndex) => {
        lamp.classList.toggle('on', lampIndex === beatIndex && frame.time > 0);
      });
      const cueLabel = frame.cueStatus === 'none' ? 'live' : frame.cueStatus;
      status.textContent = `${frame.playing ? 'Playing' : 'Stopped'} · ${cueLabel}`;
      readout.textContent = [
        `beat ${frame.beat.toFixed(3)}s`,
        `bar ${frame.bar.toFixed(3)}s`,
        `16 ${frame.sixteenBar.toFixed(2)}s`,
        `t ${frame.time.toFixed(2)}s`,
        `read ${frame.readBlocks}`,
        `write ${frame.writeBlocks}`,
        `offset ${frame.blockOffset}`,
        `${frame.sampleRate} Hz`,
        `${frame.framesPerRender} frames`,
      ].join('  ·  ');
      const ratio = frame.blockAhead / deck!.latencyBlocks;
      meterFill.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
      aheadText.textContent = `${frame.blockAhead} / ${deck!.latencyBlocks}`;
      error.textContent = frame.error ?? '';
      play.textContent = frame.playing ? 'Pause' : 'Play';
    } else {
      status.textContent = colorRunning ? 'Playing' : 'Stopped';
      readout.textContent = `color, not sound  ·  time ${color.time.toFixed(2)}s  ·  move the pointer in the frame`;
      error.textContent = color.error ?? '';
      play.textContent = colorRunning ? 'Pause' : 'Play';
    }
  }

  function frame(now: number): void {
    const item = lesson();
    if (item.stage === 'audio') {
      deck?.update();
    } else {
      color.frame(colorRunning, now);
    }
    paint();
    requestAnimationFrame(frame);
  }

  play.addEventListener('click', () => {
    const item = lesson();
    if (item.stage === 'color') {
      colorRunning = !colorRunning;
      paint();
      return;
    }
    if (!deck) return;
    if (deck.playing) deck.pause();
    else void deck.play();
  });
  rewind.addEventListener('click', () => {
    if (lesson().stage === 'color') color.rewind();
    else deck?.rewind();
  });
  apply.addEventListener('click', applyNow);
  cue.addEventListener('click', cueNext);
  swap.addEventListener('click', () => {
    const example = lesson().swapExample;
    const area = editors.querySelector('textarea');
    if (!example || !area) return;
    area.value = example;
    area.focus();
  });
  bpm.addEventListener('input', () => {
    bpmValue.textContent = bpm.value;
    deck?.setBpm(Number(bpm.value));
  });
  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  window.addEventListener('keydown', (event) => {
    const target = event.target;
    if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) return;
    if (event.key === 'ArrowRight') go(index + 1);
    if (event.key === 'ArrowLeft') go(index - 1);
  });

  syncLesson();
  requestAnimationFrame(frame);
}

async function main(): Promise<void> {
  const sink = document.createElement('canvas');
  sink.className = 'gl-sink';
  sink.setAttribute('aria-hidden', 'true');
  document.body.appendChild(sink);
  try {
    const deck = new TeachingDeck(sink);
    await deck.init();
    boot(deck, null);
  } catch (error) {
    boot(null, error instanceof Error ? error.message : String(error));
  }
}

void main();
