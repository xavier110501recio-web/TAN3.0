import { useEffect, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { initStorage } from "./utils/storage";
import { useAuth } from "./lib/useAuth";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { AuthCallback } from "./pages/AuthCallback";
import { Start } from "./pages/Start";
import { Generating } from "./pages/Generating";
import { Dashboard } from "./pages/Dashboard";
import { CheckIn } from "./pages/CheckIn";
import { Missions } from "./pages/Missions";
import { Coach } from "./pages/Coach";
import { Community } from "./pages/Community";
import { Stack } from "./pages/Stack";
import { Upgrade } from "./pages/Upgrade";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";

export function App() {
  useEffect(() => { initStorage(); }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing preview />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/start" element={<Guard><Start /></Guard>} />
        <Route path="/generating" element={<Guard><Generating /></Guard>} />
        <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
        <Route path="/checkin" element={<Guard><CheckIn /></Guard>} />
        <Route path="/missions" element={<Guard><Missions /></Guard>} />
        <Route path="/coach" element={<Guard><Coach /></Guard>} />
        <Route path="/community" element={<Guard><Community /></Guard>} />
        <Route path="/stack" element={<Guard><Stack /></Guard>} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function Guard({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
