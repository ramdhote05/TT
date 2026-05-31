import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import Analytics from './components/Analytics';
import Reports from './components/Reports';
import Settings from './components/Settings';
import { AppState, ScheduleTask, StoredTaskRecord, TaskStatus } from './types';
import { buildTasksForDate, getJuneDates, getTaskDurationMinutes, JUNE_START, JUNE_END } from './data/schedule';
import { defaultAppState, loadAppState, saveAppState, updateTaskRecord } from './lib/storage';

const dateKey = (value: Date) => value.toISOString().slice(0, 10);

const parseTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const getMinutes = (value: Date) => value.getHours() * 60 + value.getMinutes();

const formatClock = (value: Date) => value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const formatDateLabel = (value: Date) => value.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const formatDuration = (seconds: number) => {
  if (seconds <= 0) return '00:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getLevelData = (xp: number) => {
  const thresholds = [0, 100, 250, 500, 1000];
  const level = thresholds.filter((threshold) => xp >= threshold).length;
  const nextThreshold = thresholds.find((threshold) => threshold > xp) ?? thresholds[thresholds.length - 1];
  return { level, nextThreshold };
};

const getCurrentTask = (date: Date, tasks: ScheduleTask[]) => {
  const minute = getMinutes(date);
  return tasks
    .filter((task) => minute >= task.startTime && minute < task.endTime)
    .sort((a, b) => b.startTime - a.startTime)[0] ?? null;
};

const getNextTask = (date: Date, tasks: ScheduleTask[]) => {
  const minute = getMinutes(date);
  return tasks.filter((task) => task.startTime > minute).sort((a, b) => a.startTime - b.startTime)[0] ?? null;
};

const calculateStreaks = (history: AppState['taskHistory']) => {
  const days = getJuneDates();
  let current = 0;
  let best = 0;
  for (const day of days) {
    const key = dateKey(day);
    const recs = history[key] ?? [];
    const completed = recs.filter((record) => record.status === 'completed').length;
    const missed = recs.filter((record) => record.status === 'missed').length;
    const total = 12;
    if (completed >= total * 0.75 && missed === 0) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return { current, best };
};

const App = () => {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    if (today >= JUNE_START && today <= JUNE_END) {
      return today;
    }
    return new Date(2026, 5, 2);
  });
  const [now, setNow] = useState(new Date());
  const [permission, setPermission] = useState<NotificationPermission>(typeof Notification !== 'undefined' ? Notification.permission : 'default');

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const todayTasks = useMemo(() => {
    const dateKeyName = dateKey(now);
    const custom = appState.customTasks[dateKeyName] ?? [];
    return [...buildTasksForDate(now), ...custom].sort((a, b) => a.startTime - b.startTime);
  }, [now, appState.customTasks]);
  const currentTask = getCurrentTask(now, todayTasks);
  const nextTask = getNextTask(now, todayTasks);
  const currentDateKey = dateKey(now);
  const selectedDateKey = dateKey(selectedDate);
  const selectedTasks = useMemo(() => {
    const custom = appState.customTasks[selectedDateKey] ?? [];
    return [...buildTasksForDate(selectedDate), ...custom].sort((a, b) => a.startTime - b.startTime);
  }, [selectedDate, appState.customTasks]);
  const selectedRecords = appState.taskHistory[selectedDateKey] ?? [];

  useEffect(() => {
    if (now < JUNE_START || now > JUNE_END) return;
    const key = currentDateKey;
    const todayRecords = appState.taskHistory[key] ?? [];
    const tasks = buildTasksForDate(now);
    let changed = false;
    const updatedRecords = tasks.reduce<StoredTaskRecord[]>((acc, task) => {
      const existing = todayRecords.find((record) => record.id === task.id);
      const progress = existing ?? { id: task.id, status: 'pending' as TaskStatus, xpEarned: 0 };
      if (getMinutes(now) >= task.endTime && (progress.status === 'pending' || progress.status === 'in_progress')) {
        changed = true;
        return acc.concat({ ...progress, status: 'missed', skippedAt: progress.skippedAt ?? new Date().toISOString() });
      }
      return acc.concat(progress);
    }, []);
    if (changed) {
      setAppState((prev) => ({ ...prev, taskHistory: { ...prev.taskHistory, [key]: updatedRecords } }));
    }
  }, [now, appState.taskHistory, currentDateKey]);

  const getRecord = (dateKeyValue: string, taskId: string) => appState.taskHistory[dateKeyValue]?.find((record) => record.id === taskId);

  const persistRecord = (dateKeyValue: string, record: StoredTaskRecord) => {
    setAppState((prev) => ({ ...prev, taskHistory: updateTaskRecord(prev.taskHistory, dateKeyValue, record) }));
  };

  const saveCustomTasks = (dateKeyValue: string, tasks: ScheduleTask[]) => {
    setAppState((prev) => ({ ...prev, customTasks: { ...prev.customTasks, [dateKeyValue]: tasks } }));
  };

  const generateTaskId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  };

  const addTaskToDate = (newTask: Omit<ScheduleTask, 'id' | 'startTime' | 'endTime'>) => {
    const key = selectedDateKey;
    const task: ScheduleTask = {
      ...newTask,
      id: generateTaskId(),
      startTime: parseTime(newTask.start),
      endTime: parseTime(newTask.end)
    };
    const existing = appState.customTasks[key] ?? [];
    saveCustomTasks(key, [...existing, task].sort((a, b) => a.startTime - b.startTime));
  };

  const removeTaskFromDate = (taskId: string) => {
    const key = selectedDateKey;
    const existing = appState.customTasks[key] ?? [];
    saveCustomTasks(key, existing.filter((task) => task.id !== taskId));
  };

  const playSound = () => {
    if (!appState.soundEnabled || typeof window === 'undefined') return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 520;
      gain.gain.value = 0.05;
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch {
      // Sound not supported
    }
  };

  const sendNotification = (title: string, body: string) => {
    if (!appState.notificationsEnabled || typeof Notification === 'undefined' || permission !== 'granted') return;
    new Notification(title, { body });
    playSound();
  };

  useEffect(() => {
    if (!appState.notificationsEnabled || typeof Notification === 'undefined') return;
    if (permission !== 'granted') return;
    if (!currentTask) return;
    const tag = `${currentDateKey}-${currentTask.id}`;
    if (!appState.notifiedTaskIds.includes(tag)) {
      sendNotification('Task Started', `${currentTask.title} has begun.`);
      setAppState((prev) => ({ ...prev, notifiedTaskIds: [...prev.notifiedTaskIds, tag] }));
    }
    const targetMinute = currentTask.startTime - 5;
    if (targetMinute >= 0) {
      const nowMinutes = getMinutes(now);
      if (nowMinutes === targetMinute) {
        const reminderTag = `${currentDateKey}-${currentTask.id}-reminder`;
        if (!appState.notifiedTaskIds.includes(reminderTag)) {
          sendNotification('Task Starting Soon', `${currentTask.title} starts in 5 minutes.`);
          setAppState((prev) => ({ ...prev, notifiedTaskIds: [...prev.notifiedTaskIds, reminderTag] }));
        }
      }
    }
  }, [currentTask, now, appState.notificationsEnabled, permission, appState.notifiedTaskIds, appState.notifiedTaskIds.length, currentDateKey]);

  const updateRecord = (task: ScheduleTask, status: TaskStatus) => {
    const record = getRecord(selectedDateKey, task.id) ?? { id: task.id, status: 'pending' as TaskStatus, xpEarned: 0 };
    const nowIso = new Date().toISOString();
    const payload: StoredTaskRecord = {
      ...record,
      status,
      xpEarned: status === 'completed' ? task.xp : record.xpEarned,
      startedAt: status === 'in_progress' ? nowIso : record.startedAt,
      completedAt: status === 'completed' ? nowIso : record.completedAt,
      skippedAt: status === 'skipped' ? nowIso : record.skippedAt
    };
    persistRecord(selectedDateKey, payload);
    if (status === 'completed') {
      setAppState((prev) => ({ ...prev, xp: prev.xp + task.xp }));
    }
  };

  const handleStart = (task: ScheduleTask) => updateRecord(task, 'in_progress');
  const handleComplete = (task: ScheduleTask) => updateRecord(task, 'completed');
  const handleSkip = (task: ScheduleTask) => updateRecord(task, 'skipped');

  const currentTaskStatus = currentTask ? getRecord(currentDateKey, currentTask.id)?.status ?? 'pending' : null;
  const remainingLabel = currentTask
    ? formatDuration((currentTask.endTime * 60 - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds())))
    : nextTask
    ? `${nextTask.start} starts soon`
    : 'No upcoming task';

  const completedCount = selectedTasks.filter((task) => getRecord(selectedDateKey, task.id)?.status === 'completed').length;
  const missedCount = selectedTasks.filter((task) => ['missed', 'skipped'].includes(getRecord(selectedDateKey, task.id)?.status ?? 'pending')).length;
  const pendingCount = selectedTasks.length - completedCount - missedCount;
  const completionRate = selectedTasks.length ? (completedCount / selectedTasks.length) * 100 : 0;

  const monthSummary = useMemo(() => {
    const dates = getJuneDates();
    let totalTasks = 0;
    let completed = 0;
    let missed = 0;
    let xp = 0;
    let studyMinutes = 0;
    let revisionMinutes = 0;
    let placementMinutes = 0;
    let breakMinutes = 0;
    let napMinutes = 0;

    const dailySeries = dates.map((day) => {
      const key = dateKey(day);
      const dayTasks = [...buildTasksForDate(day), ...(appState.customTasks[key] ?? [])].sort((a, b) => a.startTime - b.startTime);
      const records = appState.taskHistory[key] ?? [];
      const completedTasks = records.filter((record) => record.status === 'completed').length;
      const missedTasks = records.filter((record) => record.status === 'missed').length;
      const productivity = dayTasks.length ? (completedTasks / dayTasks.length) * 100 : 0;
      totalTasks += dayTasks.length;
      completed += completedTasks;
      missed += missedTasks;
      xp += records.filter((record) => record.status === 'completed').reduce((sum, record) => sum + record.xpEarned, 0);
      dayTasks.forEach((task) => {
        const record = records.find((item) => item.id === task.id);
        if (record?.status === 'completed') {
          const duration = getTaskDurationMinutes(task);
          if (task.category === 'study') studyMinutes += duration;
          if (task.category === 'revision') revisionMinutes += duration;
          if (task.category === 'placement') placementMinutes += duration;
          if (task.category === 'break' || task.category === 'free' || task.category === 'meal') breakMinutes += duration;
          if (task.category === 'nap') napMinutes += duration;
        }
      });
      return { day: day.getDate(), productivity };
    });

    const weeklySeries = [
      { week: 'Week 1', productivity: 0, count: 0 },
      { week: 'Week 2', productivity: 0, count: 0 },
      { week: 'Week 3', productivity: 0, count: 0 },
      { week: 'Week 4', productivity: 0, count: 0 },
      { week: 'Week 5', productivity: 0, count: 0 }
    ];

    dates.forEach((day, index) => {
      const weekIndex = Math.floor(index / 7);
      const key = dateKey(day);
      const dayTasks = [...buildTasksForDate(day), ...(appState.customTasks[key] ?? [])].sort((a, b) => a.startTime - b.startTime);
      const records = appState.taskHistory[key] ?? [];
      const completedTasks = records.filter((record) => record.status === 'completed').length;
      const productivity = dayTasks.length ? (completedTasks / dayTasks.length) * 100 : 0;
      weeklySeries[weekIndex].productivity += productivity;
      weeklySeries[weekIndex].count += 1;
    });

    return {
      dailySeries,
      weeklySeries: weeklySeries.map((week) => ({ week: week.week, productivity: week.count ? week.productivity / week.count : 0 })),
      categorySeries: [
        { name: 'Study', value: studyMinutes / 60 },
        { name: 'Revision', value: revisionMinutes / 60 },
        { name: 'Placement', value: placementMinutes / 60 },
        { name: 'Break', value: breakMinutes / 60 },
        { name: 'Nap', value: napMinutes / 60 }
      ].filter((item) => item.value > 0),
      totalHours: (studyMinutes + revisionMinutes + placementMinutes + breakMinutes + napMinutes) / 60,
      studyHours: studyMinutes / 60,
      revisionHours: revisionMinutes / 60,
      placementHours: placementMinutes / 60,
      breakHours: breakMinutes / 60,
      napHours: napMinutes / 60,
      monthlyProductivity: dailySeries.reduce((sum, item) => sum + item.productivity, 0) / dailySeries.length,
      totalTasks,
      completed,
      missed,
      xp
    };
  }, [appState.taskHistory, appState.customTasks]);

  const streaks = useMemo(() => calculateStreaks(appState.taskHistory), [appState.taskHistory]);
  const { level, nextThreshold } = getLevelData(appState.xp);
  const nextLevelXP = Math.max(nextThreshold, appState.xp);

  const handleNotificationsToggle = async () => {
    if (typeof Notification === 'undefined') return;
    if (permission !== 'granted') {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') {
        return;
      }
    }
    setAppState((prev) => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
  };

  const handleSoundToggle = () => setAppState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));

  const dailyProductivity = completionRate;

  return (
    <BrowserRouter>
      <div className="min-h-screen px-4 py-6 md:px-8 lg:px-12">
        <div className="max-w-[1600px] mx-auto">
          <header className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">June 2-30 2026 Task Manager</p>
            <h1 className="mt-4 text-5xl font-semibold text-white">Real-Time Daily Productivity Dashboard</h1>
            <p className="mx-auto mt-3 max-w-2xl text-slate-300">Live routine tracking, analytics, calendar history, XP, badges, and export tools for every day from June 2 to June 30.</p>
          </header>

          <Navigation />

          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  currentTime={formatClock(now)}
                  currentDate={formatDateLabel(now)}
                  dateRangeLabel="June 2 - 30, 2026"
                  currentTask={currentTask}
                  nextTask={nextTask}
                  currentTaskStatus={currentTaskStatus}
                  remainingLabel={remainingLabel}
                  tasks={selectedTasks}
                  records={selectedRecords}
                  onStart={handleStart}
                  onComplete={handleComplete}
                  onSkip={handleSkip}
                  customTasks={appState.customTasks[selectedDateKey] ?? []}
                  onAddTask={addTaskToDate}
                  onRemoveTask={removeTaskFromDate}
                  xp={appState.xp}
                  level={level}
                  nextLevelXP={nextLevelXP}
                  completionRate={completionRate}
                  completedCount={completedCount}
                  pendingCount={pendingCount}
                  missedCount={missedCount}
                  currentStreak={streaks.current}
                  bestStreak={streaks.best}
                />
              }
            />
            <Route
              path="/calendar"
              element={
                <CalendarView
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  history={appState.taskHistory}
                  tasks={selectedTasks}
                  records={selectedRecords}
                />
              }
            />
            <Route
              path="/analytics"
              element={
                <Analytics
                  dailySeries={monthSummary.dailySeries}
                  weeklySeries={monthSummary.weeklySeries}
                  categorySeries={monthSummary.categorySeries}
                  totalHours={monthSummary.totalHours}
                  studyHours={monthSummary.studyHours}
                  revisionHours={monthSummary.revisionHours}
                  placementHours={monthSummary.placementHours}
                  breakHours={monthSummary.breakHours}
                  napHours={monthSummary.napHours}
                  monthlyProductivity={monthSummary.monthlyProductivity}
                />
              }
            />
            <Route
              path="/reports"
              element={
                <Reports
                  selectedDate={selectedDate}
                  history={appState.taskHistory}
                  tasks={selectedTasks}
                  dailyProductivity={dailyProductivity}
                  monthlySummary={{
                    totalTasks: monthSummary.totalTasks,
                    completed: monthSummary.completed,
                    missed: monthSummary.missed,
                    xp: appState.xp,
                    productivity: monthSummary.monthlyProductivity
                  }}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <Settings
                  notificationsEnabled={appState.notificationsEnabled}
                  soundEnabled={appState.soundEnabled}
                  onToggleNotifications={handleNotificationsToggle}
                  onToggleSound={handleSoundToggle}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
