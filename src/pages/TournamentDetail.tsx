import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTournamentById, getTournamentLeaderboard, Tournament, TournamentLeaderboardEntry } from '@/api/tournaments';
import { Trophy, Medal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@/context/NotificationContext';

const TournamentDetail = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<TournamentLeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchTournament = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getTournamentById(parseInt(id, 10));
        setTournament(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load tournament');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!id) return;
      setLoadingLeaderboard(true);
      try {
        const data = await getTournamentLeaderboard(parseInt(id, 10));
        setLeaderboard(data);
      } catch (err: any) {
        console.error('Failed to load tournament leaderboard', err);
        addNotification?.('Failed to load leaderboard', 'error');
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return (
    <div className="p-6">
      <p className="text-red-500 mb-4">{error}</p>
      <Link to="/tournaments" className="text-primary">Back to tournaments</Link>
    </div>
  );

  if (!tournament) return <p className="p-4">Tournament not found</p>;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 text-center font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          Back
        </Button>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{tournament.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{tournament.description}</p>
              <p className="text-sm mb-4">Privacy: {tournament.is_public ? 'Public' : 'Private'}</p>

              <h3 className="text-lg font-semibold mb-4">Leaderboard</h3>

              {loadingLeaderboard ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                        entry.rank <= 3 ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
                      }`}
                    >
                      <div className="flex items-center justify-center w-10">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{entry.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.correct_predictions ?? 0}/{entry.total_predictions ?? 0} correct predictions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{entry.points}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No leaderboard data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
