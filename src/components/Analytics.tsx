import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, Cell, PieChart, Pie, Tooltip, Legend } from 'recharts';

interface AnalyticsProps {
  dailySeries: Array<{ day: number; productivity: number }>;
  weeklySeries: Array<{ week: string; productivity: number }>;
  categorySeries: Array<{ name: string; value: number }>;
  totalHours: number;
  studyHours: number;
  revisionHours: number;
  placementHours: number;
  breakHours: number;
  napHours: number;
  monthlyProductivity: number;
}

const COLORS = ['#39C5FF', '#7C3AED', '#22C55E', '#F59E0B', '#F97316', '#F43F5E'];

const Analytics = ({
  dailySeries,
  weeklySeries,
  categorySeries,
  totalHours,
  studyHours,
  revisionHours,
  placementHours,
  breakHours,
  napHours,
  monthlyProductivity
}: AnalyticsProps) => {
  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Productivity Analytics</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">June 2026 Overview</h2>
          </div>
          <div className="rounded-3xl bg-slate-950/40 px-4 py-3 text-sm text-slate-300">Monthly Productivity {monthlyProductivity.toFixed(1)}%</div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-card p-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Daily Productivity</p>
            <div className="h-72 mt-5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySeries} margin={{ top: 5, right: 15, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#020617', borderRadius: 16, borderColor: '#1e293b' }} />
                  <Line type="monotone" dataKey="productivity" stroke="#39C5FF" strokeWidth={3} dot={{ r: 4, fill: '#7dd3fc' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Weekly Productivity</p>
            <div className="h-72 mt-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySeries} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#020617', borderRadius: 16, borderColor: '#1e293b' }} />
                  <Bar dataKey="productivity" fill="#7c3aed">
                    {weeklySeries.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Category Costs</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Time Distribution</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-300">Total Hours {totalHours.toFixed(1)}</div>
            <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-300">Study {studyHours.toFixed(1)}</div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_0.45fr]">
          <div className="glass-card p-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categorySeries} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                    {categorySeries.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#020617', borderRadius: 16, borderColor: '#1e293b' }} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Revision Hours</p>
              <p className="mt-2 text-3xl font-semibold text-white">{revisionHours.toFixed(1)}</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Placement Hours</p>
              <p className="mt-2 text-3xl font-semibold text-white">{placementHours.toFixed(1)}</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Nap + Break Hours</p>
              <p className="mt-2 text-3xl font-semibold text-white">{(breakHours + napHours).toFixed(1)}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Analytics;
