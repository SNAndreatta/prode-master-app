import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/auth/authContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { NotificationContainer } from "@/components/Notification";
import { Header } from "@/components/Header";
import Home from "./pages/Home";
import LeaguePage from "./pages/League";
import SelectPage from "./pages/Select";
import LeaderboardPage from "./pages/Leaderboard";
import TournamentsPage from "./pages/Tournaments";
import TournamentDetail from "./pages/TournamentDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/select" element={<SelectPage />} />
              <Route path="/leagues/:country" element={<LeaguePage />} />
              <Route path="/leaderboard/:leagueId" element={<LeaderboardPage />} />
              <Route path="/tournaments" element={<TournamentsPage />} />
              <Route path="/tournaments/:id" element={<TournamentDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <NotificationContainer />
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
