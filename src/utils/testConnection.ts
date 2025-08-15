import { supabase } from '../lib/supabase';
import { generateRoomCode } from './sessionManager';

export async function testDatabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('sessions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection error:', error);
      return false;
    }
    
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

export async function createTestSession() {
  try {
    const testSession = {
      id: 'test-session-' + Date.now(),
      room_code: generateRoomCode(),
      moderator_id: 'test-moderator',
      participants: [{ id: 'test-moderator', name: 'Test User', role: 'moderator', hasVoted: false }],
      current_story: 'Test story',
      voting_scale: { name: 'Fibonacci', values: ['1', '2', '3', '5', '8', '13', '21'] },
      votes_visible: false,
      is_active: true
    };

    const { data, error } = await supabase
      .from('sessions')
      .insert(testSession)
      .select()
      .single();

    if (error) {
      console.error('Error creating test session:', error);
      return null;
    }

    console.log('Test session created:', data);
    return data;
  } catch (error) {
    console.error('Failed to create test session:', error);
    return null;
  }
}