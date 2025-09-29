import React from "react";
import { MessageSquare, Send, ThumbsUp, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function FeedbackPage() {
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
              We're just getting started, and your thoughts will help us
              improve. Tell us what's working, what's confusing, or what you'd
              love to see next.
            </p>
          </div>

          {/* Feedback Form */}
          <div className="max-w-2xl mx-auto">
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="feedback-type"
                  className="block text-sm font-medium text-card-foreground mb-2"
                >
                  Type of Feedback
                </label>
                <select
                  id="feedback-type"
                  name="feedback-type"
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
                  name="feedback-title"
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
                  name="feedback-message"
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Tell us what's working, what's not, or what you'd love to see next..."
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
                <Button type="submit" className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/help">Back to Help Center</Link>
                </Button>
              </div>
            </form>

            {/* Feedback Categories */}
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 text-center">
                What We're Looking For
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted border border-border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <ThumbsUp className="w-5 h-5 text-foreground mr-2" />
                    <h4 className="font-medium text-card-foreground">
                      What's Working
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
                      Ideas & Improvements
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    New features you'd like to see, ways to make things easier,
                    or creative suggestions.
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
