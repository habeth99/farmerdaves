'use client';

import { useState, useEffect } from 'react';
import { Task, taskService } from '../utils/taskService';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
    performDailyCleanup();
  }, []);

  const loadTasks = () => {
    const loadedTasks = taskService.getTasks();
    setTasks(loadedTasks);
  };

  const performDailyCleanup = () => {
    const removedCount = taskService.performDailyCleanupIfNeeded();
    if (removedCount > 0) {
      setCleanupMessage(`Cleaned up ${removedCount} completed task${removedCount !== 1 ? 's' : ''} from yesterday.`);
      setTimeout(() => setCleanupMessage(null), 5000);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    taskService.addTask(newTaskText);
    setNewTaskText('');
    loadTasks();
  };

  const handleToggleTask = (taskId: string) => {
    taskService.toggleTask(taskId);
    loadTasks();
  };

  const handleDeleteTask = (taskId: string) => {
    taskService.deleteTask(taskId);
    loadTasks();
  };

  const handleStartEdit = (task: Task) => {
    setEditingTask(task.id);
    setEditText(task.text);
  };

  const handleSaveEdit = (taskId: string) => {
    if (editText.trim()) {
      taskService.updateTask(taskId, editText);
      loadTasks();
    }
    setEditingTask(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditText('');
  };

  const stats = taskService.getTaskStats();
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
            Daily Tasks
          </h2>
          <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)]">
            {stats.pending} pending • {stats.completed} completed
          </p>
        </div>
        
        {stats.total > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
            <div className="text-xs text-[var(--color-box)] dark:text-[var(--text-secondary)]">Complete</div>
          </div>
        )}
      </div>

      {/* Cleanup Message */}
      {cleanupMessage && (
        <div className="bg-[var(--color-sage)]/10 dark:bg-[var(--color-sage)]/20 border border-[var(--color-sage)]/30 dark:border-[var(--color-sage)]/40 text-[var(--color-sage)] dark:text-[var(--color-sage)] px-4 py-3 rounded-lg mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {cleanupMessage}
        </div>
      )}

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] placeholder-[var(--color-box)] dark:placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add
          </button>
        </div>
      </form>

      {/* Task Lists */}
      <div className="space-y-6">
        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-3 flex items-center">
                             <div className="w-3 h-3 bg-[var(--color-pine)] rounded-full mr-2"></div>
              Pending Tasks ({pendingTasks.length})
            </h3>
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg border border-[var(--color-sage)]/20 dark:border-[var(--border-color)] hover:border-[var(--color-sage)]/40 transition-colors"
                >
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="flex-shrink-0 w-5 h-5 rounded border-2 border-[var(--color-sage)] hover:border-[var(--color-borneo)] transition-colors"
                  >
                    {/* Empty checkbox for pending tasks */}
                  </button>
                  
                  {editingTask === task.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 px-2 py-1 border border-[var(--color-sage)]/40 rounded text-sm bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(task.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(task.id)}
                        className="text-[var(--color-sage)] hover:text-[var(--color-pine)] p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-[var(--color-box)] dark:text-[var(--text-secondary)] hover:text-[var(--color-borneo)] dark:hover:text-[var(--text-primary)] p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <span 
                        className="flex-1 text-[var(--color-borneo)] dark:text-[var(--text-primary)] cursor-pointer"
                        onClick={() => handleStartEdit(task)}
                      >
                        {task.text}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStartEdit(task)}
                          className="text-[var(--color-sage)] hover:text-[var(--color-borneo)] p-1"
                          title="Edit task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1"
                          title="Delete task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-3 flex items-center">
              <div className="w-3 h-3 bg-[var(--color-sage)] rounded-full mr-2"></div>
              Completed Tasks ({completedTasks.length})
            </h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                                     className="flex items-center gap-3 p-3 bg-[var(--color-sage)]/10 dark:bg-[var(--color-sage)]/20 rounded-lg border border-[var(--color-sage)]/30 dark:border-[var(--color-sage)]/40"
                >
                  <button
                    onClick={() => handleToggleTask(task.id)}
                                         className="flex-shrink-0 w-5 h-5 rounded bg-[var(--color-sage)] text-white flex items-center justify-center hover:bg-[var(--color-pine)] transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  
                  <span className="flex-1 text-[var(--color-borneo)] dark:text-[var(--text-primary)] line-through opacity-75">
                    {task.text}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {task.completedAt && (
                                             <span className="text-xs text-[var(--color-sage)] dark:text-[var(--color-sage)]">
                        {task.completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                                             className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1"
                      title="Delete task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-sage)]/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
              No Tasks Yet
            </h3>
            <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">
              Add your first task to get started with your daily workflow.
            </p>
          </div>
        )}
      </div>

      {/* Auto-cleanup info */}
      <div className="mt-6 pt-4 border-t border-[var(--color-sage)]/20 dark:border-[var(--border-color)]">
        <p className="text-xs text-[var(--color-box)] dark:text-[var(--text-secondary)] flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Completed tasks are automatically removed at the end of each day.
        </p>
      </div>
    </div>
  );
} 