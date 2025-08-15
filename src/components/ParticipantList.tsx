import React, { useState } from 'react';
import { User, Crown, Check, Clock, HelpCircle, Eye, Users, MoreVertical } from 'lucide-react';
import { Participant } from '../types';

interface ParticipantListProps {
  participants: Participant[];
  currentUserId: string;
  isModerator: boolean;
  votesVisible: boolean;
  onRemoveParticipant?: (participantId: string) => void;
  onToggleObserver?: (participantId: string) => void;
}

export function ParticipantList({ 
  participants, 
  currentUserId, 
  isModerator, 
  votesVisible,
  onRemoveParticipant,
  onToggleObserver
}: ParticipantListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Only count actual participants (exclude moderators and observers)
  const activeParticipants = participants.filter(p => p.role === 'participant');
  const votedParticipants = activeParticipants.filter(p => p.hasVoted);
  const totalParticipants = activeParticipants.length;
  const votedCount = votedParticipants.length;

  const getRoleIcon = (participant: Participant) => {
    switch (participant.role) {
      case 'moderator':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'observer':
        return <Eye className="w-4 h-4 text-purple-500" />;
      default:
        return <Users className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'moderator':
        return 'Moderator';
      case 'observer':
        return 'Observer';
      default:
        return 'Participant';
    }
  };

  const toggleMenu = (participantId: string) => {
    setOpenMenuId(openMenuId === participantId ? null : participantId);
  };

  const handleMenuAction = (action: () => void) => {
    action();
    setOpenMenuId(null);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <User className="w-5 h-5" />
        Team ({participants.length})
      </h3>
      
      <div className="space-y-3">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className={`
              flex items-center justify-between p-3 rounded-xl transition-colors
              ${participant.id === currentUserId 
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                : 'bg-gray-50 dark:bg-gray-700/50'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getRoleIcon(participant)}
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {participant.name}
                    {participant.id === currentUserId && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">(You)</span>
                    )}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getRoleLabel(participant.role)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Show voting status only for participants */}
              {participant.role === 'participant' && (
                <>
                  {participant.hasVoted ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      {votesVisible && participant.vote && (
                        <span className={`px-2 py-1 rounded-lg text-sm font-medium flex items-center gap-1 ${
                          participant.vote === '?' 
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}>
                          {participant.vote === '?' ? (
                            <>
                              <HelpCircle className="w-3 h-3" />
                              ?
                            </>
                          ) : (
                            participant.vote
                          )}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                </>
              )}
              
              {/* Moderator controls with three-dots menu */}
              {isModerator && participant.role !== 'moderator' && (onToggleObserver || onRemoveParticipant) && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(participant.id);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    title="More options"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  
                  {openMenuId === participant.id && (
                    <div className="absolute right-0 top-8 z-10 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 min-w-[140px]">
                      {onToggleObserver && (
                        <button
                          onClick={() => handleMenuAction(() => onToggleObserver(participant.id))}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          {participant.role === 'observer' ? 'Make Participant' : 'Make Observer'}
                        </button>
                      )}
                      
                      {onRemoveParticipant && (
                        <button
                          onClick={() => handleMenuAction(() => onRemoveParticipant(participant.id))}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {totalParticipants > 0 ? (
            <>
              Voted: {votedCount} / {totalParticipants}
              {totalParticipants === 1 ? ' participant' : ' participants'}
            </>
          ) : (
            'No participants yet'
          )}
        </div>
        <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${totalParticipants > 0 ? (votedCount / totalParticipants) * 100 : 0}%` 
            }}
          />
        </div>
        
        {/* Show breakdown of roles */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>Participants:</span>
            <span>{activeParticipants.length}</span>
          </div>
          {participants.filter(p => p.role === 'observer').length > 0 && (
            <div className="flex justify-between">
              <span>Observers:</span>
              <span>{participants.filter(p => p.role === 'observer').length}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Moderators:</span>
            <span>{participants.filter(p => p.role === 'moderator').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}