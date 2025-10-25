import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Users, Plus, Eye, Loader2, Settings, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/authContext';
import { useNotification } from '@/context/NotificationContext';
import { 
  getPublicTournaments, 
  getMyTournaments, 
  createTournament, 
  updateTournament,
  joinTournament,
  Tournament, 
  TournamentCreate,
  TournamentUpdate 
} from '@/api/tournaments';
import { getLeagues, League } from '@/api/leagues';
import { z } from 'zod';
import { LoadingButton } from '@/components/LoadingButton';

const tournamentCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().trim().max(500, 'Description must be less than 500 characters').optional(),
  league_id: z.number({ required_error: 'League is required' }),
  is_public: z.boolean(),
  max_participants: z.number().min(2, 'Min 2 participants').max(1000, 'Max 1000 participants'),
});

const tournamentUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  description: z.string().trim().max(500, 'Description must be less than 500 characters').optional(),
  is_public: z.boolean().optional(),
  max_participants: z.number().min(2, 'Min 2 participants').max(1000, 'Max 1000 participants').optional(),
});

const TournamentsPage = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'my' | 'join' | 'create'>('browse');
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotification();
  
  const [publicTournaments, setPublicTournaments] = useState<Tournament[]>([]);
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [loadingMy, setLoadingMy] = useState(false);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Join form
  const [joinCode, setJoinCode] = useState('');

  // Create form
  const [createForm, setCreateForm] = useState<TournamentCreate>({
    name: '',
    description: '',
    league_id: 0,
    is_public: true,
    max_participants: 100,
  });

  // Edit form
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [editForm, setEditForm] = useState<TournamentUpdate>({});

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchPublicTournaments();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'my' && isAuthenticated) {
      fetchMyTournaments();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if ((activeTab === 'create' || editingTournament) && leagues.length === 0) {
      fetchLeagues();
    }
  }, [activeTab, editingTournament]);

  const fetchPublicTournaments = async () => {
    setLoadingPublic(true);
    try {
      const data = await getPublicTournaments();
      setPublicTournaments(data);
    } catch (error) {
      addNotification(error instanceof Error ? error.message : 'Failed to load tournaments', 'error');
    } finally {
      setLoadingPublic(false);
    }
  };

  const fetchMyTournaments = async () => {
    setLoadingMy(true);
    try {
      const data = await getMyTournaments();
      setMyTournaments(data);
    } catch (error) {
      addNotification(error instanceof Error ? error.message : 'Failed to load your tournaments', 'error');
    } finally {
      setLoadingMy(false);
    }
  };

  const fetchLeagues = async () => {
    setLoadingLeagues(true);
    try {
      const data = await getLeagues();
      setLeagues(data);
    } catch (error) {
      addNotification('Failed to load leagues', 'error');
    } finally {
      setLoadingLeagues(false);
    }
  };

  const handleJoinTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      addNotification('Please login to join tournaments', 'error');
      return;
    }

    if (!joinCode.trim()) {
      addNotification('Please enter a tournament code', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await joinTournament(joinCode.trim());
      addNotification('Successfully joined tournament!', 'success');
      setJoinCode('');
      setActiveTab('my');
    } catch (error) {
      addNotification(error instanceof Error ? error.message : 'Failed to join tournament', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      addNotification('Please login to create tournaments', 'error');
      return;
    }

    try {
      tournamentCreateSchema.parse(createForm);
      setSubmitting(true);
      
      await createTournament(createForm);
      addNotification('Tournament created successfully!', 'success');
      setCreateForm({
        name: '',
        description: '',
        league_id: 0,
        is_public: true,
        max_participants: 100,
      });
      setActiveTab('my');
    } catch (error) {
      if (error instanceof z.ZodError) {
        addNotification(error.errors[0].message, 'error');
      } else {
        addNotification(error instanceof Error ? error.message : 'Failed to create tournament', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTournament) return;

    try {
      const validatedData = tournamentUpdateSchema.parse(editForm);
      setSubmitting(true);
      
      await updateTournament(editingTournament.id, validatedData);
      addNotification('Tournament updated successfully!', 'success');
      setEditingTournament(null);
      setEditForm({});
      fetchMyTournaments();
    } catch (error) {
      if (error instanceof z.ZodError) {
        addNotification(error.errors[0].message, 'error');
      } else {
        addNotification(error instanceof Error ? error.message : 'Failed to update tournament', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setEditForm({
      name: tournament.name,
      description: tournament.description || '',
      is_public: tournament.is_public,
      max_participants: tournament.max_participants,
    });
  };

  const canEdit = (tournament: Tournament) => {
    return isAuthenticated && user?.user_id === tournament.creator_id;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button
              variant={activeTab === 'browse' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setActiveTab('browse')}
              className="h-auto py-4"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Browse
            </Button>

            <Button
              variant={activeTab === 'my' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setActiveTab('my')}
              className="h-auto py-4"
            >
              <Eye className="w-5 h-5 mr-2" />
              My Tournaments
            </Button>

            <Button
              variant={activeTab === 'join' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setActiveTab('join')}
              className="h-auto py-4"
            >
              <Users className="w-5 h-5 mr-2" />
              Join
            </Button>

            <Button
              variant={activeTab === 'create' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setActiveTab('create')}
              className="h-auto py-4"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create
            </Button>
          </div>

          {/* Browse Public Tournaments */}
          {activeTab === 'browse' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Public Tournaments</h2>
              {loadingPublic ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : publicTournaments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publicTournaments.map((tournament) => (
                    <Card key={tournament.id} className="hover:border-primary transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">{tournament.name}</CardTitle>
                        {tournament.description && (
                          <CardDescription className="line-clamp-2">{tournament.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-muted-foreground">Max: {tournament.max_participants}</span>
                          <span className="text-muted-foreground">{tournament.is_public ? 'Public' : 'Private'}</span>
                        </div>
                        <Link to={`/tournaments/${tournament.id}`}>
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No public tournaments available</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* My Tournaments */}
          {activeTab === 'my' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">My Tournaments</h2>
              {!isAuthenticated ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Login to view your tournaments</p>
                  </CardContent>
                </Card>
              ) : loadingMy ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : myTournaments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myTournaments.map((tournament) => (
                    <Card key={tournament.id} className="hover:border-primary transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{tournament.name}</CardTitle>
                          {canEdit(tournament) && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => startEditing(tournament)}
                              className="h-8 w-8"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {tournament.description && (
                          <CardDescription className="line-clamp-2">{tournament.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-muted-foreground">Max: {tournament.max_participants}</span>
                          <span className="text-muted-foreground">{tournament.is_public ? 'Public' : 'Private'}</span>
                        </div>
                        <Link to={`/tournaments/${tournament.id}`}>
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Leaderboard
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">You haven't joined any tournaments yet</p>
                    <Button variant="outline" onClick={() => setActiveTab('browse')}>
                      Browse Tournaments
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Join Tournament */}
          {activeTab === 'join' && (
            <Card>
              <CardHeader>
                <CardTitle>Join a Tournament</CardTitle>
                <CardDescription>Enter a tournament code to join</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinTournament} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Tournament Code</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="Enter code (e.g., ABC123)"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      disabled={submitting}
                      maxLength={20}
                    />
                  </div>
                  <LoadingButton type="submit" loading={submitting} className="w-full">
                    Join Tournament
                  </LoadingButton>
                  <p className="text-sm text-muted-foreground text-center">
                    Get the tournament code from your friend or group admin
                  </p>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Create Tournament */}
          {activeTab === 'create' && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Tournament</CardTitle>
                <CardDescription>Set up a new tournament for you and your friends</CardDescription>
              </CardHeader>
              <CardContent>
                {!isAuthenticated ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Please login to create tournaments</p>
                  </div>
                ) : (
                  <form onSubmit={handleCreateTournament} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Tournament Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="e.g., Friends Premier League 2025"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        disabled={submitting}
                        maxLength={100}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Tell participants about your tournament..."
                        rows={3}
                        value={createForm.description}
                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                        disabled={submitting}
                        maxLength={500}
                      />
                    </div>
                    <div>
                      <Label htmlFor="league">League *</Label>
                      {loadingLeagues ? (
                        <div className="flex items-center gap-2 py-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Loading leagues...</span>
                        </div>
                      ) : (
                        <Select
                          value={createForm.league_id.toString()}
                          onValueChange={(value) => setCreateForm({ ...createForm, league_id: Number(value) })}
                          disabled={submitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a league" />
                          </SelectTrigger>
                          <SelectContent>
                            {leagues.map((league) => (
                              <SelectItem key={league.id} value={league.id.toString()}>
                                {league.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="max_participants">Max Participants *</Label>
                      <Input
                        id="max_participants"
                        type="number"
                        min={2}
                        max={1000}
                        value={createForm.max_participants}
                        onChange={(e) => setCreateForm({ ...createForm, max_participants: Number(e.target.value) })}
                        disabled={submitting}
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_public"
                        checked={createForm.is_public}
                        onChange={(e) => setCreateForm({ ...createForm, is_public: e.target.checked })}
                        disabled={submitting}
                        className="rounded"
                      />
                      <Label htmlFor="is_public" className="cursor-pointer">Make tournament public</Label>
                    </div>
                    <LoadingButton type="submit" loading={submitting} className="w-full">
                      Create Tournament
                    </LoadingButton>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {/* Edit Tournament Modal */}
          {editingTournament && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Edit Tournament</CardTitle>
                  <CardDescription>Update your tournament settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateTournament} className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name">Tournament Name</Label>
                      <Input
                        id="edit-name"
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        disabled={submitting}
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        rows={3}
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        disabled={submitting}
                        maxLength={500}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-max">Max Participants</Label>
                      <Input
                        id="edit-max"
                        type="number"
                        min={2}
                        max={1000}
                        value={editForm.max_participants || 100}
                        onChange={(e) => setEditForm({ ...editForm, max_participants: Number(e.target.value) })}
                        disabled={submitting}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="edit-public"
                        checked={editForm.is_public ?? true}
                        onChange={(e) => setEditForm({ ...editForm, is_public: e.target.checked })}
                        disabled={submitting}
                        className="rounded"
                      />
                      <Label htmlFor="edit-public" className="cursor-pointer">Make tournament public</Label>
                    </div>
                    <div className="flex gap-2">
                      <LoadingButton type="submit" loading={submitting} className="flex-1">
                        Save Changes
                      </LoadingButton>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingTournament(null);
                          setEditForm({});
                        }}
                        disabled={submitting}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentsPage;
