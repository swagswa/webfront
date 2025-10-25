export interface Task {
  id: number;
  userId: number;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  firstName?: string;
  username?: string;
  tasks: Task[];
}

export interface TaskStats {
  total: number;
  completed: number;
  percentage: number;
}
