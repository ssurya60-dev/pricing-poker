import React, { useState } from 'react';
import { Plus, Crown, ArrowLeft } from 'lucide-react';
import { VOTING_SCALES, VotingScale } from '../types';

interface CreateSessionProps {
  onCreateSession: (moderatorName: string, votingScale: VotingScale) => void;
  onBack: () => void;
}

export function CreateSession({ onCreateSession, onBack }: CreateSessionProps) {
  const [moderatorName, setModeratorName] = useState('');
  const [selectedScale, setSelectedScale] = useState<VotingScale>(VOTING_SCALES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (moderatorName.trim()) {
      onCreateSession(moderatorName.trim(), selectedScale);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Create Session
          </h1>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Start a new pointing poker session
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Name (Moderator)
            </label>
            <input
              type="text"
              value={moderatorName}
              onChange={(e) => setModeratorName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Voting Scale
            </label>
            <select
              value={selectedScale.name}
              onChange={(e) => {
                const scale = VOTING_SCALES.find(s => s.name === e.target.value);
                if (scale) setSelectedScale(scale);
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {VOTING_SCALES.map((scale) => (
                <option key={scale.name} value={scale.name}>
                  {scale.name} ({scale.values.join(', ')})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Session
          </button>
        </form>
      </div>
    </div>
  );
}