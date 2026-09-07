export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskCategory = 'ALL' | 'WORK' | 'PERSONAL' | 'STUDY' | 'HEALTH';

export type StatusFilter = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE';

export type SortOption = 'NEWEST' | 'OLDEST' | 'PRIORITY' | 'DUE_DATE' | 'ALPHABETICAL';

export interface SubTaskItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  category: 'WORK' | 'PERSONAL' | 'STUDY' | 'HEALTH';
  priority: PriorityLevel;
  dueDate?: string; // YYYY-MM-DD
  subtasks?: SubTaskItem[];
  isCompleted: boolean;
  createdAt: number;
}

export interface FocusSession {
  id: string;
  type: 'focus' | 'break';
  durationMinutes: number;
  completedAt: number;
}

export type ActiveTab = 'tasks' | 'focus' | 'insights';

