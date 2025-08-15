import { Session, Participant, UserStory } from '../types';
import { supabase } from '../lib/supabase';

const CURRENT_SESSION_KEY = 'pointing-poker-current-session';

export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function saveSession(session: Session): Promise<void> {
  try {
    console.log('Saving session:', session);
    
    const { error } = await supabase
      .from('sessions')
      .upsert({
        id: session.id,
        room_code: session.roomCode,
        moderator_id: session.moderatorId,
        participants: session.participants,
        current_story: JSON.stringify({
          userStories: session.userStories,
          currentStoryIndex: session.currentStoryIndex
        }),
        voting_scale: session.votingScale,
        votes_visible: session.votesVisible,
        is_active: session.isActive,
        created_at: new Date(session.createdAt).toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving session:', error);
      throw error;
    }
    
    console.log('Session saved successfully');
  } catch (error) {
    console.error('Failed to save session:', error);
    throw error;
  }
}

export async function getSessionByRoomCode(roomCode: string): Promise<Session | null> {
  try {
    console.log('Fetching session by room code:', roomCode);
    
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching session by room code:', error);
      if (error.code === 'PGRST116') {
        // No rows returned
        console.log('No session found with room code:', roomCode);
        return null;
      }
      return null;
    }

    if (!data) {
      console.log('No data returned for room code:', roomCode);
      return null;
    }

    console.log('Session found:', data);
    return convertDbSessionToSession(data);
  } catch (error) {
    console.error('Failed to get session by room code:', error);
    return null;
  }
}

export async function getSessionById(sessionId: string): Promise<Session | null> {
  try {
    console.log('Fetching session by ID:', sessionId);
    
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching session by ID:', error);
      if (error.code === 'PGRST116') {
        return null;
      }
      return null;
    }

    if (!data) return null;

    return convertDbSessionToSession(data);
  } catch (error) {
    console.error('Failed to get session by ID:', error);
    return null;
  }
}

function convertDbSessionToSession(data: any): Session {
  let userStories: UserStory[] = [];
  let currentStoryIndex = 0;

  try {
    if (data.current_story) {
      const storyData = JSON.parse(data.current_story);
      if (storyData.userStories) {
        userStories = storyData.userStories;
        currentStoryIndex = storyData.currentStoryIndex || 0;
      } else {
        // Legacy format - single story as string
        userStories = [{
          id: 'legacy-story',
          title: 'User Story',
          description: data.current_story,
          isCompleted: false
        }];
      }
    }
  } catch (error) {
    console.error('Error parsing story data:', error);
    // Fallback to legacy format
    if (data.current_story && typeof data.current_story === 'string') {
      userStories = [{
        id: 'legacy-story',
        title: 'User Story',
        description: data.current_story,
        isCompleted: false
      }];
    }
  }

  return {
    id: data.id,
    roomCode: data.room_code,
    moderatorId: data.moderator_id,
    participants: data.participants || [],
    userStories,
    currentStoryIndex,
    votingScale: data.voting_scale,
    votesVisible: data.votes_visible || false,
    isActive: data.is_active,
    createdAt: new Date(data.created_at).getTime()
  };
}

export function getCurrentSession(): Session | null {
  try {
    const sessionData = localStorage.getItem(CURRENT_SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch {
    return null;
  }
}

export function setCurrentSession(session: Session): void {
  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
}

export function clearCurrentSession(): void {
  localStorage.removeItem(CURRENT_SESSION_KEY);
}

export async function addParticipantToSession(sessionId: string, participant: Participant): Promise<Session | null> {
  try {
    console.log('Adding participant to session:', sessionId, participant);
    
    // Get the latest session data from database
    const session = await getSessionById(sessionId);
    if (!session) {
      console.log('Session not found when adding participant');
      return null;
    }

    // Check if participant already exists by name (case-insensitive)
    const existingParticipant = session.participants.find(p => 
      p.name.toLowerCase() === participant.name.toLowerCase()
    );
    
    if (existingParticipant && existingParticipant.id !== participant.id) {
      console.log('Participant with same name already exists');
      throw new Error('A participant with this name already exists in the session.');
    }

    // Check if participant already exists by ID
    const existingIndex = session.participants.findIndex(p => p.id === participant.id);
    if (existingIndex >= 0) {
      // Update existing participant
      session.participants[existingIndex] = participant;
    } else {
      // Add new participant
      session.participants.push(participant);
    }

    await saveSession(session);
    console.log('Participant added successfully');
    return session;
  } catch (error) {
    console.error('Failed to add participant:', error);
    throw error;
  }
}

export async function removeParticipantFromSession(sessionId: string, participantId: string): Promise<Session | null> {
  try {
    const session = await getSessionById(sessionId);
    if (!session) return null;

    session.participants = session.participants.filter(p => p.id !== participantId);
    await saveSession(session);
    return session;
  } catch (error) {
    console.error('Failed to remove participant:', error);
    return null;
  }
}

export async function updateParticipantVote(sessionId: string, participantId: string, vote: string): Promise<Session | null> {
  try {
    const session = await getSessionById(sessionId);
    if (!session) return null;

    const participant = session.participants.find(p => p.id === participantId);
    if (!participant) return null;

    participant.vote = vote;
    participant.hasVoted = true;

    await saveSession(session);
    return session;
  } catch (error) {
    console.error('Failed to update participant vote:', error);
    return null;
  }
}

// Real-time subscription helper with better error handling
export function subscribeToSession(sessionId: string, callback: (session: Session) => void) {
  console.log('Setting up real-time subscription for session:', sessionId);
  
  const subscription = supabase
    .channel(`session-${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`
      },
      async (payload) => {
        console.log('Real-time update received:', payload);
        try {
          if (payload.new && payload.new.is_active) {
            const session = convertDbSessionToSession(payload.new);
            callback(session);
          } else if (payload.eventType === 'DELETE' || (payload.new && !payload.new.is_active)) {
            console.log('Session was deleted or deactivated');
            // Handle session end
          }
        } catch (error) {
          console.error('Error processing real-time update:', error);
        }
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status);
    });

  return () => {
    console.log('Unsubscribing from session:', sessionId);
    subscription.unsubscribe();
  };
}