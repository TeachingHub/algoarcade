import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { useAuth } from "./context/AuthContext";
import Loader from "./components/shared/Loader";

// Eagerly loaded
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import Games from "./pages/games/Games";
import TSP from "./pages/games/TSP";
import Pathfinding from "./pages/games/Pathfinding";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ErrorBoundary from "./components/shared/ErrorBoundary";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}><Loader /></div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, userProfile, loading } = useAuth();

    if (loading) {
        return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}><Loader /></div>;
    }

    if (!user || userProfile?.role !== "ADMIN") {
        return <Navigate to="/404" replace />;
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
                <Route path="/games/tsp" element={
                    <ErrorBoundary>
                        <TSP />
                    </ErrorBoundary>
                } />
                <Route path="/games/pathfinding" element={
                    <ErrorBoundary>
                        <Pathfinding />
                    </ErrorBoundary>
                } />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
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