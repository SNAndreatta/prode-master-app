import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/authContext';
import { getMyTournaments, Tournament } from '@/api/tournaments';

const TournamentsPage = () => {
  const [activeTab, setActiveTab] = useState<'join' | 'view' | 'create'>('join');
  const { isAuthenticated } = useAuth();
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(false);

  useEffect(() => {
    const fetchMy = async () => {
      if (activeTab !== 'view') return;
      if (!isAuthenticated) return;
      setLoadingTournaments(true);
      try {
        const data = await getMyTournaments();
        setMyTournaments(data);
      } catch (err) {
        console.error('Failed to load my tournaments', err);
      } finally {
        setLoadingTournaments(false);
      }
    };

    fetchMy();
  }, [activeTab, isAuthenticated]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
              <Trophy className="w-10 h-10 text-primary" />
              Tournaments
            </h1>
            <p className="text-muted-foreground">
              Join tournaments with friends or create your own
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button
              variant={activeTab === 'join' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setActiveTab('join')}
              className="h-auto py-6"
            >
              <Users className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-bold">Join Tournament</div>
                <div className="text-xs opacity-80">Enter with a code</div>
              </div>
            </Button>

            <Button
              variant={activeTab === 'view' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setActiveTab('view')}
              className="h-auto py-6"
            >
              <Eye className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-bold">View Tournament</div>
                <div className="text-xs opacity-80">Check standings</div>
              </div>
            </Button>

            <Button
              variant={activeTab === 'create' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setActiveTab('create')}
              className="h-auto py-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-bold">Create Tournament</div>
                <div className="text-xs opacity-80">Start your own</div>
              </div>
            </Button>
          </div>

          {/* Content Area */}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'join' && 'Join a Tournament'}
                {activeTab === 'view' && 'My Tournaments'}
                {activeTab === 'create' && 'Create New Tournament'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'join' && 'Enter a tournament code to join'}
                {activeTab === 'view' && 'View your active and past tournaments'}
                {activeTab === 'create' && 'Set up a new tournament for you and your friends'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === 'join' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tournament Code</label>
                    <input
                      type="text"
                      placeholder="Enter code (e.g., ABC123)"
                      className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button className="w-full">Join Tournament</Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Get the tournament code from your friend or group admin
                  </p>
                </div>
              )}

              {activeTab === 'view' && (
                <div className="py-4">
                  {!isAuthenticated && (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Login to view your tournaments</p>
                      <Button variant="outline" onClick={() => setActiveTab('join')}>
                        Join a Tournament
                      </Button>
                    </div>
                  )}

                  {isAuthenticated && (
                    <div>
                      {loadingTournaments && <p className="text-sm text-muted-foreground">Loading...</p>}
                      {!loadingTournaments && myTournaments.length === 0 && (
                        <div className="text-center py-12">
                          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">You haven't joined any tournaments yet</p>
                          <Button variant="outline" onClick={() => setActiveTab('join')}>
                            Join Your First Tournament
                          </Button>
                        </div>
                      )}

                      {!loadingTournaments && myTournaments.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {myTournaments.map((t) => (
                            <Card key={t.id} className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold">{t.name}</h3>
                                  <p className="text-sm text-muted-foreground">{t.description}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <Link to={`/tournaments/${t.id}`}>View</Link>
                                  <span className="text-xs text-muted-foreground">{t.is_public ? 'Public' : 'Private'}</span>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'create' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tournament Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Friends Premier League 2025"
                      className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                    <textarea
                      placeholder="Tell participants about your tournament..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">League</label>
                    <select className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Select a league</option>
                      <option>Premier League</option>
                      <option>La Liga</option>
                      <option>Serie A</option>
                      <option>Bundesliga</option>
                    </select>
                  </div>
                  <Button className="w-full">Create Tournament</Button>
                  <p className="text-sm text-muted-foreground text-center">
                    You'll receive a shareable code after creating the tournament
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TournamentsPage;
