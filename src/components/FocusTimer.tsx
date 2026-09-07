import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  CheckCircle2,
  Coffee,
  Clock,
  Music,
  Target,
  Plus,
  Minus,
  Trophy,
  Check,
  ChevronDown,
  XCircle,
  RotateCw,
  Bell,
  Volume2,
  VolumeX,
  Zap,
  Settings2
} from 'lucide-react';
import { FocusSession, TaskItem } from '../types';
import { soundManager } from '../utils/audio';

interface FocusTimerProps {
  durationMinutes: number;
  secondsLeft: number;
  isRunning: boolean;
  mode: 'focus' | 'break';
  ambientSound: boolean;
  autoStartBreak: boolean;
  breakDurationMinutes: number;
  soundMuted: boolean;
  completedSessions: number;
  dailyGoal: number;
  sessionHistory: FocusSession[];
  tasks: TaskItem[];
  activeFocusTaskId: string | null;
  onDurationSelect: (mins: number, isBreak?: boolean) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onToggleAmbient: (soundscape?: 'rain' | 'forest' | 'cafe') => void;
  onToggleMute: () => void;
  onToggleAutoStartBreak: (enabled: boolean) => void;
  onSetBreakDuration: (mins: number) => void;
  onSelectFocusTask: (taskId: string | null) => void;
  onToggleTask: (id: string) => void;
  onUpdateDailyGoal: (goal: number) => void;
  onResetHistory: () => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  durationMinutes,
  secondsLeft,
  isRunning,
  mode,
  ambientSound,
  autoStartBreak,
  breakDurationMinutes,
  soundMuted,
  completedSessions,
  dailyGoal,
  sessionHistory,
  tasks,
  activeFocusTaskId,
  onDurationSelect,
  onToggleTimer,
  onResetTimer,
  onToggleAmbient,
  onToggleMute,
  onToggleAutoStartBreak,
  onSetBreakDuration,
  onSelectFocusTask,
  onToggleTask,
  onUpdateDailyGoal,
  onResetHistory,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState(dailyGoal.toString());
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [selectedSoundscape, setSelectedSoundscape] = useState<'rain' | 'forest' | 'cafe'>('rain');
  const [notificationStatus, setNotificationStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const activeTask = tasks.find((t) => t.id === activeFocusTaskId);
  const pendingTasks = tasks.filter((t) => !t.isCompleted);

  const handleRequestNotification = async () => {
    const granted = await soundManager.requestNotificationPermission();
    setNotificationStatus(granted ? 'granted' : 'denied');
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val > 0 && val <= 180) {
      onDurationSelect(val, mode === 'break');
      setShowCustomModal(false);
      setCustomInput('');
    }
  };

  const handleApplyGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(goalInput, 10);
    if (!isNaN(val) && val >= 1 && val <= 50) {
      onUpdateDailyGoal(val);
      setShowGoalModal(false);
    }
  };

  const adjustGoal = (delta: number) => {
    const next = Math.max(1, Math.min(30, dailyGoal + delta));
    onUpdateDailyGoal(next);
  };

  const totalSeconds = durationMinutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Daily Goal Calculations
  const isGoalReached = completedSessions >= dailyGoal;
  const goalPercentage = dailyGoal > 0 ? Math.min(100, Math.round((completedSessions / dailyGoal) * 100)) : 0;
  const remainingSessions = Math.max(0, dailyGoal - completedSessions);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Mode Switcher & Controls Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex space-x-1 border border-slate-200/60 dark:border-slate-700/60 shadow-sm w-full sm:w-auto">
          <button
            onClick={() => onDurationSelect(25, false)}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'focus'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Deep Focus</span>
          </button>
          <button
            onClick={() => onDurationSelect(breakDurationMinutes, true)}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              mode === 'break'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Short Break ({breakDurationMinutes}m)</span>
          </button>
        </div>

        {/* Quick Sound and Setting Buttons */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
              soundMuted
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
            title={soundMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onToggleAmbient(selectedSoundscape)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              ambientSound
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
            title="Toggle ambient focus tone"
          >
            <Music className="w-3.5 h-3.5" />
            <span>Ambient: {ambientSound ? 'On' : 'Off'}</span>
          </button>

          <select
            value={selectedSoundscape}
            onChange={(e) => {
                const s = e.target.value as 'rain' | 'forest' | 'cafe';
                setSelectedSoundscape(s);
                if (ambientSound) onToggleAmbient(s);
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="rain">Rain</option>
            <option value="forest">Forest</option>
            <option value="cafe">Cafe</option>
          </select>

          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
              showSettingsDrawer || autoStartBreak
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
            title="Timer Settings & Auto-Break"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Auto-Break & Notification Settings Panel */}
      {showSettingsDrawer && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-indigo-200 dark:border-indigo-800/80 shadow-md animate-in fade-in space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Focus & Break Automation
              </h4>
            </div>
            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Auto Start Short Break Toggle */}
            <div className="flex flex-col justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Auto-Start Short Break
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoStartBreak}
                      onChange={(e) => onToggleAutoStartBreak(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Automatically starts a {breakDurationMinutes}-minute rest timer right after a focus session completes.
                </p>
              </div>

              {/* Break Duration Selector */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Break Length:
                </span>
                <div className="flex gap-1.5">
                  {[3, 5, 10, 15].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => onSetBreakDuration(mins)}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all ${
                        breakDurationMinutes === mins
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Notifications */}
            <div className="flex flex-col justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
              <div>
                <div className="flex items-center space-x-1.5 mb-1">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Desktop Notifications
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Receive gentle system alerts when sessions or breaks conclude even when in another window.
                </p>
              </div>

              <div>
                {notificationStatus === 'granted' ? (
                  <div className="flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Notifications Enabled</span>
                  </div>
                ) : (
                  <button
                    onClick={handleRequestNotification}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                  >
                    Enable Browser Notifications
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Focused Task Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex-shrink-0">
              Focusing on:
            </span>
            {activeTask ? (
              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate">
                  {activeTask.title}
                </span>
                <button
                  onClick={() => onToggleTask(activeTask.id)}
                  className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 flex items-center space-x-1 transition-colors flex-shrink-0"
                  title="Mark task done"
                >
                  <Check className="w-3 h-3" />
                  <span>Done</span>
                </button>
                <button
                  onClick={() => onSelectFocusTask(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0"
                  title="Clear task"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400 italic truncate">
                No task selected (general focus session)
              </span>
            )}
          </div>

          <div className="relative ml-2">
            <button
              onClick={() => setShowTaskSelector(!showTaskSelector)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center space-x-1"
            >
              <span>{activeTask ? 'Change Task' : 'Select Task'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showTaskSelector && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-30 max-h-56 overflow-y-auto">
                <p className="text-[11px] font-bold text-slate-400 uppercase px-2 py-1">Pending Tasks</p>
                {pendingTasks.length > 0 ? (
                  pendingTasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectFocusTask(t.id);
                        setShowTaskSelector(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-xl truncate transition-colors ${
                        t.id === activeFocusTaskId
                          ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t.title}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 p-2 italic">No pending tasks found</p>
                )}
                {activeTask && (
                  <button
                    onClick={() => {
                      onSelectFocusTask(null);
                      setShowTaskSelector(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold mt-1 border-t border-slate-100 dark:border-slate-800"
                  >
                    Clear Selected Task
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auto Break Indicator Banner */}
      {autoStartBreak && mode === 'focus' && (
        <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Auto-Break active: {breakDurationMinutes}-minute rest will begin automatically when this session finishes.</span>
          </div>
        </div>
      )}

      {/* Daily Goal Target Card */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-teal-500/10 rounded-3xl p-6 border border-indigo-200/60 dark:border-indigo-800/60 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
              isGoalReached 
                ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
                : 'bg-indigo-600 text-white shadow-indigo-500/20'
            }`}>
              {isGoalReached ? <Trophy className="w-6 h-6" /> : <Target className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Daily Focus Goal
                </h4>
                {isGoalReached ? (
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Goal Met 🏆
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
                    {goalPercentage}% Complete
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isGoalReached
                  ? `Completed ${completedSessions} sessions (Target: ${dailyGoal})`
                  : `${completedSessions} of ${dailyGoal} sessions completed • ${remainingSessions} to go`}
              </p>
            </div>
          </div>

          {/* Goal Adjustment Controls */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800 shadow-sm">
              <button
                onClick={() => adjustGoal(-1)}
                disabled={dailyGoal <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Decrease daily goal"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setGoalInput(dailyGoal.toString());
                  setShowGoalModal(true);
                }}
                className="px-2.5 py-1 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                title="Click to enter custom goal"
              >
                {dailyGoal} / day
              </button>
              <button
                onClick={() => adjustGoal(1)}
                disabled={dailyGoal >= 30}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Increase daily goal"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => {
                setGoalInput(dailyGoal.toString());
                setShowGoalModal(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-colors"
            >
              Set Goal
            </button>
          </div>
        </div>

        {/* Goal Progress Bar & Visual Session Segments */}
        <div className="mt-4 space-y-2.5">
          <div className="w-full h-3 bg-white dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isGoalReached
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
              }`}
              style={{ width: `${goalPercentage}%` }}
            />
          </div>

          {/* Session Milestone Checkpoints */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {Array.from({ length: Math.min(dailyGoal, 12) }).map((_, index) => {
              const isFilled = index < completedSessions;
              const isCurrent = index === completedSessions;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-center h-6 min-w-6 px-2 rounded-lg text-[11px] font-bold transition-all ${
                    isFilled
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-400 dark:border-indigo-600 animate-pulse'
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                  }`}
                  title={`Session ${index + 1}: ${isFilled ? 'Completed' : isCurrent ? 'Next up' : 'Pending'}`}
                >
                  {isFilled ? '✓' : index + 1}
                </div>
              );
            })}
            {dailyGoal > 12 && (
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
                +{dailyGoal - 12} more
              </span>
            )}
            {completedSessions > dailyGoal && (
              <span className="ml-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg">
                +{completedSessions - dailyGoal} Bonus 🔥
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Circular Timer Display */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 220 220">
            {/* Background Circle */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              cx="110"
              cy="110"
              r={radius}
              className={mode === 'focus' ? 'text-indigo-600 dark:text-indigo-500' : 'text-emerald-500'}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-slate-900 dark:text-slate-100">
              {formattedTime}
            </span>
            <span className="mt-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {mode === 'focus' ? (isRunning ? '⚡ Focusing' : 'Ready to Focus') : (isRunning ? '☕ Resting' : 'Break Paused')}
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Target className="w-3 h-3 text-indigo-500" />
                Goal: {completedSessions}/{dailyGoal}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center space-x-4">
          <button
            onClick={onResetTimer}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            aria-label="Reset Timer"
            title="Reset timer (Press 'R')"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleTimer}
            className={`flex items-center space-x-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg transition-all transform active:scale-95 ${
              mode === 'focus'
                ? isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
                : isRunning
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{secondsLeft === totalSeconds ? (mode === 'focus' ? 'Start Focus' : 'Start Break') : 'Resume'}</span>
              </>
            )}
          </button>
        </div>

        {/* Duration Presets + Custom Button */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {(mode === 'focus' ? [15, 25, 45, 60] : [3, 5, 10, 15]).map((mins) => (
            <button
              key={mins}
              onClick={() => onDurationSelect(mins, mode === 'break')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                durationMinutes === mins
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              {mins}m
            </button>
          ))}
          <button
            onClick={() => setShowCustomModal(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Custom...
          </button>
        </div>
      </div>

      {/* Custom Duration Dialog */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
              Set Custom Duration
            </h4>
            <form onSubmit={handleApplyCustom} className="space-y-3">
              <input
                type="number"
                min="1"
                max="180"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Minutes (e.g. 30)"
                autoFocus
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700"
                >
                  Set Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Daily Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Set Daily Focus Goal
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              How many focus sessions do you aim to complete each day?
            </p>
            <form onSubmit={handleApplyGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Target Sessions
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="e.g. 4"
                  autoFocus
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center justify-between gap-1.5">
                {[2, 4, 6, 8].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setGoalInput(preset.toString())}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-colors ${
                      goalInput === preset.toString()
                        ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Progress & Recent Sessions Log */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Streak card */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-5 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Focus Streak</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Completed focus blocks today
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {completedSessions}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">blocks</span>
          </div>
        </div>

        {/* Recent Session History Log */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              Recent Focus Log
            </h4>
            {sessionHistory.length > 0 && (
              <button
                onClick={onResetHistory}
                className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-colors flex items-center space-x-0.5"
                title="Reset session history"
              >
                <RotateCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
          {sessionHistory.length > 0 ? (
            <div className="space-y-1.5 max-h-20 overflow-y-auto pr-1">
              {sessionHistory.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/40"
                >
                  <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                    {s.type} ({s.durationMinutes}m)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(s.completedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No completed sessions logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
