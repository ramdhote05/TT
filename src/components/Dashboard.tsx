import { motion } from 'framer-motion';
import { FormEvent, useState } from 'react';
import { ScheduleTask, StoredTaskRecord, TaskStatus, TaskCategory } from '../types';

interface DashboardProps {
  currentTime: string;
  currentDate: string;
  dateRangeLabel: string;
  currentTask: ScheduleTask | null;
  nextTask: ScheduleTask | null;
  currentTaskStatus: TaskStatus | null;
  remainingLabel: string;
  tasks: ScheduleTask[];
  records: StoredTaskRecord[];
  onStart: (task: ScheduleTask) => void;
  onComplete: (task: ScheduleTask) => void;
  onSkip: (task: ScheduleTask) => void;
  xp: number;
  level: number;
  nextLevelXP: number;
  completionRate: number;
  completedCount: number;
  pendingCount: number;
  missedCount: number;
  currentStreak: number;
  bestStreak: number;
  customTasks: ScheduleTask[];
  onAddTask: (task: Omit<ScheduleTask, 'id' | 'startTime' | 'endTime'>) => void;
  onRemoveTask: (taskId: string) => void;
}

const statusLabel = (status: TaskStatus) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'missed':
      return 'Missed';
    case 'skipped':
      return 'Skipped';
    case 'in_progress':
      return 'In Progress';
    default:
      return 'Pending';
  }
};

const categoryOptions: TaskCategory[] = ['study', 'revision', 'placement', 'break', 'nap', 'meal', 'free'];

const Dashboard = ({
  currentTime,
  currentDate,
  dateRangeLabel,
  currentTask,
  nextTask,
  currentTaskStatus,
  remainingLabel,
  tasks,
  records,
  onStart,
  onComplete,
  onSkip,
  xp,
  level,
  nextLevelXP,
  completionRate,
  completedCount,
  pendingCount,
  missedCount,
  currentStreak,
  bestStreak,
  customTasks,
  onAddTask,
  onRemoveTask
}: DashboardProps) => {
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('09:00');
  const [newCategory, setNewCategory] = useState<TaskCategory>('study');
  const [newXP, setNewXP] = useState(15);

  const handleAddTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTitle.trim() || !newStart || !newEnd || newStart >= newEnd) return;
    onAddTask({ title: newTitle.trim(), start: newStart, end: newEnd, category: newCategory, xp: newXP });
    setNewTitle('');
    setNewStart('08:00');
    setNewEnd('09:00');
    setNewCategory('study');
    setNewXP(15);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Current Date</p>
          <p className="mt-3 text-3xl font-semibold text-white">{currentDate}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Schedule Range</p>
          <p className="mt-3 text-3xl font-semibold text-neon">{dateRangeLabel}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Current Time</p>
          <p className="mt-3 text-3xl font-semibold text-neon">{currentTime}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Today&apos;s Goal</p>
          <p className="mt-3 text-3xl font-semibold text-white">{completionRate.toFixed(0)}%</p>
          <p className="mt-2 text-sm text-slate-300">{completedCount} / {tasks.length} completed</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Level</p>
          <p className="mt-3 text-3xl font-semibold text-neon">{level}</p>
          <p className="mt-2 text-sm text-slate-300">{xp}/{nextLevelXP} XP</p>
        </motion.div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Active Task</p>
              <p className="mt-2 text-2xl font-semibold text-white">{currentTask?.title ?? 'No active task'}</p>
              <p className="mt-1 text-sm text-slate-300">{currentTask ? `${currentTask.start} - ${currentTask.end}` : 'Waiting for next task'}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/30 px-4 py-3 text-right shadow-glow">
              <p className="text-xs uppercase text-slate-400">Remaining</p>
              <p className="mt-2 text-xl font-semibold text-neon">{remainingLabel}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-xs uppercase text-slate-400">Status</p>
              <p className="mt-2 text-lg font-semibold">{statusLabel(currentTaskStatus ?? 'pending')}</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-xs uppercase text-slate-400">Next Task</p>
              <p className="mt-2 text-lg font-semibold">{nextTask?.title ?? 'None soon'}</p>
              <p className="mt-1 text-sm text-slate-300">{nextTask ? `${nextTask.start} - ${nextTask.end}` : ''}</p>
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Summary</p>
          <div className="mt-5 grid gap-4">
            {[
              { title: 'Completed', value: completedCount },
              { title: 'Pending', value: pendingCount },
              { title: 'Missed', value: missedCount },
              { title: 'Current Streak', value: currentStreak }
            ].map((item) => (
              <div key={item.title} className="rounded-3xl bg-white/5 p-4">
                <p className="text-sm text-slate-400">{item.title}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-3xl bg-slate-950/50 p-4">
            <p className="text-sm text-slate-400">Best Streak</p>
            <p className="mt-2 text-2xl font-semibold text-neon">{bestStreak} days</p>
          </div>
        </motion.section>
      </div>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Task List</p>
            <p className="mt-2 text-lg text-white">Manage each task for the selected day</p>
          </div>
          <div className="rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-xs uppercase text-slate-300">Live</div>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => {
            const record = records.find((item) => item.id === task.id);
            const status = record?.status ?? 'pending';
            return (
              <div key={task.id} className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-300">{task.start} - {task.end} • {task.xp} XP • {task.category}</p>
                  <p className="mt-2 text-sm text-slate-400">Status: {statusLabel(status)}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 sm:mt-0">
                  <button type="button" onClick={() => onStart(task)} className="btn-3d bg-neon text-slate-950">Start</button>
                  <button type="button" onClick={() => onComplete(task)} className="btn-3d bg-emerald-500 text-slate-950">Complete</button>
                  <button type="button" onClick={() => onSkip(task)} className="btn-3d bg-rose-500 text-slate-950">Skip</button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Custom Tasks</p>
            <p className="mt-2 text-lg text-white">Add or remove tasks for this date</p>
          </div>
          <div className="rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-xs uppercase text-slate-300">Editable</div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            {customTasks.length ? customTasks.map((task) => (
              <div key={task.id} className="rounded-3xl border border-white/10 bg-slate-950/30 p-4 flex flex-col gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-300">{task.start} - {task.end} • {task.category} • {task.xp} XP</p>
                </div>
                <button type="button" onClick={() => onRemoveTask(task.id)} className="btn-3d w-full bg-rose-500 text-slate-950">Remove Task</button>
              </div>
            )) : (
              <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5 text-slate-300">No custom tasks for this day yet.</div>
            )}
          </div>

          <form onSubmit={handleAddTask} className="rounded-3xl border border-white/10 bg-slate-950/30 p-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-200">Task Title</label>
              <input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-neon" placeholder="New task title" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-200">Start</label>
                <input type="time" value={newStart} onChange={(event) => setNewStart(event.target.value)} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-neon" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-200">End</label>
                <input type="time" value={newEnd} onChange={(event) => setNewEnd(event.target.value)} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-neon" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-200">Category</label>
                <select value={newCategory} onChange={(event) => setNewCategory(event.target.value as TaskCategory)} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-neon">
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-200">XP Value</label>
                <input type="number" min="5" max="100" value={newXP} onChange={(event) => setNewXP(Number(event.target.value))} className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition focus:border-neon" />
              </div>
            </div>
            <button type="submit" className="btn-3d w-full bg-neon text-slate-950">Add Custom Task</button>
          </form>
        </div>
      </motion.section>
    </div>
  );
};

export default Dashboard;
