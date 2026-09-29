/** Bundled curriculum stubs. Full modules land in curriculum-content track. */

export type ModuleStub = {
  id: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  status: 'stub' | 'ready';
};

export const MODULES: ModuleStub[] = [
  {
    id: 'sampling-aliasing',
    title: 'Sampling & Aliasing',
    order: 1,
    estimatedMinutes: 15,
    status: 'stub',
  },
];

export function getModuleById(id: string): ModuleStub | undefined {
  return MODULES.find((module) => module.id === id);
}
