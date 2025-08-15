export interface Participant {
  id: string;
  name: string;
  role: 'moderator' | 'participant' | 'observer';
  hasVoted: boolean;
  vote?: string;
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria?: string;
  estimate?: string;
  isCompleted: boolean;
}

export interface Session {
  id: string;
  roomCode: string;
  moderatorId: string;
  participants: Participant[];
  userStories: UserStory[];
  currentStoryIndex: number;
  votingScale: VotingScale;
  votesVisible: boolean;
  isActive: boolean;
  createdAt: number;
}

export interface VotingScale {
  name: string;
  values: string[];
}

export const VOTING_SCALES: VotingScale[] = [
  {
    name: 'Fibonacci',
    values: ['1', '2', '3', '5', '8', '13', '21', '?']
  },
  {
    name: 'Modified Fibonacci',
    values: ['0', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?']
  },
  {
    name: 'T-Shirt Sizes',
    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?']
  },
  {
    name: 'Powers of 2',
    values: ['1', '2', '4', '8', '16', '32', '?']
  }
];