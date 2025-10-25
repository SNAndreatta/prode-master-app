import { getToken } from '@/auth/token';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export type Tournament = {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  is_public: boolean;
  created_by?: number | null;
};

export type TournamentLeaderboardEntry = {
  rank: number;
  username: string;
  points: number;
  correct_predictions?: number;
  total_predictions?: number;
};

export const getMyTournaments = async (): Promise<Tournament[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/tournaments/my`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
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
