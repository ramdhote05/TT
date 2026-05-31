import Calendar from 'react-calendar';
import { ScheduleTask, StoredTaskRecord } from '../types';
import { buildTasksForDate, getJuneDates, JUNE_START, JUNE_END, getTaskDurationMinutes } from '../data/schedule';

interface CalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  history: Record<string, StoredTaskRecord[]>;
  tasks: ScheduleTask[];
  records: StoredTaskRecord[];
}

const dateKey = (value: Date) => value.toISOString().slice(0, 10);

const CalendarView = ({ selectedDate, onDateChange, history, tasks, records }: CalendarViewProps) => {
  const today = new Date();
  const entries = getJuneDates().map((day) => {
    const key = dateKey(day);
    const dayRecords = history[key] || [];
    const completed = dayRecords.filter((item) => item.status === 'completed').length;
    const missed = dayRecords.filter((item) => item.status === 'missed').length;
    const total = tasks.length;
    return { key, day, completed, missed, total };
  });

  const tileClassName = ({ date }: { date: Date }) => {
    if (date < JUNE_START || date > JUNE_END) {
      return '';
    }
    const key = dateKey(date);
    const dayRecords = history[key] || [];
    const missed = dayRecords.some((item) => item.status === 'missed');
    const inProgress = dayRecords.some((item) => item.status === 'in_progress');
    const completed = dayRecords.filter((item) => item.status === 'completed').length;
    const total = buildTasksForDate(date).length;
    if (date > today) {
      return 'tile-future';
    }
    if (missed) {
      return 'tile-missed';
    }
    if (inProgress) {
      return 'tile-active';
    }
    if (completed === total && total > 0) {
      return 'tile-completed';
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <section className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">June 2026</p>
            <h3 className="mt-1 text-2xl font-medium text-white">Calendar</h3>
          </div>
          <div className="text-sm text-slate-400">Tap a date to inspect</div>
        </div>

        <div className="mt-4">
          <Calendar
            value={selectedDate}
            onChange={(value) => onDateChange(value as Date)}
            tileClassName={tileClassName}
            minDate={JUNE_START}
            maxDate={JUNE_END}
            showNeighboringMonth={false}
          />
        </div>

        <div className="mt-4 flex gap-3 items-center text-sm text-slate-400">
          <div className="flex items-center gap-2"><span className="legend-dot bg-emerald-300" /> Completed</div>
          <div className="flex items-center gap-2"><span className="legend-dot bg-amber-300" /> In progress</div>
          <div className="flex items-center gap-2"><span className="legend-dot bg-rose-300" /> Missed</div>
          <div className="flex items-center gap-2"><span className="legend-dot bg-slate-400" /> Future</div>
        </div>
      </section>

      <section className="glass-card p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Tasks for {selectedDate.toDateString()}</p>
        <div className="mt-4 space-y-3">
          {tasks.map((task) => {
            const record = records.find((item) => item.id === task.id);
            const status = record?.status ?? 'pending';
            return (
              <div key={task.id} className="rounded-lg border border-white/6 bg-transparent p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.start} • {task.end}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.12em] text-slate-400">{status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default CalendarView;
