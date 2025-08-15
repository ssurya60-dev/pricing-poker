import React, { useState, useEffect } from 'react';
import { Copy, Check, LogOut, Edit3, HelpCircle, Zap } from 'lucide-react';
import { Session, Participant, UserStory } from '../types';
import { VotingCard } from './VotingCard';
import { ParticipantList } from './ParticipantList';
import { ModeratorControls } from './ModeratorControls';

interface SessionViewProps {
  session: Session;
  currentUser: Participant;
  onUpdateSession: (session: Session) => void;
  onLeaveSession: () => void;
}

export function SessionView({ session, currentUser, onUpdateSession, onLeaveSession }: SessionViewProps) {
  const [selectedVote, setSelectedVote] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [editingStory, setEditingStory] = useState(false);
  const [storyForm, setStoryForm] = useState({
    title: '',
    description: ''
  });

  const isModerator = currentUser.role === 'moderator';
  const isObserver = currentUser.role === 'observer';
  const canVote = currentUser.role === 'participant';
  
  // Only count actual participants (exclude moderators and observers)
  const participantsOnly = session.participants.filter(p => p.role === 'participant');
  const allParticipantsVoted = participantsOnly.every(p => p.hasVoted);
  const currentStory = session.userStories[session.currentStoryIndex];

  useEffect(() => {
    setSelectedVote(currentUser.vote || '');
  }, [currentUser.vote]);

  useEffect(() => {
    if (currentStory) {
      setStoryForm({
        title: currentStory.title,
        description: currentStory.description
      });
    }
  }, [currentStory]);

  const handleVote = (vote: string) => {
    if (session.votesVisible || !canVote) return;
    
    setSelectedVote(vote);
    const updatedSession = { ...session };
    const participantIndex = updatedSession.participants.findIndex(p => p.id === currentUser.id);
    
    if (participantIndex >= 0) {
      updatedSession.participants[participantIndex] = {
        ...updatedSession.participants[participantIndex],
        vote,
        hasVoted: true
      };
      onUpdateSession(updatedSession);
    }
  };

  const handleToggleVoteVisibility = () => {
    if (!isModerator) return;
    const updatedSession = { ...session, votesVisible: !session.votesVisible };
    onUpdateSession(updatedSession);
  };

  const handleResetVotes = () => {
    if (!isModerator) return;
    const updatedSession = {
      ...session,
      participants: session.participants.map(p => ({
        ...p,
        vote: undefined,
        hasVoted: false
      })),
      votesVisible: false
    };
    onUpdateSession(updatedSession);
    setSelectedVote('');
  };

  const handleRemoveParticipant = (participantId: string) => {
    if (!isModerator) return;
    const updatedSession = {
      ...session,
      participants: session.participants.filter(p => p.id !== participantId)
    };
    onUpdateSession(updatedSession);
  };

  const handleToggleObserver = (participantId: string) => {
    if (!isModerator) return;
    const updatedSession = {
      ...session,
      participants: session.participants.map(p => 
        p.id === participantId 
          ? { 
              ...p, 
              role: p.role === 'observer' ? 'participant' : 'observer',
              vote: undefined,
              hasVoted: false
            }
          : p
      )
    };
    onUpdateSession(updatedSession);
  };

  const handleChangeVotingScale = (scale: any) => {
    if (!isModerator) return;
    const updatedSession = { ...session, votingScale: scale };
    onUpdateSession(updatedSession);
    handleResetVotes();
  };

  const handleNextStory = () => {
    if (!isModerator) return;
    if (session.currentStoryIndex < session.userStories.length - 1) {
      const updatedSession = {
        ...session,
        currentStoryIndex: session.currentStoryIndex + 1,
        participants: session.participants.map(p => ({
          ...p,
          vote: undefined,
          hasVoted: false
        })),
        votesVisible: false
      };
      onUpdateSession(updatedSession);
      setSelectedVote('');
    }
  };

  const handleUpdateStory = (storyId: string, updates: Partial<UserStory>) => {
    if (!isModerator) return;
    const updatedSession = {
      ...session,
      userStories: session.userStories.map(story =>
        story.id === storyId ? { ...story, ...updates } : story
      )
    };
    onUpdateSession(updatedSession);
  };

  const copyShareableUrl = () => {
    const shareableUrl = `${window.location.origin}/room/${session.roomCode}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStorySubmit = () => {
    if (!isModerator) return;
    if (currentStory) {
      handleUpdateStory(currentStory.id, {
        title: storyForm.title,
        description: storyForm.description
      });
    }
    setEditingStory(false);
  };

  const handleEditStory = () => {
    if (!isModerator) return;
    setEditingStory(true);
  };

  const handleCancelEdit = () => {
    if (!isModerator) return;
    setEditingStory(false);
    if (currentStory) {
      setStoryForm({
        title: currentStory.title,
        description: currentStory.description
      });
    }
  };

  const getVoteResults = () => {
    const votedParticipants = participantsOnly.filter(p => p.hasVoted && p.vote);
    const totalVotes = votedParticipants.length;
    
    if (totalVotes === 0) return [];
    
    const voteCount = votedParticipants.reduce((acc, participant) => {
      const vote = participant.vote!;
      acc[vote] = (acc[vote] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(voteCount)
      .sort(([,a], [,b]) => b - a)
      .map(([vote, count]) => ({ 
        vote, 
        count, 
        percentage: Math.round((count / totalVotes) * 100)
      }));
  };

  const getMajorityVote = () => {
    const results = getVoteResults();
    if (results.length === 0) return null;
    
    const topResult = results[0];
    const isMajority = topResult.percentage > 50;
    const isPlurality = results.length > 1 && topResult.count > results[1].count;
    
    return {
      ...topResult,
      isMajority,
      isPlurality: isPlurality && !isMajority
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Layout */}
          <div className="flex flex-col gap-3 sm:hidden">
            {/* Top row: Title and Leave button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PokerPoint
                </h1>
              </div>
              <button
                onClick={onLeaveSession}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Leave
              </button>
            </div>
            
            {/* Second row: Room code with copy functionality */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Room:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {session.roomCode}
                </span>
                <button
                  onClick={copyShareableUrl}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Copy shareable link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Third row: Story counter (if applicable) */}
            {session.userStories.length > 1 && (
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Story {session.currentStoryIndex + 1} of {session.userStories.length}
              </div>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PointingPoker
                </h1>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Room:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                  {session.roomCode}
                </span>
                <button
                  onClick={copyShareableUrl}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Copy shareable link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
              {session.userStories.length > 1 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Story {session.currentStoryIndex + 1} of {session.userStories.length}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onLeaveSession}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Leave
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with top padding to account for sticky header */}
      <div className="pt-4">
        <div className="max-w-7xl mx-auto p-4">
          {/* Current Story */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {currentStory ? currentStory.title : 'Current Story'}
              </h2>
              {isModerator && !editingStory && currentStory && (
                <button
                  onClick={handleEditStory}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Story
                </button>
              )}
            </div>
            
            {editingStory && isModerator && currentStory ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={storyForm.title}
                    onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter story title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={storyForm.description}
                    onChange={(e) => setStoryForm({ ...storyForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                    placeholder="Enter story description"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleStorySubmit}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Save Story
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : currentStory ? (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    {currentStory.description}
                  </p>
                </div>
                {currentStory.acceptanceCriteria && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Acceptance Criteria:
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {currentStory.acceptanceCriteria}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  No story selected yet.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Voting Section */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {canVote ? 'Select Your Estimate' : 
                     isObserver ? 'Voting (Observer Mode)' : 
                     'Select Your Estimate (Optional for moderator)'}
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Scale: {session.votingScale.name}
                  </span>
                </div>
                
                {isObserver ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You are observing this session and cannot vote.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Ask the moderator to change your role to participant if you want to vote.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 mb-6">
                      {session.votingScale.values.map((value) => (
                        <VotingCard
                          key={value}
                          value={value}
                          isSelected={selectedVote === value}
                          onClick={() => handleVote(value)}
                          disabled={session.votesVisible && !isModerator}
                        />
                      ))}
                    </div>
                    
                    {selectedVote && (
                      <div className={`p-4 border rounded-xl ${
                        selectedVote === '?' 
                          ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      }`}>
                        <p className={`${
                          selectedVote === '?' 
                            ? 'text-orange-700 dark:text-orange-300'
                            : 'text-blue-700 dark:text-blue-300'
                        }`}>
                          {selectedVote === '?' ? (
                            <span className="flex items-center gap-2">
                              <HelpCircle className="w-4 h-4" />
                              You chose to skip or are unsure about this estimate
                            </span>
                          ) : (
                            <>Your vote: <span className="font-bold">{selectedVote}</span></>
                          )}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Results */}
              {session.votesVisible && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Voting Results
                    </h3>
                    {(() => {
                      const majority = getMajorityVote();
                      if (majority) {
                        return (
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            majority.isMajority 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : majority.isPlurality
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {majority.isMajority ? 'Majority' : majority.isPlurality ? 'Plurality' : 'Tie'}
                            {majority.vote === '?' ? (
                              <span className="ml-1 flex items-center gap-1">
                                <HelpCircle className="w-3 h-3" />
                                Unsure
                              </span>
                            ) : (
                              `: ${majority.vote}`
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  
                  <div className="space-y-3">
                    {getVoteResults().map(({ vote, count, percentage }) => (
                      <div key={vote} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-white ${
                            vote === '?' ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {vote === '?' ? <HelpCircle className="w-4 h-4" /> : vote}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {count} vote{count > 1 ? 's' : ''}
                            </span>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {percentage}% of votes
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                vote === '?' ? 'bg-orange-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <ParticipantList
                participants={session.participants}
                currentUserId={currentUser.id}
                isModerator={isModerator}
                votesVisible={session.votesVisible}
                onRemoveParticipant={isModerator ? handleRemoveParticipant : undefined}
                onToggleObserver={isModerator ? handleToggleObserver : undefined}
              />
              
              {isModerator && (
                <ModeratorControls
                  votesVisible={session.votesVisible}
                  votingScale={session.votingScale}
                  allVoted={allParticipantsVoted}
                  userStories={session.userStories}
                  currentStoryIndex={session.currentStoryIndex}
                  onToggleVoteVisibility={handleToggleVoteVisibility}
                  onResetVotes={handleResetVotes}
                  onEndSession={onLeaveSession}
                  onChangeVotingScale={handleChangeVotingScale}
                  onNextStory={handleNextStory}
                  onAddStory={() => {}}
                  onUpdateStory={handleUpdateStory}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}