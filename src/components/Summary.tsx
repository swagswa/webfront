import React from 'react';
import { motion } from 'framer-motion';
import type { Task, TaskStats } from '../types';

interface SummaryProps {
  tasks: Task[];
  onBackToList: () => void;
}

const getMotivationalMessage = (percentage: number): string => {
  if (percentage === 100) return 'Perfect! You crushed it! 🎉';
  if (percentage >= 80) return 'Amazing work! Keep it up! 🌟';
  if (percentage >= 60) return 'Great job! You are doing well! 💪';
  if (percentage >= 40) return 'Good effort! Keep going! 🚀';
  if (percentage >= 20) return 'Nice start! Tomorrow is a new day! 🌱';
  return 'Every journey starts somewhere! 💫';
};

const getEmoji = (percentage: number): string => {
  if (percentage === 100) return '🏆';
  if (percentage >= 80) return '😎';
  if (percentage >= 60) return '🙌';
  if (percentage >= 40) return '👍';
  if (percentage >= 20) return '💪';
  return '🌟';
};

export const Summary: React.FC<SummaryProps> = ({ tasks, onBackToList }) => {
  const stats: TaskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.done).length,
    percentage:
      tasks.length > 0
        ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100)
        : 0,
  };

  const motivationMessage = getMotivationalMessage(stats.percentage);
  const emoji = getEmoji(stats.percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-gray-50 to-white flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-apple-lg border border-apple-gray-200 p-8 mb-6">
          {/* Emoji */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-center mb-6"
          >
            <div className="text-8xl">{emoji}</div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-light text-gray-900 text-center mb-2"
          >
            Day Complete!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-apple-gray-400 text-center font-light mb-8"
          >
            {motivationMessage}
          </motion.p>

          {/* Stats Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="relative w-48 h-48">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e8e8ed"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '552', strokeDashoffset: '552' }}
                  animate={{
                    strokeDashoffset: 552 - (552 * stats.percentage) / 100,
                  }}
                  transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0071e3" />
                    <stop offset="100%" stopColor="#0077ed" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Percentage text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-5xl font-light text-gray-900"
                  >
                    {stats.percentage}%
                  </motion.div>
                  <div className="text-apple-gray-400 text-sm font-light">
                    Complete
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Task breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <div className="text-3xl font-light text-green-600">
                {stats.completed}
              </div>
              <div className="text-green-600 text-sm font-light">Completed</div>
            </div>
            <div className="bg-apple-gray-100 border border-apple-gray-200 rounded-2xl p-4 text-center">
              <div className="text-3xl font-light text-apple-gray-400">
                {stats.total - stats.completed}
              </div>
              <div className="text-apple-gray-400 text-sm font-light">
                Remaining
              </div>
            </div>
          </motion.div>

          {/* Task list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="space-y-2"
          >
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  task.done ? 'bg-green-50' : 'bg-apple-gray-50'
                }`}
              >
                <div className="text-xl">{task.done ? '✅' : '❌'}</div>
                <span
                  className={`flex-1 font-light ${
                    task.done
                      ? 'text-green-700 line-through'
                      : 'text-apple-gray-400'
                  }`}
                >
                  {task.title}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          onClick={onBackToList}
          className="w-full py-4 bg-gradient-to-r from-apple-blue-500 to-apple-blue-600 text-white rounded-2xl font-light text-lg hover:shadow-apple-lg active:scale-98 transition-all shadow-apple"
        >
          Back to Tasks
        </motion.button>
      </motion.div>
    </div>
  );
};
