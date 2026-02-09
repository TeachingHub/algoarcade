import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuth } from "./context/AuthContext";
import EditProfilePage from "./pages/EditProfilePage";
import Games from "./pages/games/Games";
import TSP from "./pages/games/TSP";
import NotFound from "./pages/NotFound";
import Pathfinding from "./pages/games/Pathfinding";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Index />}></Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/tsp" element={<TSP />} />
        <Route path="/games/pathfinding" element={<Pathfinding />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/edit" element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/404" replace />} />
        <Route path="/404" element={<NotFound />} />
      </Routes>

    </BrowserRouter>
  );
}