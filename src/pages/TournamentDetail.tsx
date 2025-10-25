import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Trophy, Medal, Loader2, Users, Calendar, Shield, Settings } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';
import { getTournamentById, getTournamentLeaderboard, getTournamentParticipants, updateTournament, Tournament, TournamentLeaderboardEntry, ParticipantOut, TournamentUpdate } from '@/api/tournaments';
import { getLeagueById, League } from '@/api/leagues';
import { useAuth } from '@/auth/authContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingButton } from '@/components/LoadingButton';
import { z } from 'zod';

const tournamentUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  description: z.string().trim().max(500, 'Description must be less than 500 characters').optional(),
  is_public: z.boolean().optional(),
  max_participants: z.number().min(2, 'Min 2 participants').max(1000, 'Max 1000 participants').optional(),
});

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { isAuthenticated, user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [leaderboard, setLeaderboard] = useState<TournamentLeaderboardEntry[]>([]);
  const [participants, setParticipants] = useState<ParticipantOut[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<TournamentUpdate>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const [tournamentData, leaderboardData, participantsData] = await Promise.all([
          getTournamentById(Number(id)),
          getTournamentLeaderboard(Number(id)),
          getTournamentParticipants(Number(id))
        ]);
        setTournament(tournamentData);
        setLeaderboard(leaderboardData);
        setParticipants(participantsData);
        
        // Fetch league data
        try {
          const leagueData = await getLeagueById(tournamentData.league_id);
          setLeague(leagueData);
        } catch (error) {
          console.error('Failed to fetch league', error);
        }
      } catch (error) {
        addNotification(error instanceof Error ? error.message : 'Failed to load tournament', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const isAdmin = tournament && user?.user_id === tournament.creator_id;

  const handleUpdateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;

    try {
      const validatedData = tournamentUpdateSchema.parse(editForm);
      setSubmitting(true);
      
      const updated = await updateTournament(tournament.id, validatedData);
      setTournament(updated);
      addNotification('Tournament updated successfully!', 'success');
      setIsEditing(false);
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

  const startEditing = () => {
    if (!tournament) return;
    setEditForm({
      name: tournament.name,
      description: tournament.description || '',
      is_public: tournament.is_public,
      max_participants: tournament.max_participants,
    });
    setIsEditing(true);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 text-center font-bold text-muted-foreground">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Tournament not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate('/tournaments')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tournaments
        </Button>

        {/* Tournament Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-primary" />
                  {tournament.name}
                </CardTitle>
                {tournament.description && (
                  <CardDescription className="text-base mt-2">{tournament.description}</CardDescription>
                )}
              </div>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startEditing}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Tournament
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {league && (
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">League:</span>
                  <span className="font-medium">{league.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium">{tournament.is_public ? 'Public' : 'Private'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Max Participants:</span>
                <span className="font-medium">{tournament.max_participants}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">{new Date(tournament.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Edit Form */}
        {isAdmin && isEditing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Edit Tournament
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateTournament} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Tournament Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Enter tournament name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Enter tournament description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-max-participants">Max Participants</Label>
                  <Input
                    id="edit-max-participants"
                    type="number"
                    min="2"
                    max="1000"
                    value={editForm.max_participants || 100}
                    onChange={(e) => setEditForm({ ...editForm, max_participants: Number(e.target.value) })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="edit-public"
                      checked={editForm.is_public ?? true}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, is_public: checked })}
                    />
                    <Label htmlFor="edit-public">Public Tournament</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <LoadingButton type="submit" loading={submitting}>
                    Save Changes
                  </LoadingButton>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Leaderboard and Participants */}
        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>
          
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-primary" />
                  Leaderboard
                </CardTitle>
                <CardDescription>
                  Rankings based on prediction accuracy and points earned
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isAuthenticated ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Login to view the leaderboard</p>
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
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{entry.points}</p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No leaderboard data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  Participants ({participants.length})
                </CardTitle>
                <CardDescription>
                  All users participating in this tournament
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isAuthenticated ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Login to view participants</p>
                  </div>
                ) : participants.length > 0 ? (
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-4 p-3 rounded-lg border bg-card"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">{participant.username}</p>
                          <p className="text-sm text-muted-foreground">{participant.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(participant.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No participants yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TournamentDetail;
