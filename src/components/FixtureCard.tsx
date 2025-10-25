import { Fixture } from '@/api/fixtures';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FixtureCardProps {
  fixture: Fixture;
  homeGoals: number;
  awayGoals: number;
  onHomeGoalsChange: (goals: number) => void;
  onAwayGoalsChange: (goals: number) => void;
  isAuthenticated: boolean;
}

export const FixtureCard = ({ 
  fixture, 
  homeGoals, 
  awayGoals, 
  onHomeGoalsChange, 
  onAwayGoalsChange, 
  isAuthenticated 
}: FixtureCardProps) => {

  const isFinished = ['FT', 'AET', 'PEN', 'Finished', 'Match Finished', 'Match Finished After Extra Time', 'Match Finished After Penalty Shootout'].includes(fixture.status);
  const hasResult = fixture.home_goals !== null && fixture.away_goals !== null;
  const prediction = fixture.prediction ?? null;

  const adjustGoals = (team: 'home' | 'away', delta: number) => {
    if (team === 'home') {
      onHomeGoalsChange(Math.max(0, homeGoals + delta));
    } else {
      onAwayGoalsChange(Math.max(0, awayGoals + delta));
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
              <div className="text-3xl font-bold text-primary">
                {fixture.home_goals} - {fixture.away_goals}
              </div>
            )}
            {isFinished && prediction && (
              <div className="text-sm text-muted-foreground text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span>Your prediction:</span>
                  <span className="font-semibold text-foreground">{prediction.home_goals} - {prediction.away_goals}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>Points earned:</span>
                  <Badge variant="default" className="bg-success">{prediction.points ?? 0}</Badge>
                </div>
              </div>
            )}
            {!isFinished && isAuthenticated && (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl font-bold tabular-nums bg-muted rounded-lg px-4 py-2 min-w-[60px] text-center">
                    {homeGoals}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => adjustGoals('home', -1)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => adjustGoals('home', 1)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <span className="text-2xl font-bold text-muted-foreground">-</span>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl font-bold tabular-nums bg-muted rounded-lg px-4 py-2 min-w-[60px] text-center">
                    {awayGoals}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => adjustGoals('away', -1)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => adjustGoals('away', 1)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
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

      </CardContent>
    </Card>
  );
};
