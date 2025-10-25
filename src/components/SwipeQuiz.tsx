import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import type { Task } from '../types';

interface SwipeQuizProps {
  tasks: Task[];
  onComplete: (completedTasks: Task[]) => void;
}

export const SwipeQuiz: React.FC<SwipeQuizProps> = ({ tasks, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedTasks, setSwipedTasks] = useState<Task[]>([]);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = async (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 100;
    const currentTask = tasks[currentIndex];

    if (info.offset.x > threshold) {
      // Swiped right - Done ✅
      setExitDirection('right');
      const updatedTask = { ...currentTask, done: true };
      await updateTaskStatus(currentTask.id, true);
      setSwipedTasks([...swipedTasks, updatedTask]);
      moveToNext();
    } else if (info.offset.x < -threshold) {
      // Swiped left - Not Done ❌
      setExitDirection('left');
      const updatedTask = { ...currentTask, done: false };
      setSwipedTasks([...swipedTasks, updatedTask]);
      moveToNext();
    } else {
      // Reset if not swiped enough
      x.set(0);
    }
  };

  const updateTaskStatus = async (taskId: number, done: boolean) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done }),
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const moveToNext = () => {
    setTimeout(() => {
      if (currentIndex < tasks.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setExitDirection(null);
        x.set(0);
      } else {
        onComplete(swipedTasks);
      }
    }, 300);
  };

  const handleButtonSwipe = async (done: boolean) => {
    const currentTask = tasks[currentIndex];
    const direction = done ? 'right' : 'left';
    setExitDirection(direction);

    if (done) {
      await updateTaskStatus(currentTask.id, true);
    }

    const updatedTask = { ...currentTask, done };
    setSwipedTasks([...swipedTasks, updatedTask]);
    moveToNext();
  };

  if (currentIndex >= tasks.length) {
    return null;
  }

  const currentTask = tasks[currentIndex];
  const progress = ((currentIndex + 1) / tasks.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-gray-50 to-white flex flex-col items-center justify-center px-6 py-12">
      {/* Progress Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between text-sm text-apple-gray-400 mb-2">
          <span className="font-light">Progress</span>
          <span className="font-light">
            {currentIndex + 1} / {tasks.length}
          </span>
        </div>
        <div className="h-2 bg-apple-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-apple-blue-500 to-apple-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative w-full max-w-md h-96 mb-12">
        {/* Next card preview */}
        {currentIndex < tasks.length - 1 && (
          <motion.div
            className="absolute inset-0 bg-white rounded-3xl shadow-apple-lg border border-apple-gray-200"
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 0.95, opacity: 0.7 }}
          />
        )}

        {/* Current card */}
        <motion.div
          className="absolute inset-0 bg-white rounded-3xl shadow-apple-lg border border-apple-gray-200 cursor-grab active:cursor-grabbing"
          style={{ x, rotate, opacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={
            exitDirection
              ? {
                  x: exitDirection === 'right' ? 500 : -500,
                  opacity: 0,
                  transition: { duration: 0.3 },
                }
              : {}
          }
        >
          {/* Swipe indicators */}
          <motion.div
            className="absolute top-8 right-8 px-6 py-3 bg-green-500 text-white rounded-2xl font-light text-lg rotate-12 shadow-lg"
            style={{
              opacity: useTransform(x, [0, 100], [0, 1]),
            }}
          >
            ✅ Done
          </motion.div>

          <motion.div
            className="absolute top-8 left-8 px-6 py-3 bg-red-500 text-white rounded-2xl font-light text-lg -rotate-12 shadow-lg"
            style={{
              opacity: useTransform(x, [-100, 0], [1, 0]),
            }}
          >
            ❌ Not Done
          </motion.div>

          {/* Card content */}
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-2xl font-light text-gray-900 mb-4">
              {currentTask.title}
            </h2>
            <p className="text-apple-gray-400 font-light">
              Swipe right if done, left if not
            </p>
          </div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-6 w-full max-w-md">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleButtonSwipe(false)}
          className="flex-1 py-4 bg-white border-2 border-red-500 text-red-500 rounded-2xl font-light text-lg hover:bg-red-50 active:scale-95 transition-all shadow-apple"
        >
          ❌ Not Done
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleButtonSwipe(true)}
          className="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-light text-lg hover:shadow-apple-lg active:scale-95 transition-all shadow-apple"
        >
          ✅ Done
        </motion.button>
      </div>

      {/* Skip hint */}
      <p className="mt-8 text-apple-gray-400 text-sm font-light">
        Or drag the card left/right
      </p>
    </div>
  );
};
