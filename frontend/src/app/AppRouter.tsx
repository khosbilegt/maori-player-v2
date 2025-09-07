import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import VideoPage from "../pages/VideoPage";
import HomePage from "../pages/HomePage";
import LibraryPage from "../pages/LibraryPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProtectedRoute from "../components/ProtectedRoute";
import Navigation from "../components/Navigation";

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
            path="/library"
            element={
              <ProtectedRoute>
                <LibraryPage />
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
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default AppRouter;
