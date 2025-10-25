import { supabase } from '../lib/supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8888';

class ChatService {
  private async getAccessToken(): Promise<string | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session?.access_token ?? null;
  }

  /**
   * Transcribe audio to text using the backend API
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const token = await this.getAccessToken();

    // Create FormData to send the audio file
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/chat/transcribe`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Transcription failed' }));
      throw new Error(error.message || `Transcription failed with status: ${response.status}`);
    }

    const result = await response.json();
    return result.text;
  }
}

export const chatService = new ChatService();
