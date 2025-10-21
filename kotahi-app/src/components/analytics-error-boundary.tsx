"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { trackError } from "@/lib/essential-metrics";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AnalyticsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Track error in PostHog
    trackError(error, `Error Boundary: ${errorInfo.componentStack}`);

    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-[200px] p-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-600 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">
                We've been notified about this error and are working to fix it.
              </p>
              <button
                onClick={() =>
                  this.setState({ hasError: false, error: undefined })
                }
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
