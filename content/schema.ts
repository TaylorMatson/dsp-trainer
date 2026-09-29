/** Bundled curriculum content model (v1 offline). */

export type LessonBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'callout'; text: string };

export type Lesson = {
  id: string;
  title: string;
  blocks: LessonBlock[];
};

export type DemoParam = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
};

export type Demo = {
  id: string;
  title: string;
  summary: string;
  componentId: 'aliasing-visualizer';
  params: DemoParam[];
};

export type PracticeChallenge = {
  id: string;
  prompt: string;
  kind: 'multipleChoice';
  choices: string[];
  correctIndex: number;
  explanation: string;
};

export type Practice = {
  id: string;
  title: string;
  passScore: number;
  challenges: PracticeChallenge[];
};

export type ModuleContent = {
  id: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  status: 'stub' | 'ready';
  summary: string;
  lessons: Lesson[];
  demos: Demo[];
  practice: Practice | null;
};

export function isModuleReady(module: ModuleContent): boolean {
  return module.status === 'ready' && module.practice !== null;
}
