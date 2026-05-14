
export interface PartRange {
  part: number;
  start: number;
  end: number;
  label: string;
}

export const TOEIC_PART_RANGES: PartRange[] = [
  { part: 1, start: 1, end: 6, label: 'Part 1' },
  { part: 2, start: 7, end: 31, label: 'Part 2' },
  { part: 3, start: 32, end: 70, label: 'Part 3' },
  { part: 4, start: 71, end: 100, label: 'Part 4' },
  { part: 5, start: 101, end: 130, label: 'Part 5' },
  { part: 6, start: 131, end: 146, label: 'Part 6' },
  { part: 7, start: 147, end: 200, label: 'Part 7' },
];

export const getPartFromOrder = (order: number): number => {
  const partRange = TOEIC_PART_RANGES.find(
    (range) => order >= range.start && order <= range.end
  );
  return partRange ? partRange.part : 1;
};

export const getQuestionsByPart = (questions: any[], part: number) => {
  const range = TOEIC_PART_RANGES.find((r) => r.part === part);
  if (!range) return [];
  return questions.filter((q) => q.order >= range.start && q.order <= range.end);
};

export const getAvailableParts = (questions: any[]): number[] => {
  const parts = new Set<number>();
  questions.forEach((q) => {
    parts.add(getPartFromOrder(q.order));
  });
  return Array.from(parts).sort((a, b) => a - b);
};
