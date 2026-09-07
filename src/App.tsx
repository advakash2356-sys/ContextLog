import { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { FocusTimer } from './components/FocusTimer';
import { InsightsView } from './components/InsightsView';
import { ShortcutsModal } from './components/ShortcutsModal';
import {
  TaskItem,
  TaskCategory,
  StatusFilter,
  ActiveTab,
  PriorityLevel,
  SortOption,
  FocusSession,
  SubTaskItem,
} from './types';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Inbox,
  ArrowUpDown,
  CheckCheck,
  Flame,
  Coffee,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';
import { soundManager } from './utils/audio';

const INITIAL_TASKS: TaskItem[] = [
  {
    id: '1',
    title: 'Review quarterly team goals & roadmap',
    description: 'Finalize Q3 OKRs and sync with product design team.',
    category: 'WORK',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    subtasks: [
      { id: '1-1', title: 'Draft key results', isCompleted: true },
      { id: '1-2', title: 'Schedule sync meeting', isCompleted: false },
    ],
    isCompleted: false,
    createdAt: Date.now() - 3600000,
  },
  {
    id: '2',
    title: 'Read 20 pages of clean architecture guide',
    description: 'Focus on dependency inversion and state patterns.',
    category: 'STUDY',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now()).toISOString().slice(0, 10),
    isCompleted: true,
    createdAt: Date.now() - 7200000,
  },
  {
    id: '3',
    title: '30-minute cardio & stretch workout',
    description: 'Hydrate and do light mobility exercises.',
    category: 'HEALTH',
    priority: 'LOW',
    isCompleted: false,
    createdAt: Date.now() - 10800000,
  },
];

const parseLocalDate = (dateStr?: string) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  return new Date(dateStr);
};

export function App() {
  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('task_focus_hub_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
      }
    }
    return INITIAL_TASKS;
  });

  // Focus and Goals state
  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    const saved = localStorage.getItem('task_focus_hub_sessions');
    return saved ? parseInt(saved, 10) || 0 : 3;
  });

  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('task_focus_hub_daily_goal');
    return saved ? Math.max(1, parseInt(saved, 10) || 4) : 4;
  });

  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string | null>(() => {
    return localStorage.getItem('task_focus_hub_active_task_id') || null;
  });

  const [sessionHistory, setSessionHistory] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem('task_focus_hub_session_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse focus history', e);
      }
    }
    return [
      { id: 's1', type: 'focus', durationMinutes: 25, completedAt: Date.now() - 7200000 },
      { id: 's2', type: 'break', durationMinutes: 5, completedAt: Date.now() - 5400000 },
      { id: 's3', type: 'focus', durationMinutes: 45, completedAt: Date.now() - 1800000 },
    ];
  });

  // Timer persistent state
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [ambientSound, setAmbientSound] = useState<boolean>(false);

  // Automation & preferences settings
  const [autoStartBreak, setAutoStartBreak] = useState<boolean>(() => {
    const saved = localStorage.getItem('task_focus_hub_auto_break');
    return saved !== null ? saved === 'true' : true;
  });

  const [breakDurationMinutes, setBreakDurationMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('task_focus_hub_break_mins');
    return saved ? parseInt(saved, 10) || 5 : 5;
  });

  const [soundMuted, setSoundMuted] = useState<boolean>(() => {
    return soundManager.isMuted();
  });

  // Transient auto-break banner notification
  const [bannerToast, setBannerToast] = useState<{ message: string; type: 'info' | 'success' } | null>(null);

  // App UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('task_focus_hub_theme') === 'dark';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('task_focus_hub_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('task_focus_hub_sessions', completedSessions.toString());
  }, [completedSessions]);

  useEffect(() => {
    localStorage.setItem('task_focus_hub_daily_goal', dailyGoal.toString());
  }, [dailyGoal]);

  useEffect(() => {
    if (activeFocusTaskId) {
      localStorage.setItem('task_focus_hub_active_task_id', activeFocusTaskId);
    } else {
      localStorage.removeItem('task_focus_hub_active_task_id');
    }
  }, [activeFocusTaskId]);

  useEffect(() => {
    localStorage.setItem('task_focus_hub_session_history', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  useEffect(() => {
    localStorage.setItem('task_focus_hub_auto_break', autoStartBreak ? 'true' : 'false');
  }, [autoStartBreak]);

  useEffect(() => {
    localStorage.setItem('task_focus_hub_break_mins', breakDurationMinutes.toString());
  }, [breakDurationMinutes]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('task_focus_hub_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('task_focus_hub_theme', 'light');
    }
  }, [darkMode]);

  // Handle banner auto-dismiss
  useEffect(() => {
    if (bannerToast) {
      const t = setTimeout(() => setBannerToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [bannerToast]);

  // Main Timer Tick Engine
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && secondsLeft === 0) {
      // Session finished!
      if (mode === 'focus') {
        const completedMinutes = durationMinutes;
        const newSession: FocusSession = {
          id: Date.now().toString(),
          type: 'focus',
          durationMinutes: completedMinutes,
          completedAt: Date.now(),
        };

        setSessionHistory((prev) => [newSession, ...prev]);
        setCompletedSessions((prev) => prev + 1);

        soundManager.sendNotification(
          'Focus Session Completed! 🎉',
          `Awesome job! You completed ${completedMinutes}m of deep focus.`
        );

        if (autoStartBreak) {
          // Immediately start short break automatically
          soundManager.playBreakStartSound();
          setMode('break');
          setDurationMinutes(breakDurationMinutes);
          setSecondsLeft(breakDurationMinutes * 60);
          setIsRunning(true);
          setBannerToast({
            message: `⚡ Focus session completed! Short break (${breakDurationMinutes}m) started automatically.`,
            type: 'success',
          });
        } else {
          setIsRunning(false);
          setAmbientSound(false);
          soundManager.toggleAmbientSound(false);
          soundManager.playCompletionChime();
          setBannerToast({
            message: '🎉 Focus session completed! Take a break whenever you are ready.',
            type: 'success',
          });
        }
      } else {
        // Break finished!
        const newSession: FocusSession = {
          id: Date.now().toString(),
          type: 'break',
          durationMinutes,
          completedAt: Date.now(),
        };
        setSessionHistory((prev) => [newSession, ...prev]);

        soundManager.sendNotification(
          'Break is Over! ⚡',
          'Ready to dive back into deep focus?'
        );
        soundManager.playCompletionChime();

        setIsRunning(false);
        setAmbientSound(false);
        soundManager.toggleAmbientSound(false);
        setMode('focus');
        setDurationMinutes(25);
        setSecondsLeft(25 * 60);
        setBannerToast({
          message: '☕ Break completed! Ready for your next focus session.',
          type: 'info',
        });
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, secondsLeft, mode, durationMinutes, autoStartBreak, breakDurationMinutes]);

  // Live Document Title Synchronization
  useEffect(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (isRunning) {
      document.title = `(${timeStr}) ${mode === 'focus' ? '⚡ Focusing' : '☕ Break'} - Task & Focus Hub`;
    } else if (secondsLeft < durationMinutes * 60) {
      document.title = `[Paused ${timeStr}] - Task & Focus Hub`;
    } else {
      document.title = 'Task & Focus Hub - Organize, Focus & Achieve';
    }
  }, [isRunning, secondsLeft, mode, durationMinutes]);

  // Timer Controls
  const handleToggleTimer = useCallback(() => {
    setIsRunning((prev) => {
      const next = !prev;
      if (ambientSound) {
        soundManager.toggleAmbientSound(next);
      }
      return next;
    });
  }, [ambientSound]);

  const handleResetTimer = useCallback(() => {
    setIsRunning(false);
    setAmbientSound(false);
    soundManager.toggleAmbientSound(false);
    setSecondsLeft(durationMinutes * 60);
  }, [durationMinutes]);

  const handleDurationSelect = useCallback(
    (mins: number, isBreak = false) => {
      setIsRunning(false);
      setAmbientSound(false);
      soundManager.toggleAmbientSound(false);
      setMode(isBreak ? 'break' : 'focus');
      setDurationMinutes(mins);
      setSecondsLeft(mins * 60);
    },
    []
  );

  const handleToggleAmbient = useCallback((soundscape?: 'rain' | 'forest' | 'cafe') => {
    setAmbientSound((prev) => {
      const next = !prev;
      if (isRunning) {
        soundManager.toggleAmbientSound(next, soundscape);
      }
      return next;
    });
  }, [isRunning]);

  const handleToggleMute = useCallback(() => {
    const nextMuted = soundManager.toggleMute();
    setSoundMuted(nextMuted);
  }, []);

  const handleToggleMode = useCallback(() => {
    setIsRunning(false);
    setAmbientSound(false);
    soundManager.toggleAmbientSound(false);
    if (mode === 'focus') {
      setMode('break');
      setDurationMinutes(breakDurationMinutes);
      setSecondsLeft(breakDurationMinutes * 60);
    } else {
      setMode('focus');
      setDurationMinutes(25);
      setSecondsLeft(25 * 60);
    }
  }, [mode, breakDurationMinutes]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (e.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
        if (searchQuery) setSearchQuery('');
        return;
      }

      if (isInput) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleToggleTimer();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleResetTimer();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleToggleMode();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingTask(null);
        setIsModalOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        setActiveTab('tasks');
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else if (e.key === '1' || e.key === 't' || e.key === 'T') {
        setActiveTab('tasks');
      } else if (e.key === '2' || e.key === 'f' || e.key === 'F') {
        setActiveTab('focus');
      } else if (e.key === '3' || e.key === 'i' || e.key === 'I') {
        setActiveTab('insights');
      } else if (e.key === '?') {
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isModalOpen,
    isShortcutsOpen,
    searchQuery,
    handleToggleTimer,
    handleResetTimer,
    handleToggleMode,
    handleToggleMute,
  ]);

  // Task Operations
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeFocusTaskId === id) {
      setActiveFocusTaskId(null);
    }
  };

  const handleEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDuplicateTask = (task: TaskItem) => {
    const duplicated: TaskItem = {
      ...task,
      id: Date.now().toString(),
      title: `${task.title} (Copy)`,
      createdAt: Date.now(),
      isCompleted: false,
      subtasks: task.subtasks?.map((s) => ({
        ...s,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        isCompleted: false,
      })),
    };
    setTasks((prev) => [duplicated, ...prev]);
  };

  const handleStartFocusOnTask = (task: TaskItem) => {
    setActiveFocusTaskId(task.id);
    setActiveTab('focus');
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId || !t.subtasks) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
          ),
        };
      })
    );
  };

  const handleAddSubtaskToTask = (taskId: string, title: string) => {
    const newSub: SubTaskItem = {
      id: Date.now().toString(),
      title,
      isCompleted: false,
    };
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks ? [...t.subtasks, newSub] : [newSub],
        };
      })
    );
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId || !t.subtasks) return t;
        return {
          ...t,
          subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
        };
      })
    );
  };

  const handleSaveTask = (
    taskData: {
      title: string;
      description?: string;
      category: 'WORK' | 'PERSONAL' | 'STUDY' | 'HEALTH';
      priority: PriorityLevel;
      dueDate?: string;
      subtasks?: SubTaskItem[];
    },
    editingId?: string
  ) => {
    if (editingId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, ...taskData } : t))
      );
    } else {
      const newTask: TaskItem = {
        id: Date.now().toString(),
        ...taskData,
        isCompleted: false,
        createdAt: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleMarkAllDone = () => {
    setTasks((prev) => prev.map((t) => ({ ...t, isCompleted: true })));
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.isCompleted));
  };

  const handleClearSessionHistory = () => {
    setSessionHistory([]);
    setCompletedSessions(0);
  };

  const handleImportBackup = (backup: {
    tasks?: TaskItem[];
    sessionHistory?: FocusSession[];
    dailyGoal?: number;
  }) => {
    if (backup.tasks && Array.isArray(backup.tasks)) {
      setTasks(backup.tasks);
    }
    if (backup.sessionHistory && Array.isArray(backup.sessionHistory)) {
      setSessionHistory(backup.sessionHistory);
    }
    if (typeof backup.dailyGoal === 'number' && backup.dailyGoal > 0) {
      setDailyGoal(backup.dailyGoal);
    }
  };

  // Reset filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
  };

  // Filter and Sort Calculations
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredAndSortedTasks = tasks
    .filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Category
      if (selectedCategory !== 'ALL' && task.category !== selectedCategory) {
        return false;
      }

      // Status
      if (selectedStatus === 'ACTIVE' && task.isCompleted) return false;
      if (selectedStatus === 'COMPLETED' && !task.isCompleted) return false;
      if (selectedStatus === 'OVERDUE') {
        if (task.isCompleted || !task.dueDate) return false;
        const due = parseLocalDate(task.dueDate);
        if (!due) return false;
        due.setHours(0, 0, 0, 0);
        if (due.getTime() >= today.getTime()) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'NEWEST') return b.createdAt - a.createdAt;
      if (sortBy === 'OLDEST') return a.createdAt - b.createdAt;
      if (sortBy === 'ALPHABETICAL') return a.title.localeCompare(b.title);
      if (sortBy === 'PRIORITY') {
        const pMap: Record<PriorityLevel, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      if (sortBy === 'DUE_DATE') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

  const pendingCount = tasks.filter((t) => !t.isCompleted).length;
  const activeFocusTask = tasks.find((t) => t.id === activeFocusTaskId);

  // Formatted Timer for Floating Mini Bar
  const timerMins = Math.floor(secondsLeft / 60);
  const timerSecs = secondsLeft % 60;
  const formattedTimer = `${String(timerMins).padStart(2, '0')}:${String(timerSecs).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-indigo-500 selection:text-white aurora-bg">
      {/* 2026 Next-Gen Island Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        pendingCount={pendingCount}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Floating Active Dynamic Island Pill when browsing other tabs */}
      {activeTab !== 'focus' && (isRunning || secondsLeft < durationMinutes * 60) && (
        <div className="sticky top-20 z-30 max-w-xl mx-auto px-4 w-full animate-in fade-in slide-in-from-top-2">
          <div className="nav-island rounded-2xl py-2 px-4 shadow-xl flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex-shrink-0 shadow-sm">
                {mode === 'focus' ? (
                  <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                ) : (
                  <Coffee className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                )}
              </div>
              <span className="font-mono font-bold text-sm tracking-wider">
                {formattedTimer}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline text-xs">
                {mode === 'focus' ? 'Deep Focus' : 'Short Break'}
              </span>
              {activeFocusTask && (
                <span className="text-slate-400 dark:text-slate-400 truncate max-w-[120px] sm:max-w-xs text-xs">
                  • {activeFocusTask.title}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <button
                onClick={handleToggleTimer}
                className="px-2.5 py-1 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1 hover:bg-slate-300/60 dark:hover:bg-slate-700 transition-colors"
                title={isRunning ? 'Pause timer' : 'Resume timer'}
              >
                {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{isRunning ? 'Pause' : 'Resume'}</span>
              </button>
              <button
                onClick={() => setActiveTab('focus')}
                className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1 transition-colors shadow-sm"
                title="Open Focus Timer Tab"
              >
                <span>Dial</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Notification Banner Toast */}
      {bannerToast && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-3 w-full animate-in fade-in slide-in-from-top-2">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white shadow-xl shadow-indigo-500/20 flex items-center justify-between text-xs sm:text-sm font-semibold">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>{bannerToast.message}</span>
            </div>
            <button
              onClick={() => setBannerToast(null)}
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7">
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Header with Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  Today's Focus
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {pendingCount === 0
                    ? 'All targets cleared for today. Ready for next horizon.'
                    : `You have ${pendingCount} active ${pendingCount === 1 ? 'task' : 'tasks'} queued in flow.`}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {pendingCount > 0 && (
                  <button
                    onClick={handleMarkAllDone}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl glass-panel text-slate-700 dark:text-slate-200 text-xs font-bold transition-all hover:bg-slate-200/50 dark:hover:bg-slate-800"
                    title="Mark all active tasks as complete"
                  >
                    <CheckCheck className="w-4 h-4 text-emerald-500" />
                    <span>Complete All</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsModalOpen(true);
                  }}
                  className="interactive-spring inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Target</span>
                </button>
              </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="glass-panel p-4 rounded-3xl space-y-3 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks, tags or sub-steps (Press '/' to focus)..."
                    className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Sort selector */}
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1 sm:flex-none">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full sm:w-auto pl-8 pr-8 py-2 text-xs font-bold rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="NEWEST">Newest First</option>
                      <option value="OLDEST">Oldest First</option>
                      <option value="PRIORITY">Highest Priority</option>
                      <option value="DUE_DATE">Due Date</option>
                      <option value="ALPHABETICAL">Alphabetical (A-Z)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                {/* Category Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-400 mr-1 flex items-center">
                    <Filter className="w-3 h-3 mr-1" /> Category:
                  </span>
                  {(['ALL', 'WORK', 'PERSONAL', 'STUDY', 'HEALTH'] as TaskCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                          : 'bg-slate-200/50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-300/50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>

                {/* Status Chips with OVERDUE option */}
                <div className="flex items-center space-x-1 bg-slate-200/50 dark:bg-slate-800/60 p-1 rounded-2xl">
                  {(['ALL', 'ACTIVE', 'COMPLETED', 'OVERDUE'] as StatusFilter[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                        selectedStatus === st
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {st.charAt(0) + st.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {filteredAndSortedTasks.length > 0 ? (
                filteredAndSortedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                    onDuplicate={handleDuplicateTask}
                    onStartFocus={handleStartFocusOnTask}
                    onToggleSubtask={handleToggleSubtask}
                    onAddSubtask={handleAddSubtaskToTask}
                    onDeleteSubtask={handleDeleteSubtask}
                  />
                ))
              ) : (
                <div className="py-16 text-center glass-panel rounded-3xl flex flex-col items-center justify-center p-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                    {searchQuery ? <Search className="w-7 h-7" /> : <Inbox className="w-7 h-7" />}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {searchQuery ? 'No matching targets found' : 'No tasks in this view'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                    {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
                      ? 'Try adjusting your search query or filter chips to find what you are looking for.'
                      : 'Add a new target using the button below to start your flow session.'}
                  </p>
                  {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' ? (
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 text-xs font-bold rounded-2xl bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300/60"
                    >
                      Reset Filters & Search
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingTask(null);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-2xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create First Target</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'focus' && (
          <FocusTimer
            durationMinutes={durationMinutes}
            secondsLeft={secondsLeft}
            isRunning={isRunning}
            mode={mode}
            ambientSound={ambientSound}
            autoStartBreak={autoStartBreak}
            breakDurationMinutes={breakDurationMinutes}
            soundMuted={soundMuted}
            completedSessions={completedSessions}
            sessionHistory={sessionHistory}
            dailyGoal={dailyGoal}
            tasks={tasks}
            activeFocusTaskId={activeFocusTaskId}
            onDurationSelect={handleDurationSelect}
            onToggleTimer={handleToggleTimer}
            onResetTimer={handleResetTimer}
            onToggleAmbient={handleToggleAmbient}
            onToggleMute={handleToggleMute}
            onToggleAutoStartBreak={setAutoStartBreak}
            onSetBreakDuration={setBreakDurationMinutes}
            onSelectFocusTask={setActiveFocusTaskId}
            onToggleTask={handleToggleTask}
            onUpdateDailyGoal={setDailyGoal}
            onResetHistory={handleClearSessionHistory}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            tasks={tasks}
            completedSessions={completedSessions}
            dailyGoal={dailyGoal}
            sessionHistory={sessionHistory}
            onUpdateDailyGoal={setDailyGoal}
            onClearCompleted={handleClearCompleted}
            onClearSessionHistory={handleClearSessionHistory}
            onImportBackup={handleImportBackup}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/60 dark:border-slate-800/60 py-6 mt-12 transition-colors">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            <span>Task & Focus Hub • 2026 Next-Gen Productivity Engine</span>
          </div>
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="text-xs hover:text-indigo-600 dark:hover:text-indigo-400 underline font-medium"
          >
            Keyboard Shortcuts (Press ?)
          </button>
        </div>
      </footer>

      {/* Task Modal (Create / Edit) */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />

      {/* Shortcuts Help Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default App;
