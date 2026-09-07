import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Flame,
  Award,
  TrendingUp,
  Tag,
  Download,
  Upload,
  Copy,
  Check,
  Calendar,
  Zap,
  Trash2,
  Target,
  RotateCw
} from 'lucide-react';
import { TaskItem, FocusSession } from '../types';
import { GoalCelebration } from './GoalCelebration';

interface InsightsViewProps {
  tasks: TaskItem[];
  completedSessions: number;
  dailyGoal: number;
  sessionHistory: FocusSession[];
  onUpdateDailyGoal?: (newGoal: number) => void;
  onClearCompleted: () => void;
  onClearSessionHistory: () => void;
  onImportBackup: (backup: { tasks?: TaskItem[]; sessionHistory?: FocusSession[]; dailyGoal?: number }) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  tasks,
  completedSessions,
  dailyGoal,
  sessionHistory,
  onUpdateDailyGoal,
  onClearCompleted,
  onClearSessionHistory,
  onImportBackup,
}) => {
  const [copied, setCopied] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.isCompleted).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const goalProgressRate = dailyGoal > 0 ? Math.min(100, Math.round((completedSessions / dailyGoal) * 100)) : 0;

  // Overdue count with safe local date parser
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parseLocalDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date(dateStr);
  };

  const overdueCount = tasks.filter((t) => {
    if (t.isCompleted || !t.dueDate) return false;
    const due = parseLocalDate(t.dueDate);
    if (!due) return false;
    due.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  }).length;

  const totalFocusMinutes = sessionHistory
    .filter((s) => s.type === 'focus')
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const categoryCounts = {
    WORK: tasks.filter((t) => t.category === 'WORK').length,
    PERSONAL: tasks.filter((t) => t.category === 'PERSONAL').length,
    STUDY: tasks.filter((t) => t.category === 'STUDY').length,
    HEALTH: tasks.filter((t) => t.category === 'HEALTH').length,
  };

  const priorityCounts = {
    HIGH: tasks.filter((t) => t.priority === 'HIGH').length,
    MEDIUM: tasks.filter((t) => t.priority === 'MEDIUM').length,
    LOW: tasks.filter((t) => t.priority === 'LOW').length,
  };

  // Export Markdown Summary
  const handleCopyMarkdown = () => {
    const lines = [
      `# 📋 Task & Focus Daily Summary (${new Date().toLocaleDateString()})`,
      '',
      `**Progress:** ${completed}/${total} Tasks Completed (${completionRate}%)`,
      `**Daily Goal:** ${completedSessions}/${dailyGoal} Sessions (${goalProgressRate}%)`,
      `**Total Focus:** ${totalFocusMinutes} minutes`,
      '',
      '### ✅ Completed Tasks:',
      ...(tasks.filter((t) => t.isCompleted).length > 0
        ? tasks.filter((t) => t.isCompleted).map((t) => `- [x] ${t.title} (${t.category})`)
        : ['- None completed yet']),
      '',
      '### ⏳ Pending Tasks:',
      ...(tasks.filter((t) => !t.isCompleted).length > 0
        ? tasks.filter((t) => !t.isCompleted).map((t) => `- [ ] ${t.title} [${t.priority}] ${t.dueDate ? `(Due: ${t.dueDate})` : ''}`)
        : ['- All tasks completed! 🎉']),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export JSON Full Workspace Backup
  const handleExportJSON = () => {
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks,
      sessionHistory,
      dailyGoal,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `task-hub-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON with backward compatibility
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Legacy tasks list
          onImportBackup({ tasks: parsed });
          setImportMessage({ type: 'success', text: `Imported ${parsed.length} tasks successfully!` });
        } else if (parsed && typeof parsed === 'object') {
          // Structured backup format
          const importedTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
          const importedHistory = Array.isArray(parsed.sessionHistory) ? parsed.sessionHistory : undefined;
          const importedGoal = typeof parsed.dailyGoal === 'number' ? parsed.dailyGoal : undefined;

          onImportBackup({
            tasks: importedTasks,
            sessionHistory: importedHistory,
            dailyGoal: importedGoal,
          });
          setImportMessage({
            type: 'success',
            text: `Workspace restored: ${importedTasks.length} tasks loaded!`,
          });
        } else {
          setImportMessage({ type: 'error', text: 'Invalid format: Expected valid JSON backup file' });
        }
      } catch (err) {
        setImportMessage({ type: 'error', text: 'Failed to parse JSON file' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Goal Hit Celebration & Incremental Increase Banner (Micro-Interaction) */}
      <GoalCelebration
        completedSessions={completedSessions}
        dailyGoal={dailyGoal}
        onUpdateDailyGoal={onUpdateDailyGoal}
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Tasks
            </span>
            <Tag className="w-4 h-4" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {total}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completed
            </span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {completed}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending
            </span>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {pending}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Focus Time
            </span>
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {totalFocusMinutes > 0 ? `${totalFocusMinutes}m` : `${completedSessions} blk`}
          </span>
        </div>
      </div>

      {/* Progress & Overdue Warning */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          {/* Task Completion Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Task Completion Rate</h4>
              </div>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                {completionRate}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 rounded-full"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{completed} of {total} tasks marked done</span>
              {overdueCount > 0 && (
                <span className="text-rose-500 font-bold flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {overdueCount} overdue {overdueCount === 1 ? 'task' : 'tasks'}
                </span>
              )}
            </div>
          </div>

          {/* Daily Focus Goal Progress */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Target className={`w-4 h-4 ${completedSessions >= dailyGoal ? 'text-amber-500 animate-bounce' : 'text-emerald-500'}`} />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Daily Focus Goal Progress</h4>
              </div>
              <div className="flex items-center space-x-2">
                {completedSessions >= dailyGoal && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
                    Goal Met 🎉
                  </span>
                )}
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {goalProgressRate}%
                </span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  completedSessions >= dailyGoal
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                }`}
                style={{ width: `${goalProgressRate}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{completedSessions} of {dailyGoal} target sessions logged</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {completedSessions >= dailyGoal ? 'Goal Achieved! 🎯' : `${dailyGoal - completedSessions} remaining`}
              </span>
            </div>
          </div>
        </div>

        {/* Quick cleanup actions box */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center">
              <Zap className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Workspace Cleanup
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your tasks and focus logs to keep your daily view clutter-free.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={onClearCompleted}
              disabled={completed === 0}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Completed ({completed})</span>
            </button>

            <button
              onClick={onClearSessionHistory}
              disabled={sessionHistory.length === 0}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reset Focus History ({sessionHistory.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Breakdown grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Category Distribution</h4>
          <div className="space-y-3">
            {[
              { label: 'Work', count: categoryCounts.WORK, color: 'bg-blue-500' },
              { label: 'Personal', count: categoryCounts.PERSONAL, color: 'bg-emerald-500' },
              { label: 'Study', count: categoryCounts.STUDY, color: 'bg-purple-500' },
              { label: 'Health', count: categoryCounts.HEALTH, color: 'bg-rose-500' },
            ].map((cat) => (
              <div key={cat.label} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{cat.label}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{cat.count} tasks</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Priority Breakdown</h4>
          <div className="space-y-3">
            {[
              { label: 'High Priority', count: priorityCounts.HIGH, color: 'bg-amber-500' },
              { label: 'Medium Priority', count: priorityCounts.MEDIUM, color: 'bg-indigo-500' },
              { label: 'Low Priority', count: priorityCounts.LOW, color: 'bg-slate-400' },
            ].map((pri) => (
              <div key={pri.label} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${pri.color}`} />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{pri.label}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{pri.count} tasks</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Export & Backup Tools */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
          Data Sharing & Backup
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Export your tasks to Markdown for standups or download a full JSON backup of your workspace.
        </p>

        {importMessage && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
              importMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <span>{importMessage.text}</span>
            <button
              onClick={() => setImportMessage(null)}
              className="text-slate-400 hover:text-slate-600 ml-2"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Markdown Summary'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Motivational Badge Banner */}
      <div className="bg-gradient-to-tr from-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-md flex items-center space-x-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center flex-shrink-0">
          <Award className="w-6 h-6 text-amber-300" />
        </div>
        <div>
          <h5 className="text-sm font-bold">
            {completionRate >= 80
              ? 'Outstanding Progress!'
              : completionRate >= 40
              ? 'Steady Momentum'
              : 'Ready to Tackle the Day'}
          </h5>
          <p className="text-xs text-slate-300 mt-0.5">
            {completionRate >= 80
              ? 'You have completed most of your tasks today. Keep up the high efficiency!'
              : 'Small consistent focus sessions build unstoppable momentum.'}
          </p>
        </div>
      </div>
    </div>
  );
};
