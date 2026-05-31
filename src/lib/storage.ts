import { AppState, StoredTaskRecord } from '../types';

const STORAGE_KEY = 'june-task-manager-state-v1';

export const defaultAppState: AppState = {
  taskHistory: {},
  customTasks: {},
  xp: 0,
  notificationsEnabled: false,
  soundEnabled: true,
  notifiedTaskIds: []
};

export const loadAppState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultAppState;
    }
    return { ...defaultAppState, ...JSON.parse(stored) };
  } catch {
    return defaultAppState;
  }
};

export const saveAppState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage failures
  }
};

export const getRecordForTask = (history: AppState['taskHistory'], dateKey: string, taskId: string): StoredTaskRecord | undefined => {
  return history[dateKey]?.find((record) => record.id === taskId);
};

export const updateTaskRecord = (
  history: AppState['taskHistory'],
  dateKey: string,
  record: StoredTaskRecord
): AppState['taskHistory'] => {
  const dayRecords = history[dateKey] ?? [];
  const updatedRecords = dayRecords.filter((item) => item.id !== record.id).concat(record);
  return { ...history, [dateKey]: updatedRecords };
};
