import { BrowserRouter, Routes, Route } from "react-router-dom";
import VideoPage from "../pages/VideoPage";
import HomePage from "../pages/HomePage";
import LibraryPage from "../pages/LibraryPage";

function AppRouter() {
  // Set basename for GitHub Pages deployment
  const basename =
    import.meta.env.PROD && window.location.hostname.includes("github.io")
      ? "/maori-player"
      : "";

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/video/:videoId" element={<VideoPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
