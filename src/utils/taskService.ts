export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

const TASKS_STORAGE_KEY = 'admin_tasks';
const LAST_CLEANUP_KEY = 'last_task_cleanup';

export const taskService = {
  // Get all tasks
  getTasks(): Task[] {
    try {
      const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
      if (!tasksJson) return [];
      
      const tasks = JSON.parse(tasksJson);
      return tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  // Save tasks to localStorage
  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  // Add a new task
  addTask(text: string): Task {
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      completed: false,
      createdAt: new Date()
    };

    const tasks = this.getTasks();
    tasks.push(newTask);
    this.saveTasks(tasks);
    
    return newTask;
  },

  // Toggle task completion
  toggleTask(taskId: string): boolean {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return false;
    
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : undefined;
    
    this.saveTasks(tasks);
    return true;
  },

  // Delete a task
  deleteTask(taskId: string): boolean {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    
    if (filteredTasks.length === tasks.length) return false;
    
    this.saveTasks(filteredTasks);
    return true;
  },

  // Update task text
  updateTask(taskId: string, newText: string): boolean {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return false;
    
    task.text = newText.trim();
    this.saveTasks(tasks);
    return true;
  },

  // Clean up completed tasks (called daily)
  cleanupCompletedTasks(): number {
    const tasks = this.getTasks();
    const activeTasks = tasks.filter(task => !task.completed);
    const removedCount = tasks.length - activeTasks.length;
    
    this.saveTasks(activeTasks);
    
    // Update last cleanup date
    localStorage.setItem(LAST_CLEANUP_KEY, new Date().toISOString());
    
    return removedCount;
  },

  // Check if daily cleanup is needed
  shouldPerformDailyCleanup(): boolean {
    try {
      const lastCleanup = localStorage.getItem(LAST_CLEANUP_KEY);
      if (!lastCleanup) return true;
      
      const lastCleanupDate = new Date(lastCleanup);
      const today = new Date();
      
      // Check if it's a new day
      return lastCleanupDate.toDateString() !== today.toDateString();
    } catch (error) {
      console.error('Error checking cleanup date:', error);
      return true;
    }
  },

  // Perform daily cleanup if needed
  performDailyCleanupIfNeeded(): number {
    if (this.shouldPerformDailyCleanup()) {
      return this.cleanupCompletedTasks();
    }
    return 0;
  },

  // Get task statistics
  getTaskStats(): { total: number; completed: number; pending: number } {
    const tasks = this.getTasks();
    const completed = tasks.filter(t => t.completed).length;
    
    return {
      total: tasks.length,
      completed,
      pending: tasks.length - completed
    };
  }
}; 