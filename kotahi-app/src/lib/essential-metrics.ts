import { posthog } from "./posthog";

// Session ID management
let sessionId: string | null = null;
let sessionStartTime: number | null = null;

const getOrCreateSessionId = (): string => {
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    sessionStartTime = Date.now();

    // Store in sessionStorage to persist across page reloads
    if (typeof window !== "undefined") {
      sessionStorage.setItem("posthog_session_id", sessionId);
      sessionStorage.setItem(
        "posthog_session_start",
        sessionStartTime.toString()
      );
    }
  }
  return sessionId;
};

// Restore session ID from sessionStorage on page load
if (typeof window !== "undefined") {
  const storedSessionId = sessionStorage.getItem("posthog_session_id");
  const storedSessionStart = sessionStorage.getItem("posthog_session_start");
  if (storedSessionId && storedSessionStart) {
    sessionId = storedSessionId;
    sessionStartTime = parseInt(storedSessionStart, 10);

    // Check if session is older than 30 minutes (expire it)
    const sessionAge = Date.now() - sessionStartTime;
    if (sessionAge > 30 * 60 * 1000) {
      sessionId = null;
      sessionStartTime = null;
      sessionStorage.removeItem("posthog_session_id");
      sessionStorage.removeItem("posthog_session_start");
    }
  }
}

// Helper to get current user info
const getCurrentUser = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return {
          user_id: payload.user_id,
          email: payload.email,
          username: payload.username,
          role: payload.role,
        };
      } catch (error) {
        console.warn("Failed to decode user token:", error);
      }
    }
  }
  return null;
};

// Get standard event properties for all events
const getStandardProperties = (additionalProperties?: Record<string, any>) => {
  const user = getCurrentUser();
  const sessionIdValue = getOrCreateSessionId();

  return {
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
    session_id: sessionIdValue,
    timestamp: new Date().toISOString(),
    ...additionalProperties,
  };
};

// User engagement metrics
export const trackUserEngagement = () => {
  posthog.capture("$user_engagement", getStandardProperties());
};

// Session tracking
export const trackSessionStart = () => {
  const props = getStandardProperties({
    session_duration: 0,
  });
  posthog.capture("$session_start", props);
};

export const trackSessionEnd = (duration: number) => {
  posthog.capture(
    "$session_end",
    getStandardProperties({
      session_duration: duration,
    })
  );

  // Reset session
  sessionId = null;
  sessionStartTime = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("posthog_session_id");
    sessionStorage.removeItem("posthog_session_start");
  }
};

// Feature usage tracking
export const trackFeatureUsage = (
  featureName: string,
  additionalProperties?: Record<string, any>
) => {
  posthog.capture(
    "$feature_used",
    getStandardProperties({
      feature_name: featureName,
      ...additionalProperties,
    })
  );
};

// Video-specific tracking with required properties
export const trackVideoEvent = (
  eventName: string,
  videoId: string,
  additionalProperties?: Record<string, any>
) => {
  posthog.capture(
    eventName,
    getStandardProperties({
      video_id: videoId,
      ...additionalProperties,
    })
  );
};

// Error tracking
export const trackError = (error: Error, context?: string) => {
  posthog.capture(
    "$error",
    getStandardProperties({
      error_message: error.message,
      error_stack: error.stack,
      error_context: context,
    })
  );
};

// Performance tracking
export const trackPerformance = (
  metricName: string,
  value: number,
  unit: string = "ms"
) => {
  posthog.capture(
    "$performance_metric",
    getStandardProperties({
      metric_name: metricName,
      metric_value: value,
      metric_unit: unit,
    })
  );
};

// Learning progress tracking
export const trackLearningProgress = (
  progressType: string,
  progressValue: number,
  additionalData?: Record<string, any>
) => {
  posthog.capture(
    "$learning_progress",
    getStandardProperties({
      progress_type: progressType,
      progress_value: progressValue,
      ...additionalData,
    })
  );
};

// User behavior patterns
export const trackUserBehavior = (
  behaviorType: string,
  behaviorData?: Record<string, any>
) => {
  posthog.capture(
    "$user_behavior",
    getStandardProperties({
      behavior_type: behaviorType,
      ...behaviorData,
    })
  );
};

// Conversion tracking
export const trackConversion = (
  conversionType: string,
  conversionValue?: number,
  additionalData?: Record<string, any>
) => {
  posthog.capture(
    "$conversion",
    getStandardProperties({
      conversion_type: conversionType,
      conversion_value: conversionValue,
      ...additionalData,
    })
  );
};

// Retention tracking
export const trackRetention = (
  retentionType: string,
  daysSinceFirstVisit: number
) => {
  posthog.capture(
    "$retention",
    getStandardProperties({
      retention_type: retentionType,
      days_since_first_visit: daysSinceFirstVisit,
    })
  );
};

// A/B testing support
export const trackExperiment = (
  experimentName: string,
  variant: string,
  additionalData?: Record<string, any>
) => {
  posthog.capture(
    "$experiment",
    getStandardProperties({
      experiment_name: experimentName,
      experiment_variant: variant,
      ...additionalData,
    })
  );
};

// Custom event tracking with user context
export const trackCustomEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  posthog.capture(eventName, getStandardProperties(properties));
};

// Set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  const user = getCurrentUser();
  if (user?.user_id) {
    posthog.people.set({
      ...properties,
      last_updated: new Date().toISOString(),
    });
  }
};

// Track user properties changes
export const trackUserPropertyChange = (
  propertyName: string,
  oldValue: any,
  newValue: any
) => {
  posthog.capture(
    "$user_property_changed",
    getStandardProperties({
      property_name: propertyName,
      old_value: oldValue,
      new_value: newValue,
    })
  );
};
