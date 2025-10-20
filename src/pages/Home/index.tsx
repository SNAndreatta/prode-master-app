import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CountryCard } from '@/components/CountryCard';
import { Country, getCountriesWithLeagues } from '@/api/countries';
import { useNotification } from '@/context/NotificationContext';
import { Loader2, Trophy, Target, Users } from 'lucide-react';

const Home = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getCountriesWithLeagues();
        setCountries(data);
      } catch (error) {
        addNotification('Failed to load countries', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const handleCountryClick = (countryName: string) => {
    navigate(`/leagues/${encodeURIComponent(countryName)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-4">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">The Ultimate Football Prediction Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Prode Master
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Predict match results, compete with friends in tournaments, and climb the leaderboards. 
            Test your football knowledge across leagues worldwide.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-card border border-border rounded-lg">
              <Target className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Make Predictions</h3>
              <p className="text-sm text-muted-foreground">
                Predict scores for matches across multiple leagues and earn points
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-lg">
              <Users className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Join Tournaments</h3>
              <p className="text-sm text-muted-foreground">
                Create or join tournaments with friends and compete for the top spot
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-lg">
              <Trophy className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Climb Leaderboards</h3>
              <p className="text-sm text-muted-foreground">
                Track your progress and see how you rank against other predictors
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Select Your Country
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {countries.map((country) => (
              <CountryCard
                key={country.name}
                country={country}
                onClick={() => handleCountryClick(country.name)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
