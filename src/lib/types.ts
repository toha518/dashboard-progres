export interface ProgressEntry {
  date: string;
  percentage: number;
}

export interface Region {
  id: number;
  code: string;
  name: string;
  type: string;
  order: number;
  progress: ProgressEntry[];
}
