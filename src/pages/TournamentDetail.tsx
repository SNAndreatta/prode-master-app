import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTournamentById, Tournament } from '@/api/tournaments';

const TournamentDetail = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return (
    <div className="p-6">
      <p className="text-red-500 mb-4">{error}</p>
      <Link to="/tournaments" className="text-primary">Back to tournaments</Link>
    </div>
  );

  if (!tournament) return <p className="p-4">Tournament not found</p>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{tournament.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{tournament.description}</p>
              <p className="text-sm">Privacy: {tournament.is_public ? 'Public' : 'Private'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
