import { useState } from 'react';
import { TelegramProvider } from './contexts/TelegramContext';
import { AuthWrapper } from './components/AuthWrapper';
import { TaskList } from './components/TaskList';
import { SwipeQuiz } from './components/SwipeQuiz';
import { Summary } from './components/Summary';
import type { Task } from './types';

type AppMode = 'list' | 'quiz' | 'summary';

function AppContent() {
  const [mode, setMode] = useState<AppMode>('list');
  const [quizTasks, setQuizTasks] = useState<Task[]>([]);
  const [summaryTasks, setSummaryTasks] = useState<Task[]>([]);

  const handleStartQuiz = (tasks: Task[]) => {
    setQuizTasks(tasks);
    setMode('quiz');
  };

  const handleQuizComplete = (completedTasks: Task[]) => {
    setSummaryTasks(completedTasks);
    setMode('summary');
  };

  const handleBackToList = () => {
    setMode('list');
    setQuizTasks([]);
    setSummaryTasks([]);
  };

  return (
    <div className="min-h-screen bg-white">
      {mode === 'list' && <TaskList onStartQuiz={handleStartQuiz} />}
      {mode === 'quiz' && (
        <SwipeQuiz tasks={quizTasks} onComplete={handleQuizComplete} />
      )}
      {mode === 'summary' && (
        <Summary tasks={summaryTasks} onBackToList={handleBackToList} />
      )}
    </div>
  );
}

function App() {
  return (
    <TelegramProvider>
      <AuthWrapper>
        <AppContent />
      </AuthWrapper>
    </TelegramProvider>
  );
}

export default App;
