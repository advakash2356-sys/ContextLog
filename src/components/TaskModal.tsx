import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Plus, Trash2, Calendar, CheckSquare, ListPlus } from 'lucide-react';
import { PriorityLevel, TaskItem, SubTaskItem } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    taskData: {
      title: string;
      description?: string;
      category: 'WORK' | 'PERSONAL' | 'STUDY' | 'HEALTH';
      priority: PriorityLevel;
      dueDate?: string;
      subtasks?: SubTaskItem[];
    },
    editingId?: string
  ) => void;
  editingTask?: TaskItem | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'WORK' | 'PERSONAL' | 'STUDY' | 'HEALTH'>('WORK');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState<SubTaskItem[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setCategory(editingTask.category);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate || '');
      setSubtasks(editingTask.subtasks ? [...editingTask.subtasks] : []);
    } else {
      setTitle('');
      setDescription('');
      setCategory('WORK');
      setPriority('MEDIUM');
      setDueDate('');
      setSubtasks([]);
      setNewSubtaskTitle('');
    }
    setError(false);
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(true);
      return;
    }

    let finalSubtasks = [...subtasks];
    if (newSubtaskTitle.trim()) {
      finalSubtasks.push({
        id: Date.now().toString(),
        title: newSubtaskTitle.trim(),
        isCompleted: false,
      });
      setNewSubtaskTitle('');
    }

    onSave(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        dueDate: dueDate || undefined,
        subtasks: finalSubtasks.length > 0 ? finalSubtasks : undefined,
      },
      editingTask?.id
    );
    onClose();
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: SubTaskItem = {
      id: Date.now().toString(),
      title: newSubtaskTitle.trim(),
      isCompleted: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, isCompleted: !s.isCompleted } : s))
    );
  };

  const categories: Array<{ id: 'WORK' | 'PERSONAL' | 'STUDY' | 'HEALTH'; label: string }> = [
    { id: 'WORK', label: 'Work' },
    { id: 'PERSONAL', label: 'Personal' },
    { id: 'STUDY', label: 'Study' },
    { id: 'HEALTH', label: 'Health' },
  ];

  const priorities: Array<{ id: PriorityLevel; label: string; color: string }> = [
    { id: 'LOW', label: 'Low', color: 'border-slate-300 text-slate-700 dark:text-slate-300' },
    { id: 'MEDIUM', label: 'Medium', color: 'border-indigo-400 text-indigo-700 dark:text-indigo-300' },
    { id: 'HIGH', label: 'High', color: 'border-amber-500 text-amber-700 dark:text-amber-300' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error && e.target.value.trim()) setError(false);
              }}
              placeholder="e.g., Complete project quarterly roadmap"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                error
                  ? 'border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
            />
            {error && (
              <p className="mt-1 flex items-center text-xs text-rose-500 font-medium">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                Please enter a task title
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Description <span className="text-slate-400 font-normal normal-case">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key notes, links, or milestones..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
            />
          </div>

          {/* Due Date and Priority row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Due Date
                </label>
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="text-[10px] text-rose-500 hover:underline font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
              />
              {/* Quick Date Presets */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[
                  { label: 'Today', days: 0 },
                  { label: 'Tomorrow', days: 1 },
                  { label: '+3d', days: 3 },
                  { label: 'Next Week', days: 7 },
                ].map((preset) => {
                  const d = new Date();
                  d.setDate(d.getDate() + preset.days);
                  const val = d.toISOString().slice(0, 10);
                  const isSelected = dueDate === val;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setDueDate(val)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {priorities.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPriority(p.id)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                      priority === p.id
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    category === c.id
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="pt-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center">
                <CheckSquare className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Subtasks / Checklist ({subtasks.length})
              </span>
            </label>

            {/* List of subtasks */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto pr-1">
                {subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(sub.id)}
                      className={`flex-1 text-left line-clamp-1 transition-all ${
                        sub.isCompleted
                          ? 'line-through text-slate-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {sub.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(sub.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add subtask input */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add checklist item (press Enter)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 text-slate-600 dark:text-slate-300 transition-colors"
                aria-label="Add subtask"
              >
                <ListPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{editingTask ? 'Update Task' : 'Save Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
