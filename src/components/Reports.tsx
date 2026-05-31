import { jsPDF } from 'jspdf';
import { ScheduleTask, StoredTaskRecord } from '../types';

interface ReportsProps {
  selectedDate: Date;
  history: Record<string, StoredTaskRecord[]>;
  tasks: ScheduleTask[];
  dailyProductivity: number;
  monthlySummary: { totalTasks: number; completed: number; missed: number; xp: number; productivity: number };
}

const makeCsv = (labels: string[], rows: string[][]) => {
  const headers = labels.join(',');
  const body = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
  return `${headers}\n${body}`;
};

const Reports = ({ selectedDate, history, tasks, dailyProductivity, monthlySummary }: ReportsProps) => {
  const dateKey = selectedDate.toISOString().slice(0, 10);
  const records = history[dateKey] || [];

  const exportCsv = () => {
    const rows = tasks.map((task) => {
      const record = records.find((item) => item.id === task.id);
      return [task.title, `${task.start} - ${task.end}`, task.category, record?.status ?? 'pending', `${record?.xpEarned ?? 0}`];
    });
    const csv = makeCsv(['Task', 'Schedule', 'Category', 'Status', 'XP Earned'], rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `june-2026-report-${dateKey}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(20);
    doc.setTextColor('#39C5FF');
    doc.text('June 2026 Productivity Report', 40, 50);
    doc.setFontSize(12);
    doc.setTextColor('#ffffff');
    doc.text(`Date: ${selectedDate.toDateString()}`, 40, 80);
    doc.text(`Daily Productivity: ${dailyProductivity.toFixed(0)}%`, 40, 100);
    doc.text(`Monthly Productivity: ${monthlySummary.productivity.toFixed(0)}%`, 40, 120);
    doc.text(`Total Tasks: ${monthlySummary.totalTasks}`, 40, 140);
    doc.text(`Completed: ${monthlySummary.completed}`, 40, 160);
    doc.text(`Missed: ${monthlySummary.missed}`, 40, 180);
    doc.text(`Total XP: ${monthlySummary.xp}`, 40, 200);
    doc.text('Task History', 40, 240);

    const startY = 270;
    let y = startY;
    doc.setFontSize(10);
    tasks.forEach((task) => {
      const record = records.find((item) => item.id === task.id);
      if (y > 720) {
        doc.addPage();
        y = 60;
      }
      doc.text(`${task.title} | ${task.start}-${task.end} | ${task.category} | ${record?.status ?? 'pending'} | XP ${record?.xpEarned ?? 0}`, 40, y);
      y += 18;
    });

    doc.save(`june-2026-report-${dateKey}.pdf`);
  };

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Reports</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Export your progress</h2>
          </div>
          <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-300">PDF + CSV supported</div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-slate-950/50 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Active export date</p>
            <p className="mt-3 text-2xl font-semibold text-white">{selectedDate.toDateString()}</p>
            <p className="mt-2 text-sm text-slate-300">Daily productivity {dailyProductivity.toFixed(0)}%</p>
          </div>
          <div className="rounded-3xl bg-slate-950/50 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Month summary</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>Total Tasks: {monthlySummary.totalTasks}</li>
              <li>Completed: {monthlySummary.completed}</li>
              <li>Missed: {monthlySummary.missed}</li>
              <li>XP Earned: {monthlySummary.xp}</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="button" onClick={exportCsv} className="btn-3d bg-neon text-slate-950">Export CSV</button>
          <button type="button" onClick={exportPdf} className="btn-3d bg-violet-600 text-white">Export PDF</button>
        </div>
      </section>
    </div>
  );
};

export default Reports;
