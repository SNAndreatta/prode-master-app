import { Link } from 'react-router-dom';
import { Trophy, LogOut } from 'lucide-react';
import { useAuth } from '@/auth/authContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LoginModal } from '@/pages/Login';
import { RegisterModal } from '@/pages/Register';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Trophy className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Prode Master
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground mr-2">
                  Welcome, <span className="text-foreground font-medium">{user?.username}</span>
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowLogin(true)}>
                  Login
                </Button>
                <Button variant="default" size="sm" onClick={() => setShowRegister(true)}>
                  Sign Up
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
      <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} />
    </>
  );
};
