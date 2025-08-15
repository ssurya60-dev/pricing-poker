import React, { useState, useEffect } from 'react';
import { Users, ArrowRight, ArrowLeft } from 'lucide-react';

interface JoinSessionProps {
  onJoinSession: (roomCode: string, participantName: string) => void;
  onBack: () => void;
  error?: string;
  prefilledRoomCode?: string;
}

export function JoinSession({ onJoinSession, onBack, error, prefilledRoomCode }: JoinSessionProps) {
  const [roomCode, setRoomCode] = useState('');
  const [participantName, setParticipantName] = useState('');

  // Set prefilled room code when component mounts or when prefilledRoomCode changes
  useEffect(() => {
    if (prefilledRoomCode) {
      setRoomCode(prefilledRoomCode);
    }
  }, [prefilledRoomCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim() && participantName.trim()) {
      onJoinSession(roomCode.trim().toUpperCase(), participantName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Join Session
          </h1>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {prefilledRoomCode 
              ? `Enter your name to join room ${prefilledRoomCode}`
              : 'Enter the room code to join a session'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase tracking-wider"
              required
              readOnly={!!prefilledRoomCode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              autoFocus={!!prefilledRoomCode}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            Join Session
          </button>
        </form>
      </div>
    </div>
  );
}