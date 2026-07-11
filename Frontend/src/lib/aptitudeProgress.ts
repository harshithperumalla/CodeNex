// Local persistence for aptitude progress
const KEY = "aptitude.progress";

export interface ConceptResult {
  score: number;
  total: number;
  percent: number;
  timeTaken: number;
  date: string;
}

export type ProgressMap = Record<string, ConceptResult>; // key: `${categoryId}/${conceptId}`

export const loadProgress = (): ProgressMap => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
};

export const saveResult = (categoryId: string, conceptId: string, result: ConceptResult) => {
  const all = loadProgress();
  all[`${categoryId}/${conceptId}`] = result;
  localStorage.setItem(KEY, JSON.stringify(all));
};

export const getCategoryProgress = (categoryId: string, totalConcepts: number) => {
  const all = loadProgress();
  const completed = Object.keys(all).filter((k) => k.startsWith(categoryId + "/")).length;
  return Math.round((completed / Math.max(totalConcepts, 1)) * 100);
};

export const getOverallAccuracy = () => {
  const all = Object.values(loadProgress());
  if (!all.length) return 0;
  const sum = all.reduce((a, r) => a + r.percent, 0);
  return Math.round(sum / all.length);
};

export const getCompletedCount = () => Object.keys(loadProgress()).length;
