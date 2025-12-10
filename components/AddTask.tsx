'use client';

import { useState } from 'react';

interface AddTaskProps {
  onAdd: (task: { title: string; description?: string }) => Promise<void>;
}

export default function AddTask({ onAdd }: AddTaskProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onAdd({
        title: title.trim(),
        description: description.trim() || undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setIsExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
          onFocus={() => setIsExpanded(true)}
          placeholder="Add a new task..."
          className="w-full px-4 py-3 border-2 border-slate-400 rounded-lg text-slate-900 placeholder:text-slate-600 hover:border-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        />

        {isExpanded && (
          <>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-400 rounded-lg text-slate-900 placeholder:text-slate-600 hover:border-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            />

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading || !title.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
              >
                {isLoading ? 'Adding...' : 'Add Task'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setTitle('');
                  setDescription('');
                  setError('');
                }}
                disabled={isLoading}
                className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg font-medium hover:bg-slate-300 disabled:opacity-50 transition shadow-sm"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
