const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ===========================
// Types
// ===========================

export type League = {
  id: number;
  name: string;
  logo?: string | null;
  season?: number | null;
};

export type Country = {
  name: string;
  code?: string | null;
  flag?: string | null;
};

// ===========================
// League Endpoints
// ===========================

export const getLeagues = async (): Promise<League[]> => {
  const response = await fetch(`${API_BASE}/leagues`);

  if (!response.ok) {
    throw new Error('Failed to fetch leagues');
  }

  const data = await response.json();
  console.log('Leagues API response:', data);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.leagues)) {
    return data.leagues;
  }

  console.warn('Unexpected leagues API response format:', data);
  return [];
};

export const getLeagueById = async (id: number): Promise<League> => {
  const response = await fetch(`${API_BASE}/leagues/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch league');
  }

  const data = await response.json();
  console.log('League by ID API response:', data);

  // Ensure consistent object structure
  if (data && typeof data === 'object' && 'id' in data && 'name' in data) {
    return data as League;
  }

  console.warn('Unexpected league API response format:', data);
  throw new Error('Invalid league data received');
};

export const getLeaguesByCountry = async (
  countryName: string
): Promise<League[]> => {
  const response = await fetch(
    `${API_BASE}/leagues?country_name=${encodeURIComponent(countryName)}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch leagues');
  }

  const data = await response.json();
  console.log('Leagues API response (by country):', data);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.leagues)) {
    return data.leagues;
  }

  console.warn('Unexpected leagues API response format:', data);
  return [];
};

// ===========================
// Countries Endpoints
// ===========================

export const getCountriesWithLeagues = async (): Promise<Country[]> => {
  const response = await fetch(`${API_BASE}/countries_with_league`);

  if (!response.ok) {
    throw new Error('Failed to fetch countries');
  }

  const data = await response.json();
  console.log('Countries API response:', data);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.countries)) {
    return data.countries;
  }

  console.warn('Unexpected countries API response format:', data);
  return [];
};

// ===========================
// Rounds Endpoint
// ===========================

export const getRoundsByLeague = async (
  leagueId: number
): Promise<string[]> => {
  const response = await fetch(
    `${API_BASE}/rounds/by-league?league_id=${leagueId}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch rounds');
  }

  const data = await response.json();
  console.log('Rounds API response:', data);

  if (Array.isArray(data)) {
    // Direct array of round names
    return data.map((r) => (typeof r === 'string' ? r : r.name));
  }

  if (data.status === 'success' && Array.isArray(data.rounds)) {
    return data.rounds.map((round) =>
      typeof round === 'string' ? round : round.name
    );
  }

  console.warn('Unexpected rounds API response format:', data);
  return [];
};
