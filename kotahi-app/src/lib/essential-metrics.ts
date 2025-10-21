import { posthog } from "./posthog";

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

// User engagement metrics
export const trackUserEngagement = () => {
  const user = getCurrentUser();
  posthog.capture("$user_engagement", {
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
    timestamp: new Date().toISOString(),
  });
};

// Session tracking
export const trackSessionStart = () => {
  const user = getCurrentUser();
  posthog.capture("$session_start", {
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
    session_duration: 0,
    timestamp: new Date().toISOString(),
  });
};

export const trackSessionEnd = (duration: number) => {
  const user = getCurrentUser();
  posthog.capture("$session_end", {
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
    session_duration: duration,
    timestamp: new Date().toISOString(),
  });
};

// Feature usage tracking
export const trackFeatureUsage = (
  featureName: string,
  additionalProperties?: Record<string, any>
) => {
  const user = getCurrentUser();
  posthog.capture("$feature_used", {
    feature_name: featureName,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
    timestamp: new Date().toISOString(),
    ...additionalProperties,
  });
};

// Error tracking
export const trackError = (error: Error, context?: string) => {
  const user = getCurrentUser();
  posthog.capture("$error", {
    error_message: error.message,
    error_stack: error.stack,
    error_context: context,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
    timestamp: new Date().toISOString(),
  });
};

// Performance tracking
export const trackPerformance = (
  metricName: string,
  value: number,
  unit: string = "ms"
) => {
  const user = getCurrentUser();
  posthog.capture("$performance_metric", {
    metric_name: metricName,
    metric_value: value,
    metric_unit: unit,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
    timestamp: new Date().toISOString(),
  });
};

// Learning progress tracking
export const trackLearningProgress = (
  progressType: string,
  progressValue: number,
  additionalData?: Record<string, any>
) => {
  const user = getCurrentUser();
  posthog.capture("$learning_progress", {
    progress_type: progressType,
    progress_value: progressValue,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
    timestamp: new Date().toISOString(),
    ...additionalData,
  });
};

// User behavior patterns
export const trackUserBehavior = (
  behaviorType: string,
  behaviorData?: Record<string, any>
) => {
  const user = getCurrentUser();
  posthog.capture("$user_behavior", {
    behavior_type: behaviorType,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
    timestamp: new Date().toISOString(),
    ...behaviorData,
  });
};

// Conversion tracking
export const trackConversion = (
  conversionType: string,
  conversionValue?: number,
  additionalData?: Record<string, any>
) => {
  const user = getCurrentUser();
  posthog.capture("$conversion", {
    conversion_type: conversionType,
    conversion_value: conversionValue,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
    timestamp: new Date().toISOString(),
    ...additionalData,
  });
};

// Retention tracking
export const trackRetention = (
  retentionType: string,
  daysSinceFirstVisit: number
) => {
  const user = getCurrentUser();
  posthog.capture("$retention", {
    retention_type: retentionType,
    days_since_first_visit: daysSinceFirstVisit,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
    timestamp: new Date().toISOString(),
  });
};

// A/B testing support
export const trackExperiment = (
  experimentName: string,
  variant: string,
  additionalData?: Record<string, any>
) => {
  const user = getCurrentUser();
  posthog.capture("$experiment", {
    experiment_name: experimentName,
    experiment_variant: variant,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
    timestamp: new Date().toISOString(),
    ...additionalData,
  });
};

// Custom event tracking with user context
export const trackCustomEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  const user = getCurrentUser();
  posthog.capture(eventName, {
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
    timestamp: new Date().toISOString(),
    ...properties,
  });
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
  const user = getCurrentUser();
  posthog.capture("$user_property_changed", {
    property_name: propertyName,
    old_value: oldValue,
    new_value: newValue,
    user_id: user?.user_id,
    user_email: user?.email,
    user_role: user?.role,
    timestamp: new Date().toISOString(),
  });
};
