import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CountryCard } from '@/components/CountryCard';
import { LeagueCard } from '@/components/LeagueCard';
import { FixtureCard } from '@/components/FixtureCard';
import { Country, getCountriesWithLeagues } from '@/api/countries';
import { League, getLeaguesByCountry, getRoundsByLeague } from '@/api/leagues';
import { Fixture, getFixtures, submitPrediction } from '@/api/fixtures';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/auth/authContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ChevronRight } from 'lucide-react';

const SelectPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { isAuthenticated } = useAuth();

  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>('');
  const [rounds, setRounds] = useState<string[]>([]);

  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [loadingFixtures, setLoadingFixtures] = useState(false);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getCountriesWithLeagues();
        setCountries(data);
      } catch (error) {
        addNotification('Failed to load countries', 'error');
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch leagues when country is selected
  useEffect(() => {
    if (!selectedCountry) return;

    const fetchLeagues = async () => {
      setLoadingLeagues(true);
      try {
        const data = await getLeaguesByCountry(selectedCountry.name);
        setLeagues(data);
      } catch (error) {
        addNotification('Failed to load leagues', 'error');
      } finally {
        setLoadingLeagues(false);
      }
    };
    fetchLeagues();
  }, [selectedCountry]);

  // Fetch rounds when league is selected
  useEffect(() => {
    if (!selectedLeague) return;

    const fetchRounds = async () => {
      try {
        const roundNames = await getRoundsByLeague(selectedLeague.id);
        setRounds(roundNames);
        setSelectedRound(roundNames[0]); // Select first round by default
      } catch (error) {
        addNotification('Failed to load rounds', 'error');
      }
    };
    fetchRounds();
  }, [selectedLeague]);

  // Fetch fixtures when round is selected
  useEffect(() => {
    if (!selectedLeague || !selectedRound) return;

    const fetchFixtures = async () => {
      setLoadingFixtures(true);
      try {
        const data = await getFixtures(selectedLeague.id, selectedRound);
        setFixtures(data);
      } catch (error) {
        addNotification('Failed to load fixtures', 'error');
      } finally {
        setLoadingFixtures(false);
      }
    };
    fetchFixtures();
  }, [selectedLeague, selectedRound]);

  const handlePredictionSubmit = async (fixtureId: number, homeGoals: number, awayGoals: number) => {
    try {
      await submitPrediction({ fixture_id: fixtureId, home_goals: homeGoals, away_goals: awayGoals });
      addNotification('Prediction submitted successfully!', 'success');
      
      if (selectedLeague && selectedRound) {
        const data = await getFixtures(selectedLeague.id, selectedRound);
        setFixtures(data);
      }
    } catch (error) {
      addNotification(error instanceof Error ? error.message : 'Failed to submit prediction', 'error');
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setSelectedLeague(null);
    setFixtures([]);
  };

  const handleLeagueSelect = (league: League) => {
    setSelectedLeague(league);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <button
            onClick={() => {
              setSelectedCountry(null);
              setSelectedLeague(null);
              setFixtures([]);
            }}
            className="hover:text-foreground transition-colors"
          >
            Countries
          </button>
          {selectedCountry && (
            <>
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={() => {
                  setSelectedLeague(null);
                  setFixtures([]);
                }}
                className="hover:text-foreground transition-colors"
              >
                {selectedCountry.name}
              </button>
            </>
          )}
          {selectedLeague && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">{selectedLeague.name}</span>
            </>
          )}
        </div>

        {/* Step 1: Select Country */}
        {!selectedCountry && (
          <>
            <h1 className="text-4xl font-bold mb-8">Select a Country</h1>
            {loadingCountries ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {countries.map((country) => (
                  <CountryCard
                    key={country.name}
                    country={country}
                    onClick={() => handleCountrySelect(country)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 2: Select League */}
        {selectedCountry && !selectedLeague && (
          <>
            <h1 className="text-4xl font-bold mb-8">Select a League</h1>
            {loadingLeagues ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leagues.map((league) => (
                  <LeagueCard
                    key={league.id}
                    league={league}
                    onClick={() => handleLeagueSelect(league)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 3: Select Round and View Fixtures */}
        {selectedLeague && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {selectedLeague.logo && (
                <img src={selectedLeague.logo} alt={selectedLeague.name} className="w-12 h-12 object-contain" />
              )}
              <h2 className="text-2xl font-bold">{selectedLeague.name}</h2>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Round:</span>
              <Select value={selectedRound} onValueChange={setSelectedRound}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select round" />
                </SelectTrigger>
                <SelectContent>
                  {rounds.map((round) => (
                    <SelectItem key={round} value={round}>
                      {round}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loadingFixtures ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : fixtures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fixtures.map((fixture) => (
                  <FixtureCard
                    key={fixture.id}
                    fixture={fixture}
                    onSubmitPrediction={handlePredictionSubmit}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No fixtures found for this round</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectPage;
