import { ScheduleTask, TaskCategory } from '../types';

const scheduleTemplate: Array<{ title: string; start: string; end: string; category: TaskCategory; xp: number }> = [
  { title: 'Revision PS', start: '00:00', end: '00:30', category: 'revision', xp: 30 },
  { title: 'Touch Grass', start: '06:00', end: '06:50', category: 'break', xp: 10 },
  { title: 'Aditya SIR', start: '07:00', end: '09:00', category: 'study', xp: 20 },
  { title: 'Free Time', start: '09:15', end: '10:30', category: 'free', xp: 10 },
  { title: 'Mess', start: '10:30', end: '11:30', category: 'meal', xp: 10 },
  { title: 'Laundry', start: '12:00', end: '13:00', category: 'break', xp: 10 },
  { title: 'Revision AS', start: '13:15', end: '13:45', category: 'revision', xp: 30 },
  { title: 'Placement', start: '13:50', end: '17:00', category: 'placement', xp: 20 },
  { title: 'Touch Grass', start: '17:05', end: '18:00', category: 'break', xp: 10 },
  { title: 'Nap', start: '18:00', end: '19:15', category: 'nap', xp: 10 },
  { title: 'Mess', start: '19:45', end: '20:20', category: 'meal', xp: 10 },
  { title: 'Puneet SIR', start: '20:00', end: '00:00', category: 'study', xp: 20 }
];

const parseTime = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const JUNE_START = new Date(2026, 5, 2);
export const JUNE_END = new Date(2026, 5, 30);

export const buildTasksForDate = (date: Date): ScheduleTask[] => {
  return scheduleTemplate.map((entry) => {
    const startTime = parseTime(entry.start);
    let endTime = parseTime(entry.end);
    if (endTime === 0) {
      endTime = 24 * 60;
    }
    return {
      id: `${entry.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${entry.start.replace(':', '')}`,
      title: entry.title,
      start: entry.start,
      end: entry.end,
      startTime,
      endTime,
      category: entry.category,
      xp: entry.xp
    };
  });
};

export const getJuneDates = (): Date[] => {
  const dates: Date[] = [];
  for (let day = 2; day <= 30; day += 1) {
    dates.push(new Date(2026, 5, day));
  }
  return dates;
};

export const getTaskDurationMinutes = (task: ScheduleTask) => task.endTime - task.startTime;

export const getCategoryLabel = (category: TaskCategory) => {
  switch (category) {
    case 'study':
      return 'Study';
    case 'revision':
      return 'Revision';
    case 'placement':
      return 'Placement';
    case 'nap':
      return 'Nap';
    case 'meal':
      return 'Meal';
    case 'free':
      return 'Free Time';
    default:
      return 'Break';
  }
};
