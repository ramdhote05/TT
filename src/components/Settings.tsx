interface SettingsProps {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  onToggleNotifications: () => void;
  onToggleSound: () => void;
}

const Settings = ({ notificationsEnabled, soundEnabled, onToggleNotifications, onToggleSound }: SettingsProps) => {
  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <h2 className="text-3xl font-semibold text-white">Settings</h2>
        <p className="mt-2 text-slate-300">Customize browser alerts, audio feedback, and local storage features.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-950/50 p-5">
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            <p className="mt-2 text-sm text-slate-400">Receive alerts when a task is about to start, begins, or is missed.</p>
            <button type="button" onClick={onToggleNotifications} className="btn-3d mt-4 bg-neon text-slate-950">
              {notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
            </button>
          </div>

          <div className="rounded-3xl bg-slate-950/50 p-5">
            <h3 className="text-lg font-semibold text-white">Sound Alerts</h3>
            <p className="mt-2 text-sm text-slate-400">Enable sound feedback for live task transitions and reminders.</p>
            <button type="button" onClick={onToggleSound} className="btn-3d mt-4 bg-violet-600 text-white">
              {soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            </button>
          </div>
        </div>
      </section>

      <section className="glass-card p-6">
        <h3 className="text-xl font-semibold text-white">App Tips</h3>
        <ul className="mt-4 space-y-3 text-slate-300">
          <li>• Click a calendar date to review that day&apos;s tasks and progress.</li>
          <li>• Complete tasks to earn XP and unlock achievement badges.</li>
          <li>• Use the report tools to export CSV and PDF summaries for June 2026.</li>
        </ul>
      </section>
    </div>
  );
};

export default Settings;
