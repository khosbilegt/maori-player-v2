import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import VideoPage from "../pages/VideoPage";
import HomePage from "../pages/HomePage";
import LibraryPage from "../pages/LibraryPage";
import HistoryPage from "../pages/HistoryPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProtectedRoute from "../components/ProtectedRoute";
import Navigation from "../components/Navigation";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminVideos from "../pages/admin/AdminVideos";
import AdminVocabulary from "../pages/admin/AdminVocabulary";
import AdminVTT from "../pages/admin/AdminVTT";
import LearningList from "../pages/LearningList";

function AppRouter() {
  // Set basename for GitHub Pages deployment
  const basename =
    import.meta.env.PROD && window.location.hostname.includes("github.io")
      ? "/maori-player"
      : "";

  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/learning"
            element={
              <ProtectedRoute>
                <LearningList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/video/:videoId"
            element={
              <ProtectedRoute>
                <VideoPage />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/videos"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminVideos />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vocabulary"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminVocabulary />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vtt"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminVTT />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default AppRouter;
