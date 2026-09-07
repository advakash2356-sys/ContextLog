import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  Tag,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Flame,
  Copy,
  Plus
} from 'lucide-react';
import { TaskItem } from '../types';
import { soundManager } from '../utils/audio';

interface TaskCardProps {
  task: TaskItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: TaskItem) => void;
  onDuplicate: (task: TaskItem) => void;
  onStartFocus: (task: TaskItem) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onDelete,
  onEdit,
  onDuplicate,
  onStartFocus,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const getCategoryBadgeClass = (category: TaskItem['category']) => {
    switch (category) {
      case 'WORK':
        return 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'PERSONAL':
        return 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'STUDY':
        return 'bg-purple-500/10 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'HEALTH':
        return 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const getPriorityBadgeClass = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'MEDIUM':
        return 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'LOW':
        return 'bg-slate-500/10 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  // Safe timezone local due date calculation & format
  const getDueDateInfo = (dueDateStr?: string) => {
    if (!dueDateStr) return null;
    const parts = dueDateStr.split('-');
    let due: Date;
    if (parts.length === 3) {
      due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      due = new Date(dueDateStr);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Overdue (${Math.abs(diffDays)}d)`, isOverdue: true, isToday: false };
    } else if (diffDays === 0) {
      return { label: 'Due Today', isOverdue: false, isToday: true };
    } else if (diffDays === 1) {
      return { label: 'Due Tomorrow', isOverdue: false, isToday: false };
    } else {
      return { label: `Due in ${diffDays}d`, isOverdue: false, isToday: false };
    }
  };

  const dueInfo = getDueDateInfo(task.dueDate);

  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleToggleClick = () => {
    if (!task.isCompleted) {
      soundManager.playCheckSound();
    }
    onToggle(task.id);
  };

  const handleSubtaskClick = (subId: string) => {
    soundManager.playCheckSound();
    onToggleSubtask(task.id, subId);
  };

  const handleAddInlineSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  return (
    <div
      className={`group relative flex flex-col p-4 sm:p-5 rounded-3xl border transition-all duration-300 ${
        task.isCompleted
          ? 'bg-slate-100/40 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/40 opacity-70'
          : 'glass-panel hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-950/40 hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3.5 flex-1 min-w-0 pr-2">
          {/* 2026 Custom Micro-Animated Check Indicator */}
          <button
            onClick={handleToggleClick}
            className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-all focus:outline-none flex-shrink-0"
            aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.isCompleted ? (
              <div className="w-5 h-5 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
                <CheckCircle2 className="w-4 h-4 fill-current" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors flex items-center justify-center group-hover:scale-105">
                <Circle className="w-2.5 h-2.5 text-transparent group-hover:text-indigo-400/40 transition-colors fill-current" />
              </div>
            )}
          </button>

          {/* Task Details */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm sm:text-base font-bold tracking-tight transition-all ${
                task.isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500 font-medium'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </p>

            {task.description && (
              <p
                className={`mt-1 text-xs sm:text-sm line-clamp-2 leading-relaxed ${
                  task.isCompleted
                    ? 'text-slate-400 dark:text-slate-600'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Futuristic Precision Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span
                className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-xl text-[11px] font-bold border backdrop-blur-md ${getCategoryBadgeClass(
                  task.category
                )}`}
              >
                <Tag className="w-3 h-3" />
                <span>{task.category.charAt(0) + task.category.slice(1).toLowerCase()}</span>
              </span>

              <span
                className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-xl text-[11px] font-bold border backdrop-blur-md ${getPriorityBadgeClass(
                  task.priority
                )}`}
              >
                <AlertCircle className="w-3 h-3" />
                <span>{task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}</span>
              </span>

              {dueInfo && (
                <span
                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-xl text-[11px] font-bold border ${
                    dueInfo.isOverdue
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-extrabold animate-pulse'
                      : dueInfo.isToday
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-extrabold'
                      : 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>{dueInfo.label}</span>
                </span>
              )}

              {/* Subtask Counter Tag */}
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-xl text-[11px] font-bold bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title={showSubtasks ? 'Hide subtasks' : 'Show subtasks'}
              >
                <CheckSquare className="w-3 h-3" />
                <span>
                  {totalSubtasks > 0 ? `${completedSubtasks}/${totalSubtasks} steps` : '+ Steps'}
                </span>
                {showSubtasks ? (
                  <ChevronUp className="w-3 h-3 ml-0.5" />
                ) : (
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Fast Action Toolbar */}
        <div className="flex items-center space-x-0.5 sm:space-x-1 bg-slate-100/60 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/40">
          {/* Quick Focus Button */}
          {!task.isCompleted && (
            <button
              onClick={() => onStartFocus(task)}
              className="p-1.5 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all font-semibold group/btn"
              aria-label="Focus on this task"
              title="Launch Instant Focus Session"
            >
              <Flame className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            </button>
          )}

          {/* Duplicate Task Button */}
          <button
            onClick={() => onDuplicate(task)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/10 dark:hover:text-indigo-400 rounded-xl transition-all"
            aria-label="Duplicate task"
            title="Duplicate task"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Edit Button */}
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/10 dark:hover:text-indigo-400 rounded-xl transition-all"
            aria-label="Edit task"
            title="Edit task"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:text-rose-400 rounded-xl transition-all"
            aria-label="Delete task"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtasks Accordion Content */}
      {showSubtasks && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
          {/* Progress bar if subtasks exist */}
          {totalSubtasks > 0 && (
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>
          )}

          {/* Subtask list */}
          <div className="space-y-1.5 pl-2 sm:pl-4">
            {task.subtasks?.map((sub) => (
              <div
                key={sub.id}
                className="group/sub flex items-center justify-between space-x-2 text-xs py-1.5 px-2.5 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div
                  onClick={() => handleSubtaskClick(sub.id)}
                  className="flex items-center space-x-2.5 flex-1 min-w-0 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={sub.isCompleted}
                    onChange={() => {}}
                    className="rounded-md border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer"
                  />
                  <span
                    className={`line-clamp-1 font-medium ${
                      sub.isCompleted
                        ? 'line-through text-slate-400 dark:text-slate-600'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {sub.title}
                  </span>
                </div>
                {onDeleteSubtask && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSubtask(task.id, sub.id);
                    }}
                    className="opacity-0 group-hover/sub:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                    title="Delete step"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            {/* Inline add subtask */}
            <form onSubmit={handleAddInlineSubtask} className="flex items-center space-x-2 pt-1.5">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add next step (press Enter)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors shadow-xs"
                disabled={!newSubtaskTitle.trim()}
                title="Add step"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
