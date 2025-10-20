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

  return response.json();
};
