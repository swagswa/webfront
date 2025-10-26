import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../contexts/TelegramContext';
import type { Task } from '../types';

interface TaskListProps {
  onStartQuiz: (tasks: Task[]) => void;
  onViewProgress: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({ onStartQuiz, onViewProgress }) => {
  const { user } = useTelegram();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tasks/${user?.id}`
      );
      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim() || !user) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: newTaskTitle.trim(),
        }),
      });
      const data = await response.json();
      setTasks([data.task, ...tasks]);
      setNewTaskTitle('');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tasks/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );
      const data = await response.json();
      setTasks(tasks.map((t) => (t.id === id ? data.task : t)));
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${id}`, {
        method: 'DELETE',
      });
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleStartQuiz = () => {
    const uncompletedTasks = tasks.filter((t) => !t.done);
    if (uncompletedTasks.length > 0) {
      onStartQuiz(uncompletedTasks);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-apple-gray-200 border-t-apple-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 animate-fade-in">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-light text-gray-900">
            ✍️ Daily Tasks
          </h1>
          <button
            onClick={onViewProgress}
            className="px-4 py-2 bg-apple-gray-100 hover:bg-apple-gray-200 text-gray-900 rounded-xl transition-colors flex items-center gap-2"
          >
            <span>📊</span>
            <span className="font-light">Progress</span>
          </button>
        </div>
        <p className="text-apple-gray-400 font-light text-center">
          Plan your day, track your progress
        </p>
      </motion.div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createTask()}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-3 rounded-2xl border border-apple-gray-200 focus:border-apple-blue-500 focus:outline-none focus:ring-2 focus:ring-apple-blue-500/20 transition-all font-light"
          />
          <button
            onClick={createTask}
            disabled={!newTaskTitle.trim()}
            className="px-6 py-3 bg-apple-blue-500 text-white rounded-2xl font-light hover:bg-apple-blue-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-apple"
          >
            Add
          </button>
        </div>
      </motion.div>

      {/* Task List */}
      <AnimatePresence mode="popLayout">
        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <p className="text-apple-gray-400 font-light text-lg">
              No tasks yet. Start by adding one! 🎯
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3 mb-6">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-2xl border ${
                  task.done
                    ? 'bg-apple-gray-50 border-apple-gray-200'
                    : 'bg-white border-apple-gray-200'
                } shadow-apple hover:shadow-apple-lg transition-all`}
              >
                {editingId === task.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === 'Enter' && updateTask(task.id, { title: editTitle })
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-apple-gray-200 focus:border-apple-blue-500 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => updateTask(task.id, { title: editTitle })}
                      className="px-4 py-2 bg-apple-blue-500 text-white rounded-xl text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-apple-gray-200 text-gray-700 rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={(e) =>
                          updateTask(task.id, { done: e.target.checked })
                        }
                        className="w-5 h-5 rounded-lg border-2 border-apple-gray-300 text-apple-blue-500 focus:ring-2 focus:ring-apple-blue-500/20"
                      />
                      <span
                        className={`flex-1 font-light ${
                          task.done
                            ? 'text-apple-gray-400 line-through'
                            : 'text-gray-900'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(task.id);
                          setEditTitle(task.title);
                        }}
                        className="px-3 py-1 text-apple-blue-500 hover:bg-apple-gray-100 rounded-lg transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="px-3 py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Start Quiz Button */}
      {tasks.filter((t) => !t.done).length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleStartQuiz}
          className="w-full py-4 bg-gradient-to-r from-apple-blue-500 to-apple-blue-600 text-white rounded-2xl font-light text-lg hover:shadow-apple-lg active:scale-98 transition-all shadow-apple"
        >
          🎯 Start Quiz Mode
        </motion.button>
      )}
    </div>
  );
};
