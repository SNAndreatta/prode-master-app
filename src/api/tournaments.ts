import { getToken } from '@/auth/token';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export type Tournament = {
  id: number;
  name: string;
  description?: string | null;
  is_public: boolean;
  creator_id: number;
  league_id: number;
  max_participants: number;
  created_at: string;
  updated_at: string;
};

export type TournamentCreate = {
  name: string;
  description?: string;
  league_id: number;
  is_public: boolean;
  max_participants: number;
};

export type TournamentUpdate = {
  name?: string;
  description?: string;
  is_public?: boolean;
  max_participants?: number;
};

export type TournamentLeaderboardEntry = {
  rank: number;
  username: string;
  points: number;
  correct_predictions?: number;
  total_predictions?: number;
};

export type ParticipantOut = {
  id: number;
  username: string;
  email: string;
  joined_at: string;
};

export const getAllTournaments = async (): Promise<Tournament[]> => {
  const response = await fetch(`${API_BASE}/tournaments`);

  if (!response.ok) {
    throw new Error('Failed to fetch tournaments');
  }

  return response.json();
};

export const getPublicTournaments = async (): Promise<Tournament[]> => {
  const response = await fetch(`${API_BASE}/tournaments?is_public=true`);

  if (!response.ok) {
    throw new Error('Failed to fetch public tournaments');
  }

  return response.json();
};

export const getMyTournaments = async (): Promise<Tournament[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/tournaments/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch my tournaments');
  }

  return response.json();
};

export const getTournamentById = async (id: number): Promise<Tournament> => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/tournaments/${id}`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to fetch tournament');
  }

  return response.json();
};

export const getTournamentLeaderboard = async (id: number): Promise<TournamentLeaderboardEntry[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/tournaments/${id}/leaderboard`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tournament leaderboard');
  }

  return response.json();
};

export const createTournament = async (data: TournamentCreate): Promise<Tournament> => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/tournaments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = 'Failed to create tournament';
    try {
      const error = await response.json();
      if (error.detail) message = error.detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return response.json();
};

export const updateTournament = async (id: number, data: TournamentUpdate): Promise<Tournament> => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/tournaments/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = 'Failed to update tournament';
    try {
      const error = await response.json();
      if (error.detail) message = error.detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return response.json();
};

export const joinTournament = async (tournamentId: number): Promise<{ success: boolean }> => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/tournaments/${tournamentId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = 'Failed to join tournament';
    try {
      const error = await response.json();
      if (error.detail) message = error.detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return response.json();
};

export const leaveTournament = async (tournamentId: number): Promise<{ success: boolean }> => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/tournaments/${tournamentId}/leave`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = 'Failed to leave tournament';
    try {
      const error = await response.json();
      if (error.detail) message = error.detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return response.json();
};

export const deleteTournament = async (tournamentId: number): Promise<{ success: boolean }> => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/tournaments/${tournamentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = 'Failed to delete tournament';
    try {
      const error = await response.json();
      if (error.detail) message = error.detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return response.json();
};

export const getTournamentParticipants = async (tournamentId: number): Promise<ParticipantOut[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/tournaments/${tournamentId}/participants`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tournament participants');
  }

  return response.json();
};
