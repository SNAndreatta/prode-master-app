import { getToken } from '@/auth/token';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export type Country = {
  name: string;
  code?: string | null;
  flag?: string | null;
};

export type Team = {
  id: number;
  name: string;
  logo?: string | null;
  country: Country;
};

export type PredictionRequest = {
  match_id: number;
  goals_home?: number | null;
  goals_away?: number | null;
};

export type PredictionWithMatch = PredictionRequest & {
  id: number;
  points?: number | null;
};

export type Fixture = {
  id: number;
  league: number;
  date: string;
  status: string;
  round?: string;
  home_team: Team;
  away_team: Team;
  home_team_score?: number | null;
  away_team_score?: number | null;
  home_pens_score?: number | null;
  away_pens_score?: number | null;
  prediction: PredictionWithMatch; // always defined
};

export const getFixtures = async (leagueId: number, roundName: string, token?: string): Promise<Fixture[]> => {
  // Fetch fixtures
  const fixtureResp = await fetch(
    `${API_BASE}/fixtures?league_id=${leagueId}&round_name=${encodeURIComponent(roundName)}`
  );
  if (!fixtureResp.ok) throw new Error('Failed to fetch fixtures');

  const fixtureData = await fixtureResp.json();
  console.log("Raw fixture data from API:", fixtureData);

  const fixtures: Fixture[] = Array.isArray(fixtureData) ? fixtureData : fixtureData.fixtures ?? [];
  console.log("Parsed fixtures array:", fixtures);

  // Initialize prediction to avoid undefined in React
  fixtures.forEach(f => {
    f.prediction = { match_id: f.id, goals_home: 0, goals_away: 0, id: 0, points: 0 };
  });

  console.log("Fixtures after initializing predictions:", fixtures);

  if (token) {
    await Promise.all(
      fixtures.map(async fixture => {
        try {
          const predResp = await fetch(`${API_BASE}/predictions?match_id=${fixture.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (predResp.ok) {
            const predictions: PredictionWithMatch[] = await predResp.json();
            console.log(`Predictions for match ${fixture.id}:`, predictions);

            if (predictions.length > 0) fixture.prediction = predictions[0];
          } else {
            console.warn(`Failed to fetch prediction for match ${fixture.id}: HTTP ${predResp.status}`);
          }
        } catch (err) {
          console.warn(`Failed to fetch prediction for match ${fixture.id}`, err);
        }
      })
    );
  }

  console.log("Final fixtures with merged predictions:", fixtures);

  return fixtures;
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
    let message = 'Failed to submit prediction';
    try {
      const error = await response.json();
      if (error.detail) message = error.detail;
    } catch {}
    throw new Error(message);
  }

  return response.json();
};
