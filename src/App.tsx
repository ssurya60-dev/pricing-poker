import React, { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { CreateSession } from './components/CreateSession';
import { JoinSession } from './components/JoinSession';
import { SessionView } from './components/SessionView';
import { DatabaseTest } from './components/DatabaseTest';
import { Session, Participant, VotingScale, VOTING_SCALES, UserStory } from './types';
import { 
  generateRoomCode, 
  generateId, 
  saveSession, 
  getSessionByRoomCode,
  getSessionById,
  getCurrentSession,
  setCurrentSession,
  clearCurrentSession,
  addParticipantToSession,
  removeParticipantFromSession,
  subscribeToSession
} from './utils/sessionManager';
import { useTheme } from './hooks/useTheme';

type AppState = 'home' | 'create' | 'join' | 'session';

function App() {
  const [appState, setAppState] = useState<AppState>('home');
  const [currentSession, setCurrentSessionState] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [joinError, setJoinError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showDbTest, setShowDbTest] = useState(false);
  const [prefilledRoomCode, setPrefilledRoomCode] = useState<string>('');
  const { theme } = useTheme();

  // Check for room code in URL on app load
  useEffect(() => {
    const checkUrlForRoomCode = () => {
      const path = window.location.pathname;
      const roomCodeMatch = path.match(/^\/room\/([A-Z0-9]{6})$/);
      
      if (roomCodeMatch) {
        const roomCode = roomCodeMatch[1];
        setPrefilledRoomCode(roomCode);
        setAppState('join');
        // Clean up URL without causing a page reload
        window.history.replaceState({}, '', '/');
        return true;
      }
      return false;
    };

    const hasRoomCodeInUrl = checkUrlForRoomCode();
    
    if (!hasRoomCodeInUrl) {
      checkExistingSession();
    }
  }, []);

  // Check for existing session on app load
  const checkExistingSession = async () => {
    const existingSession = getCurrentSession();
    if (existingSession) {
      setLoading(true);
      try {
        // Verify session still exists in database
        const dbSession = await getSessionById(existingSession.id);
        if (dbSession && dbSession.isActive) {
          setCurrentSessionState(dbSession);
          // Find current user in the session
          const userId = localStorage.getItem('current-user-id');
          if (userId) {
            const user = dbSession.participants.find(p => p.id === userId);
            if (user) {
              setCurrentUser(user);
              setAppState('session');
            } else {
              // User not found in session, clear local storage
              console.log('User not found in session, clearing local storage');
              clearCurrentSession();
              localStorage.removeItem('current-user-id');
            }
          }
        } else {
          // Session no longer exists, clear local storage
          clearCurrentSession();
          localStorage.removeItem('current-user-id');
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
        clearCurrentSession();
        localStorage.removeItem('current-user-id');
      } finally {
        setLoading(false);
      }
    }
  };

  // Set up real-time subscription when in session
  useEffect(() => {
    if (appState === 'session' && currentSession && currentUser) {
      const unsubscribe = subscribeToSession(currentSession.id, (updatedSession) => {
        console.log('Received session update:', updatedSession);
        
        // Check if current user still exists in the updated session
        const updatedUser = updatedSession.participants.find(p => p.id === currentUser.id);
        
        if (updatedUser) {
          // User still exists, update session and user
          setCurrentSessionState(updatedSession);
          setCurrentSession(updatedSession);
          setCurrentUser(updatedUser);
        } else {
          // User was removed from session
          console.log('Current user was removed from session');
          handleLeaveSession();
        }
      });

      return unsubscribe;
    }
  }, [appState, currentSession?.id, currentUser?.id]);

  const handleCreateSession = async (moderatorName: string, votingScale: VotingScale) => {
    setLoading(true);
    try {
      const sessionId = generateId();
      const participantId = generateId();
      
      const moderator: Participant = {
        id: participantId,
        name: moderatorName,
        role: 'moderator',
        hasVoted: false
      };

      // Create initial user story
      const initialStory: UserStory = {
        id: `story-${Date.now()}`,
        title: 'User Story',
        description: 'As a user, I want to estimate story points so that I can plan my sprint effectively.',
        isCompleted: false
      };

      const session: Session = {
        id: sessionId,
        roomCode: generateRoomCode(),
        moderatorId: participantId,
        participants: [moderator],
        userStories: [initialStory],
        currentStoryIndex: 0,
        votingScale,
        votesVisible: false,
        isActive: true,
        createdAt: Date.now()
      };

      await saveSession(session);
      setCurrentSession(session);
      localStorage.setItem('current-user-id', participantId);
      
      setCurrentSessionState(session);
      setCurrentUser(moderator);
      setAppState('session');
    } catch (error) {
      console.error('Error creating session:', error);
      setJoinError('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (roomCode: string, participantName: string) => {
    setLoading(true);
    setJoinError('');
    
    try {
      console.log('Attempting to join session with room code:', roomCode);
      const session = await getSessionByRoomCode(roomCode);
      
      if (!session) {
        console.log('Session not found for room code:', roomCode);
        setJoinError('Session not found. Please check the room code.');
        setLoading(false);
        return;
      }

      console.log('Session found:', session);

      const participantId = generateId();
      const participant: Participant = {
        id: participantId,
        name: participantName,
        role: 'participant',
        hasVoted: false
      };

      try {
        const updatedSession = await addParticipantToSession(session.id, participant);
        if (updatedSession) {
          setCurrentSession(updatedSession);
          localStorage.setItem('current-user-id', participantId);
          
          setCurrentSessionState(updatedSession);
          setCurrentUser(participant);
          setAppState('session');
          setJoinError('');
          setPrefilledRoomCode(''); // Clear prefilled room code after successful join
        } else {
          setJoinError('Failed to join session. Please try again.');
        }
      } catch (addParticipantError: any) {
        console.error('Error adding participant:', addParticipantError);
        setJoinError(addParticipantError.message || 'Failed to join session. Please try again.');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      setJoinError('Failed to join session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSession = async (session: Session) => {
    try {
      await saveSession(session);
      setCurrentSessionState(session);
      setCurrentSession(session);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleLeaveSession = async () => {
    if (currentSession && currentUser) {
      try {
        if (currentUser.role === 'moderator') {
          // If moderator leaves, end the session
          const updatedSession = { ...currentSession, isActive: false };
          await saveSession(updatedSession);
        } else {
          // Remove participant from session
          await removeParticipantFromSession(currentSession.id, currentUser.id);
        }
      } catch (error) {
        console.error('Error leaving session:', error);
      }
    }
    
    clearCurrentSession();
    localStorage.removeItem('current-user-id');
    setCurrentSessionState(null);
    setCurrentUser(null);
    setAppState('home');
  };

  const handleBackToHome = () => {
    setAppState('home');
    setJoinError('');
    setPrefilledRoomCode(''); // Clear prefilled room code when going back
  };

  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    switch (appState) {
      case 'create':
        return <CreateSession onCreateSession={handleCreateSession} onBack={handleBackToHome} />;
      case 'join':
        return (
          <JoinSession 
            onJoinSession={handleJoinSession} 
            onBack={handleBackToHome} 
            error={joinError}
            prefilledRoomCode={prefilledRoomCode}
          />
        );
      case 'session':
        if (currentSession && currentUser) {
          return (
            <SessionView
              session={currentSession}
              currentUser={currentUser}
              onUpdateSession={handleUpdateSession}
              onLeaveSession={handleLeaveSession}
            />
          );
        }
        return null;
      default:
        return (
          <Home
            onCreateSession={() => setAppState('create')}
            onJoinSession={() => setAppState('join')}
          />
        );
    }
  };

  return (
    <div className={theme}>
      {/* Database Test Component - only show in development */}
      {process.env.NODE_ENV === 'development' && showDbTest && <DatabaseTest />}
      
      {/* Toggle button for database test */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowDbTest(!showDbTest)}
          className="fixed bottom-4 left-4 bg-gray-800 text-white px-3 py-1 rounded text-xs z-40"
        >
          DB Test
        </button>
      )}
      
      {renderCurrentView()}
    </div>
  );
}

export default App;