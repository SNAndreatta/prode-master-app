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

  const data = await response.json();
  console.log('Fixtures API response:', data);

  // Handle both array and object-wrapped responses
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.fixtures)) {
    return data.fixtures;
  }

  console.warn('Unexpected fixtures API response format:', data);
  return [];
};

export type PredictionRequest = {
  match_id: number;
  goals_home: number;
  goals_away: number;
};

export type PredictionWithMatch = {
  id: number;
  match_id: number;
  goals_home: number;
  goals_away: number;
  points?: number | null;
};

export const getPredictions = async (params: {
  round_id?: number;
  league_id?: number;
  match_id?: number;
}): Promise<PredictionWithMatch[]> => {
  const token = getToken();
  const queryParams = new URLSearchParams();
  
  if (params.round_id) queryParams.append('round_id', params.round_id.toString());
  if (params.league_id) queryParams.append('league_id', params.league_id.toString());
  if (params.match_id) queryParams.append('match_id', params.match_id.toString());

  const response = await fetch(`${API_BASE}/predictions?${queryParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch predictions');
  }

  return response.json();
};

export const submitPrediction = async (
  data: PredictionRequest
): Promise<{ success: boolean }> => {
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
    let message = 'Failed to submit prediction';
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
