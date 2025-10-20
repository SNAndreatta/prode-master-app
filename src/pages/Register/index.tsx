import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/LoadingButton';
import { useAuth } from '@/auth/authContext';
import { saveToken } from '@/auth/token';
import { register } from '@/api/auth';
import { useNotification } from '@/context/NotificationContext';

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
}

export const RegisterModal = ({ open, onClose }: RegisterModalProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password) {
      addNotification('Please fill all fields', 'error');
      return;
    }

    if (password.length < 6) {
      addNotification('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await register({ username, email, password });
      saveToken(response.access_token);
      login(response.access_token);
      addNotification('Registration successful!', 'success');
      onClose();
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (error) {
      addNotification(error instanceof Error ? error.message : 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Sign Up</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="reg-username">Username</Label>
            <Input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              disabled={loading}
            />
          </div>
          <LoadingButton type="submit" loading={loading} className="w-full">
            Sign Up
          </LoadingButton>
        </form>
      </DialogContent>
    </Dialog>
  );
};
