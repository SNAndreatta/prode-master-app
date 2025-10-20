import { getToken } from '@/auth/token';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export type Team = {
  id: number;
  name: string;
  logo?: string | null;
};

export type Fixture = {
  id: number;
  date: string;
  status: string;
  home_team: Team;
  away_team: Team;
  home_goals?: number | null;
  away_goals?: number | null;
  prediction?: {
    home_goals: number;
    away_goals: number;
    points?: number | null;
  } | null;
};

export const getFixtures = async (leagueId: number, roundName: string): Promise<Fixture[]> => {
  const response = await fetch(
    `${API_BASE}/fixtures?league_id=${leagueId}&round_name=${encodeURIComponent(roundName)}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch fixtures');
  }

  return response.json();
};

export type PredictionRequest = {
  fixture_id: number;
  home_goals: number;
  away_goals: number;
};

export const submitPrediction = async (data: PredictionRequest): Promise<{ success: boolean }> => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE}/predictions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to submit prediction');
  }

  return response.json();
};
