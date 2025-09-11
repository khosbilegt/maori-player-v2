import { useProfileCheck } from "../hooks/useProfileCheck";

/**
 * ProfileChecker component that handles periodic profile validation
 *
 * This component:
 * - Calls /api/v1/auth/profile every 5 minutes when user is authenticated
 * - Checks profile immediately when the app loads (if user is authenticated)
 * - Automatically logs out the user if a 401 response is received
 * - Updates user data if profile is valid and has changed
 *
 * This component should be placed inside the AuthProvider
 */
const ProfileChecker: React.FC = () => {
  // Use the profile check hook with default settings:
  // - Check every 5 minutes
  // - Check on mount when authenticated
  useProfileCheck({
    intervalMs: 5 * 60 * 1000, // 5 minutes
    checkOnMount: true,
  });

  // This component doesn't render anything
  return null;
};

export default ProfileChecker;
