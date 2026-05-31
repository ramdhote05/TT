export type TaskCategory = 'study' | 'revision' | 'placement' | 'break' | 'nap' | 'meal' | 'free';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'missed' | 'skipped';

export interface ScheduleTask {
  id: string;
  title: string;
  start: string;
  end: string;
  startTime: number;
  endTime: number;
  category: TaskCategory;
  xp: number;
}

export interface StoredTaskRecord {
  id: string;
  status: TaskStatus;
  startedAt?: string;
  completedAt?: string;
  skippedAt?: string;
  xpEarned: number;
}

export interface AppState {
  taskHistory: Record<string, StoredTaskRecord[]>;
  customTasks: Record<string, ScheduleTask[]>;
  xp: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  notifiedTaskIds: string[];
}
