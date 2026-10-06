export interface Question {
  id: string;
  key?: string;
  number?: string;
  question: string;
  options: Record<string, string>;
  correct: string; // e.g. "B" or "AC" for multi-answer
  section: string; // "AT", "QT", "NQ", "TTD", or "A3.1", "B4.2"
  level: string; // "COMMON", "A2", "A3", "A4", "A5", "A6", "A7", "A8"
  sourceSection?: string;
  citation?: string;
  explanation?: string;
  images?: string[];
}

export interface GroupQuestionCounts {
  at?: number;
  qt?: number;
  nq?: number;
  ttd?: number;
  ax?: number;
  [key: string]: number | undefined;
}

export interface GroupSummary {
  key: string;
  code: string;
  name: string;
  shortName: string;
  availableCount: number;
  selectedCount: number;
  color: string;
  badgeClass: string;
  desc: string;
}

export interface ExamRoom {
  id: string;
  roomCode: string; // e.g. "SPM-2026"
  roomName: string;
  isLocked: boolean; // Khoá phòng thi
  accessPin: string; // Mã khoá phòng thi (PIN)
  unit: string;
  level: string;
  examTimeMinutes: number;
  totalQuestions: number;
  groupCounts?: GroupQuestionCounts;
  maxFocusViolations: number;
  activeCandidatesCount: number;
  status: 'active' | 'locked' | 'ended';
  createdAt: string;
  description?: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  employeeCode?: string;
  unit: string;
  unitName: string;
  level: string;
  roomCode: string;
  examCode: string; // e.g. "A001" or "C-R003"
  status: 'not_started' | 'testing' | 'submitted' | 'violation';
  startedAt?: string;
  submittedAt?: string;
  score?: number;
  correctCount?: number;
  totalQuestions?: number;
  focusViolations: number;
}

export interface ExamAttempt {
  id: string;
  candidateName: string;
  unit: string;
  unitName: string;
  level: string;
  examCode: string;
  roomCode: string;
  mode: 'official' | 'training';
  startedAt: string;
  submittedAt?: string;
  durationLimitSeconds: number;
  elapsedSeconds: number;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  score: number;
  percent: number;
  status: string;
  focusViolations: number;
  answers: Record<number, string>;
  questions: Question[];
}

export interface DepartmentInfo {
  code: string;
  name: string;
}

export interface MatrixConfig {
  atCount: number;
  qtCount: number;
  nqCount: number;
  ttdCount: number;
  totalQuestions: number;
  examTimeMinutes: number;
  noDuplicateBetweenCodes: boolean;
  maxOverlapPercent: number;
  shuffleAnswers: boolean;
  axMode: 'auto' | 'manual';
  axLevelPercents: Record<string, Record<string, number>>;
  axSectionCounts: Record<string, Record<string, number>>;
}
