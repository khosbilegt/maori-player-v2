"use client";
import React, { useState } from "react";
import { MessageSquare, Send, ThumbsUp, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSubmitFeedbackMutation } from "@/lib/api";
import type { FeedbackRequest } from "@/lib/types";

function FeedbackPage() {
  const [submitFeedback, { isLoading, isSuccess, error }] =
    useSubmitFeedbackMutation();
  const [formData, setFormData] = useState<FeedbackRequest>({
    email: "",
    feedback_type: "",
    title: "",
    message: "",
    rating: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitFeedback(formData).unwrap();
      // Reset form on success
      setFormData({
        email: "",
        feedback_type: "",
        title: "",
        message: "",
        rating: "",
      });
    } catch (err) {
      // Error is handled by the error state
      console.error("Failed to submit feedback:", err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-card rounded-lg border shadow-sm p-8 md:p-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-6">
              <MessageSquare className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-card-foreground mb-4">
              Help Shape Tokotoko
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We&rsquo;re just getting started, and your thoughts will help us
              improve. Tell us what&rsquo;s working, what&rsquo;s confusing, or
              what you&rsquo;d love to see next.
            </p>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                      Feedback Sent!
                    </h3>
                    <p className="text-green-700 dark:text-green-300">
                      Thank you for helping us improve Tokotoko!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                      Error Sending Feedback
                    </h3>
                    <p className="text-red-700 dark:text-red-300">
                      There was a problem sending your feedback. Please try
                      again.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Form */}
          <div className="max-w-2xl mx-auto">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="feedback-type"
                  className="block text-sm font-medium text-card-foreground mb-2"
                >
                  Type of Feedback
                </label>
                <select
                  id="feedback-type"
                  name="feedback_type"
                  value={formData.feedback_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="">Select feedback type</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="improvement">Improvement Suggestion</option>
                  <option value="usability">Usability Issue</option>
                  <option value="content">Content Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-card-foreground mb-2"
                >
                  Email (optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="your@email.com (for follow-up)"
                />
              </div>

              <div>
                <label
                  htmlFor="feedback-title"
                  className="block text-sm font-medium text-card-foreground mb-2"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="feedback-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Brief summary of your feedback"
                />
              </div>

              <div>
                <label
                  htmlFor="feedback-message"
                  className="block text-sm font-medium text-card-foreground mb-2"
                >
                  Feedback
                </label>
                <textarea
                  id="feedback-message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Tell us what&rsquo;s working, what&rsquo;s not, or what you&rsquo;d love to see next..."
                ></textarea>
              </div>

              <div>
                <label
                  htmlFor="rating"
                  className="block text-sm font-medium text-card-foreground mb-2"
                >
                  Overall Experience
                </label>
                <select
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="">Select rating</option>
                  <option value="5">Excellent - Love it!</option>
                  <option value="4">Good - Works well</option>
                  <option value="3">Okay - Has potential</option>
                  <option value="2">Poor - Needs work</option>
                  <option value="1">Terrible - Major issues</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/help">Back to Help Center</Link>
                </Button>
              </div>
            </form>

            {/* Feedback Categories */}
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 text-center">
                What We&rsquo;re Looking For
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted border border-border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <ThumbsUp className="w-5 h-5 text-foreground mr-2" />
                    <h4 className="font-medium text-card-foreground">
                      What&rsquo;s Working
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Features you love, smooth experiences, or anything that
                    makes learning enjoyable.
                  </p>
                </div>
                <div className="bg-muted border border-border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="w-5 h-5 text-foreground mr-2" />
                    <h4 className="font-medium text-card-foreground">
                      Ideas &amp; Improvements
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    New features you&rsquo;d like to see, ways to make things
                    easier, or creative suggestions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;
