import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy, Medal, Loader2 } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

type LeaderboardEntry = {
  rank: number;
  username: string;
  points: number;
  correctPredictions: number;
  totalPredictions: number;
};

const LeaderboardPage = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leagueName, setLeagueName] = useState('League');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // TODO: Replace with actual API call
        // const data = await getLeagueLeaderboard(Number(leagueId));
        
        // Mock data for now
        const mockData: LeaderboardEntry[] = [
          { rank: 1, username: 'ProPredictor', points: 245, correctPredictions: 82, totalPredictions: 100 },
          { rank: 2, username: 'FootballFan', points: 238, correctPredictions: 79, totalPredictions: 100 },
          { rank: 3, username: 'ScoreKing', points: 230, correctPredictions: 77, totalPredictions: 100 },
          { rank: 4, username: 'MatchMaster', points: 225, correctPredictions: 75, totalPredictions: 98 },
          { rank: 5, username: 'GoalGuru', points: 218, correctPredictions: 73, totalPredictions: 97 },
        ];
        
        setLeaderboard(mockData);
        setLeagueName('Premier League'); // TODO: Fetch actual league name
      } catch (error) {
        addNotification('Failed to load leaderboard', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [leagueId]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 text-center font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Trophy className="w-8 h-8 text-primary" />
              {leagueName} Leaderboard
            </CardTitle>
            <CardDescription>
              Rankings based on prediction accuracy and points earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
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
                        {entry.correctPredictions}/{entry.totalPredictions} correct predictions
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
              <div className="text-center py-20">
                <p className="text-muted-foreground">No leaderboard data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaderboardPage;
