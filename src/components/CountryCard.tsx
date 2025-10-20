import { Country } from '@/api/countries';
import { Card, CardContent } from '@/components/ui/card';
import { Globe } from 'lucide-react';

interface CountryCardProps {
  country: Country;
  onClick: () => void;
}

export const CountryCard = ({ country, onClick }: CountryCardProps) => {
  return (
    <Card 
      className="group cursor-pointer transition-all hover:scale-105 hover:shadow-glow-primary bg-gradient-card border-border overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-6 flex flex-col items-center gap-4">
        {country.flag ? (
          <img 
            src={country.flag} 
            alt={country.name} 
            className="w-16 h-16 object-contain rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg">
            <Globe className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <h3 className="text-lg font-semibold text-center group-hover:text-primary transition-colors">
          {country.name}
        </h3>
      </CardContent>
    </Card>
  );
};
