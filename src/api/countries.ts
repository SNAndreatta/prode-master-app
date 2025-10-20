const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

  return response.json();
};
