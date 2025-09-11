import { useEffect, useRef, useCallback } from "react";
import { apiClient } from "../utils/apiClient";
import { useAuth } from "../contexts/AuthContext";

interface UseProfileCheckOptions {
  intervalMs?: number; // Default: 5 minutes
  checkOnMount?: boolean; // Default: true
}

/**
 * Custom hook for periodic profile validation
 *
 * This hook:
 * - Calls /api/v1/auth/profile at specified intervals when user is authenticated
 * - Optionally checks profile immediately when the component mounts
 * - Automatically logs out the user if a 401 response is received
 * - Handles network errors gracefully (only logs out on 401, not on network issues)
 *
 * @param options Configuration options for the profile checking behavior
 * @returns Object with manualCheck function for triggering immediate profile check
 */

export const useProfileCheck = (options: UseProfileCheckOptions = {}) => {
  const { intervalMs = 5 * 60 * 1000, checkOnMount = true } = options;
  const { token, logout, isAuthenticated } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkProfile = useCallback(async () => {
    if (!token || !isAuthenticated) {
      return;
    }

    try {
      const { isAuthenticated: isValid } = await apiClient.checkProfile(token);

      if (!isValid) {
        console.log(
          "Profile check failed - user not authenticated, logging out"
        );
        logout();
      }
    } catch (error) {
      console.error("Profile check failed:", error);
      // Only logout on 401 errors, not on network errors
      if ((error as any)?.status === 401) {
        console.log("401 error during profile check - logging out");
        logout();
      }
    }
  }, [token, logout, isAuthenticated]);

  // Check profile on mount if enabled
  useEffect(() => {
    if (checkOnMount && isAuthenticated && token) {
      checkProfile();
    }
  }, [checkOnMount, isAuthenticated, token, checkProfile]);

  // Set up periodic checking
  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(checkProfile, intervalMs);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, token, checkProfile, intervalMs]);

  // Manual profile check function
  const manualCheck = useCallback(() => {
    checkProfile();
  }, [checkProfile]);

  return {
    manualCheck,
  };
};
