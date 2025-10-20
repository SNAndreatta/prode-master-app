import { League } from '@/api/leagues';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeagueCardProps {
  league: League;
  onClick: () => void;
}

export const LeagueCard = ({ league, onClick }: LeagueCardProps) => {
  return (
    <Card 
      className="group cursor-pointer transition-all hover:scale-105 hover:shadow-glow-primary bg-gradient-card border-border overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-6 flex items-center gap-4">
        {league.logo ? (
          <img 
            src={league.logo} 
            alt={league.name} 
            className="w-16 h-16 object-contain rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg">
            <Trophy className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
            {league.name}
          </h3>
          {league.season && (
            <Badge variant="secondary" className="mt-2">
              Season {league.season}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
