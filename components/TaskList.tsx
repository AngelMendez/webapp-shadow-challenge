'use client';

import { Task, UpdateTaskInput } from '@/lib/types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onUpdate: (id: string, updates: UpdateTaskInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

export default function TaskList({ tasks, onUpdate, onDelete, isLoading }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No tasks yet</h3>
        <p className="mt-2 text-gray-500">Get started by creating your first task!</p>
      </div>
    );
  }

  const completedTasks = tasks.filter((task) => task.completed);
  const incompleteTasks = tasks.filter((task) => !task.completed);

  return (
    <div className="space-y-6">
      {/* Active Tasks */}
      {incompleteTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Active Tasks ({incompleteTasks.length})
          </h2>
          <div className="space-y-3">
            {incompleteTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Completed Tasks ({completedTasks.length})
          </h2>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
