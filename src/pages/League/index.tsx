import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LeagueCard } from '@/components/LeagueCard';
import { FixtureCard } from '@/components/FixtureCard';
import { League, getLeaguesByCountry } from '@/api/leagues';
import { Fixture, getFixtures, submitPrediction } from '@/api/fixtures';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/auth/authContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';

const LeaguePage = () => {
  const { country } = useParams<{ country: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { isAuthenticated } = useAuth();

  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>('');
  const [rounds, setRounds] = useState<string[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [loadingFixtures, setLoadingFixtures] = useState(false);

  useEffect(() => {
    const fetchLeagues = async () => {
      if (!country) return;
      
      try {
        const data = await getLeaguesByCountry(decodeURIComponent(country));
        setLeagues(data);
      } catch (error) {
        addNotification('Failed to load leagues', 'error');
      } finally {
        setLoadingLeagues(false);
      }
    };

    fetchLeagues();
  }, [country]);

  useEffect(() => {
    if (!selectedLeague) return;

    const fetchRounds = async () => {
      // Generate typical rounds (this should ideally come from API)
      const generatedRounds = Array.from({ length: 38 }, (_, i) => `Regular Season - ${i + 1}`);
      setRounds(generatedRounds);
      setSelectedRound(generatedRounds[0]);
    };

    fetchRounds();
  }, [selectedLeague]);

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
      
      // Refresh fixtures to get updated prediction
      if (selectedLeague && selectedRound) {
        const data = await getFixtures(selectedLeague.id, selectedRound);
        setFixtures(data);
      }
    } catch (error) {
      addNotification(error instanceof Error ? error.message : 'Failed to submit prediction', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Countries
        </Button>

        <h1 className="text-4xl font-bold mb-8">
          {country ? decodeURIComponent(country) : 'Leagues'}
        </h1>

        {!selectedLeague ? (
          <>
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
                    onClick={() => setSelectedLeague(league)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedLeague.logo && (
                  <img src={selectedLeague.logo} alt={selectedLeague.name} className="w-12 h-12 object-contain" />
                )}
                <h2 className="text-2xl font-bold">{selectedLeague.name}</h2>
              </div>
              <Button variant="outline" onClick={() => setSelectedLeague(null)}>
                Change League
              </Button>
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

export default LeaguePage;
