const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export type League = {
    id: number;
    name: string;
    logo?: string | null;
    season?: number | null;
};

export const getLeaguesByCountry = async (countryName: string): Promise<League[]> => {
    const response = await fetch(`${API_BASE}/leagues?country_name=${encodeURIComponent(countryName)}`);

    if (!response.ok) {
        throw new Error('Failed to fetch leagues');
    }

    const data = await response.json();
    console.log('Leagues API response:', data);

    // Case 1: API returns an array directly
    if (Array.isArray(data)) {
        return data;
    }

    // Case 2: API wraps data in a property (e.g. { leagues: [...] })
    if (Array.isArray(data.leagues)) {
        return data.leagues;
    }

    console.warn('Unexpected leagues API response format:', data);
    return [];
};

// ----------------------------
// Countries helper (same fix)
// ----------------------------
export type Country = {
    name: string;
    code?: string | null;
    flag?: string | null;
};

export const getCountriesWithLeagues = async (): Promise<Country[]> => {
    const response = await fetch(`${API_BASE}/countries_with_league`);

    if (!response.ok) {
        throw new Error('Failed to fetch countries');
    }

    const data = await response.json();
    console.log('Countries API response:', data);

    // Case 1: Direct array
    if (Array.isArray(data)) {
        return data;
    }

    // Case 2: Wrapped object (e.g. { countries: [...] })
    if (Array.isArray(data.countries)) {
        return data.countries;
    }

    console.warn('Unexpected countries API response format:', data);
    return [];
};

export const getRoundsByLeague = async (leagueId: number): Promise<string[]> => {
    const response = await fetch(`${API_BASE}/rounds/by-league?league_id=${leagueId}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch rounds');
    }

    const data = await response.json();
    console.log('Rounds API response:', data);

    if (data.status === 'success' && Array.isArray(data.rounds)) {
        return data.rounds.map(round => round.name);
    }

    console.warn('Unexpected rounds API response format:', data);
    return [];
};
