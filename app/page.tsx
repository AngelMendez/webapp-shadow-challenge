'use client';

import { useUser } from '@/hooks/useUser';
import { useTasks } from '@/hooks/useTasks';
import UserIdentification from '@/components/UserIdentification';
import AddTask from '@/components/AddTask';
import TaskList from '@/components/TaskList';
import Chatbot from '@/components/Chatbot';

export default function Home() {
  const { userIdentifier, setUser, clearUser, isLoading: userLoading } = useUser();
  const {
    tasks,
    isLoading: tasksLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch,
  } = useTasks(userIdentifier);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userIdentifier) {
    return <UserIdentification onSetUser={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI-Enhanced To-Do List
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome, {userIdentifier}!
              </p>
            </div>
            <button
              onClick={clearUser}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Switch User
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Add Task Section */}
          <AddTask onAdd={createTask} />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Task List */}
          <TaskList
            tasks={tasks}
            onUpdate={updateTask}
            onDelete={deleteTask}
            isLoading={tasksLoading}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Built with Next.js, Supabase, and AI Enhancement
          </p>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot userIdentifier={userIdentifier} tasks={tasks} onTasksUpdated={refetch} />
    </div>
  );
}
