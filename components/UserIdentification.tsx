'use client';

import { useState } from 'react';

interface UserIdentificationProps {
  onSetUser: (identifier: string) => void;
}

export default function UserIdentification({ onSetUser }: UserIdentificationProps) {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim()) {
      setError('Please enter your name or email');
      return;
    }

    onSetUser(identifier.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI-Enhanced To-Do List
          </h1>
          <p className="text-gray-600">
            Enter your name or email to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
              Name or Email
            </label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError('');
              }}
              placeholder="john@example.com or John Doe"
              className="w-full px-4 py-3 border-2 border-slate-400 rounded-lg text-slate-900 placeholder:text-slate-600 hover:border-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition shadow-sm"
          >
            Continue
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-gray-500">
          Your identifier is stored locally and used to manage your tasks
        </p>
      </div>
    </div>
  );
}
