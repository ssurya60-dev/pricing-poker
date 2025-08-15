import React from 'react';
import { HelpCircle } from 'lucide-react';

interface VotingCardProps {
  value: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function VotingCard({ value, isSelected, onClick, disabled }: VotingCardProps) {
  const isQuestionMark = value === '?';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-16 h-24 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 active:scale-95
        ${isSelected 
          ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-blue-400 hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : 'cursor-pointer'}
        ${isQuestionMark ? 'border-orange-300 dark:border-orange-600 hover:border-orange-400' : ''}
        ${isSelected && isQuestionMark ? 'border-orange-500 bg-orange-500' : ''}
        flex items-center justify-center text-lg font-semibold
      `}
      title={isQuestionMark ? "Not sure / Skip" : `Vote ${value}`}
    >
      {isQuestionMark ? (
        <HelpCircle className="w-6 h-6" />
      ) : (
        value
      )}
      {isSelected && (
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
          isQuestionMark ? 'bg-orange-600' : 'bg-blue-600'
        }`}>
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}
    </button>
  );
}