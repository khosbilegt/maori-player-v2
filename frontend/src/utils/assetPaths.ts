// Utility to handle asset paths for GitHub Pages deployment
export function getAssetPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Check if we're in production and on GitHub Pages
  const isProduction = import.meta.env.PROD;
  const isGitHubPages =
    isProduction &&
    (window.location.hostname.includes("github.io") ||
      window.location.hostname.includes("github.com"));

  if (isGitHubPages) {
    // For GitHub Pages, hardcode the repository name
    return `/maori-player/${cleanPath}`;
  }

  // For local development or other deployments
  return `/${cleanPath}`;
}

// Helper function specifically for video assets
export function getVideoPath(filename: string): string {
  return getAssetPath(filename);
}

// Helper function specifically for VTT subtitle files
export function getVTTPath(filename: string): string {
  return getAssetPath(filename);
}
