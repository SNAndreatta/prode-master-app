import { useState } from 'react';
import { Fixture } from '@/api/fixtures';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Send } from 'lucide-react';
import { Shield } from 'lucide-react';
import { LoadingButton } from './LoadingButton';
import { Badge } from '@/components/ui/badge';

interface FixtureCardProps {
  fixture: Fixture;
  onSubmitPrediction: (fixtureId: number, homeGoals: number, awayGoals: number) => Promise<void>;
  isAuthenticated: boolean;
}

export const FixtureCard = ({ fixture, onSubmitPrediction, isAuthenticated }: FixtureCardProps) => {
  const [homeGoals, setHomeGoals] = useState(fixture.prediction?.home_goals ?? 0);
  const [awayGoals, setAwayGoals] = useState(fixture.prediction?.away_goals ?? 0);
  const [loading, setLoading] = useState(false);

  const isFinished = fixture.status === 'FT' || fixture.status === 'Finished';
  const hasResult = fixture.home_goals !== null && fixture.away_goals !== null;

  const handleSubmit = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      await onSubmitPrediction(fixture.id, homeGoals, awayGoals);
    } finally {
      setLoading(false);
    }
  };

  const adjustGoals = (team: 'home' | 'away', delta: number) => {
    if (team === 'home') {
      setHomeGoals(Math.max(0, homeGoals + delta));
    } else {
      setAwayGoals(Math.max(0, awayGoals + delta));
    }
  };

  return (
    <Card className="bg-gradient-card border-border overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant={isFinished ? 'secondary' : 'default'}>
            {fixture.status}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(fixture.date).toLocaleDateString()}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 items-center mb-6">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-2">
            {fixture.home_team.logo ? (
              <img src={fixture.home_team.logo} alt={fixture.home_team.name} className="w-12 h-12 object-contain" />
            ) : (
              <Shield className="w-12 h-12 text-muted-foreground" />
            )}
            <p className="text-sm font-medium text-center">{fixture.home_team.name}</p>
          </div>

          {/* Score/Prediction */}
          <div className="flex flex-col items-center gap-3">
            {hasResult && (
              <div className="text-3xl font-bold text-success">
                {fixture.home_goals} - {fixture.away_goals}
              </div>
            )}
            {!isFinished && isAuthenticated && (
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <Button size="sm" variant="outline" onClick={() => adjustGoals('home', 1)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Input
                    type="number"
                    value={homeGoals}
                    onChange={(e) => setHomeGoals(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 text-center"
                    min="0"
                  />
                  <Button size="sm" variant="outline" onClick={() => adjustGoals('home', -1)}>
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
                <span className="text-xl font-bold">-</span>
                <div className="flex flex-col items-center gap-1">
                  <Button size="sm" variant="outline" onClick={() => adjustGoals('away', 1)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Input
                    type="number"
                    value={awayGoals}
                    onChange={(e) => setAwayGoals(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 text-center"
                    min="0"
                  />
                  <Button size="sm" variant="outline" onClick={() => adjustGoals('away', -1)}>
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
            {!isAuthenticated && <p className="text-sm text-muted-foreground">Login to predict</p>}
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-2">
            {fixture.away_team.logo ? (
              <img src={fixture.away_team.logo} alt={fixture.away_team.name} className="w-12 h-12 object-contain" />
            ) : (
              <Shield className="w-12 h-12 text-muted-foreground" />
            )}
            <p className="text-sm font-medium text-center">{fixture.away_team.name}</p>
          </div>
        </div>

        {/* Submit or Points */}
        <div className="flex justify-center">
          {isFinished && fixture.prediction?.points !== undefined && (
            <Badge className="bg-success text-success-foreground">
              Points: {fixture.prediction.points}
            </Badge>
          )}
          {!isFinished && isAuthenticated && (
            <LoadingButton onClick={handleSubmit} loading={loading} size="sm">
              <Send className="w-4 h-4 mr-2" />
              Submit Prediction
            </LoadingButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
