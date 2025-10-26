import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTelegram } from '../contexts/TelegramContext';

interface DayStats {
  total: number;
  completed: number;
  tasks: any[];
}

interface Stats {
  stats: Record<string, DayStats>;
  streak: {
    current: number;
    longest: number;
  };
}

interface ProgressProps {
  onBack: () => void;
}

export const Progress: React.FC<ProgressProps> = ({ onBack }) => {
  const { user } = useTelegram();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stats/${user?.id}?days=30`
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCalendarDays = () => {
    const days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }

    return days;
  };

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDayStats = (date: Date) => {
    const dateKey = getDateKey(date);
    return stats?.stats[dateKey] || { total: 0, completed: 0, tasks: [] };
  };

  const getCompletionColor = (completed: number, total: number) => {
    if (total === 0) return 'bg-apple-gray-100';
    const percentage = (completed / total) * 100;
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-green-400';
    if (percentage >= 50) return 'bg-yellow-400';
    if (percentage >= 25) return 'bg-orange-400';
    return 'bg-red-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-apple-gray-200 border-t-apple-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const calendarDays = getCalendarDays();
  const selectedDayStats = selectedDate ? stats?.stats[selectedDate] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-gray-50 to-white px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="px-4 py-2 text-apple-blue-500 hover:bg-apple-gray-100 rounded-xl transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-light text-gray-900">📊 Progress</h1>
          <div className="w-16"></div>
        </div>

        {/* Streak Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 text-white shadow-apple-lg"
          >
            <div className="text-5xl mb-2">🔥</div>
            <div className="text-3xl font-light mb-1">{stats?.streak.current || 0}</div>
            <div className="text-white/80 text-sm font-light">Current Streak</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-apple-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-apple-lg"
          >
            <div className="text-5xl mb-2">🏆</div>
            <div className="text-3xl font-light mb-1">{stats?.streak.longest || 0}</div>
            <div className="text-white/80 text-sm font-light">Longest Streak</div>
          </motion.div>
        </div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-apple-lg mb-6"
        >
          <h2 className="text-xl font-light text-gray-900 mb-4">Last 30 Days</h2>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              const dayStats = getDayStats(date);
              const dateKey = getDateKey(date);
              const isToday = dateKey === getDateKey(new Date());

              return (
                <motion.button
                  key={dateKey}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`aspect-square rounded-xl ${getCompletionColor(
                    dayStats.completed,
                    dayStats.total
                  )} flex flex-col items-center justify-center hover:scale-110 transition-transform ${
                    isToday ? 'ring-2 ring-apple-blue-500' : ''
                  } ${selectedDate === dateKey ? 'ring-2 ring-gray-900' : ''}`}
                >
                  <div className="text-xs font-light text-white">
                    {date.getDate()}
                  </div>
                  {dayStats.total > 0 && (
                    <div className="text-[10px] text-white/90">
                      {dayStats.completed}/{dayStats.total}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-apple-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-apple-gray-100"></div>
              <span>No tasks</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-400"></div>
              <span>0-25%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-400"></div>
              <span>50-75%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span>100%</span>
            </div>
          </div>
        </motion.div>

        {/* Selected Day Details */}
        {selectedDayStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-apple-lg"
          >
            <h3 className="text-lg font-light text-gray-900 mb-4">
              {new Date(selectedDate!).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>

            <div className="mb-4">
              <div className="text-2xl font-light text-gray-900 mb-1">
                {selectedDayStats.completed} / {selectedDayStats.total} completed
              </div>
              <div className="text-apple-gray-400 text-sm">
                {Math.round(
                  (selectedDayStats.completed / selectedDayStats.total) * 100
                )}
                % completion rate
              </div>
            </div>

            <div className="space-y-2">
              {selectedDayStats.tasks.map((task: any) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    task.done ? 'bg-green-50' : 'bg-apple-gray-50'
                  }`}
                >
                  <div className="text-xl">{task.done ? '✅' : '❌'}</div>
                  <span
                    className={`flex-1 font-light ${
                      task.done ? 'text-green-700 line-through' : 'text-gray-900'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
