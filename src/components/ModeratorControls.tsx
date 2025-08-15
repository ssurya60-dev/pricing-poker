import React, { useState } from 'react';
import { Eye, EyeOff, RotateCcw, Square, Settings, ChevronRight } from 'lucide-react';
import { VOTING_SCALES, VotingScale, UserStory } from '../types';

interface ModeratorControlsProps {
  votesVisible: boolean;
  votingScale: VotingScale;
  allVoted: boolean;
  userStories: UserStory[];
  currentStoryIndex: number;
  onToggleVoteVisibility: () => void;
  onResetVotes: () => void;
  onEndSession: () => void;
  onChangeVotingScale: (scale: VotingScale) => void;
  onNextStory: () => void;
  onAddStory: (story: Omit<UserStory, 'id' | 'isCompleted'>) => void;
  onUpdateStory: (storyId: string, updates: Partial<UserStory>) => void;
}

export function ModeratorControls({
  votesVisible,
  votingScale,
  allVoted,
  userStories,
  currentStoryIndex,
  onToggleVoteVisibility,
  onResetVotes,
  onEndSession,
  onChangeVotingScale,
  onNextStory,
  onUpdateStory
}: ModeratorControlsProps) {
  const [showSettings, setShowSettings] = useState(false);

  const currentStory = userStories[currentStoryIndex];
  const hasNextStory = currentStoryIndex < userStories.length - 1;

  const handleCompleteStory = () => {
    if (currentStory && votesVisible) {
      // Find the most voted estimate
      const voteCounts: Record<string, number> = {};
      // This would be calculated from participants' votes
      // For now, we'll just mark as completed
      onUpdateStory(currentStory.id, { isCompleted: true });
      onNextStory();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Moderator Controls
      </h3>
      
      <div className="space-y-2">
        <button
          onClick={onToggleVoteVisibility}
          disabled={!allVoted && !votesVisible}
          className={`
            w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${votesVisible
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed'
            }
          `}
        >
          {votesVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {votesVisible ? 'Hide Votes' : 'Reveal Votes'}
        </button>
        
        <button
          onClick={onResetVotes}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Votes
        </button>

        {votesVisible && hasNextStory && (
          <button
            onClick={handleCompleteStory}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            Next Story
          </button>
        )}
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
        >
          <Settings className="w-4 h-4" />
          Voting Scale
        </button>
        
        <button
          onClick={onEndSession}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
        >
          <Square className="w-4 h-4" />
          End Session
        </button>
      </div>

      {showSettings && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Scale: {votingScale.name}
          </label>
          <select
            value={votingScale.name}
            onChange={(e) => {
              const scale = VOTING_SCALES.find(s => s.name === e.target.value);
              if (scale) onChangeVotingScale(scale);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            {VOTING_SCALES.map((scale) => (
              <option key={scale.name} value={scale.name}>
                {scale.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}