"use client";

import React, { Suspense } from "react";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function FAQPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card rounded-lg border shadow-sm p-8 md:p-12">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-6">
                <HelpCircle className="w-8 h-8 text-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-card-foreground mb-4">
                Quick Answers
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We&rsquo;re still collecting questions from our first group of
                users — check back soon as we grow this page!
              </p>
            </div>

            {/* FAQ Content */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-muted border border-border rounded-lg p-8 text-center">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-card-foreground mb-3">
                  No FAQs Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  We&rsquo;re still in early testing and learning from our first
                  users. As we gather more questions and feedback, we&rsquo;ll
                  add helpful answers here to make your experience smoother.
                </p>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    In the meantime: if something&rsquo;s unclear, send us a
                    note on our Contact Us page.
                  </p>
                  <Button asChild>
                    <Link
                      href="/help/contact"
                      className="inline-flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Us
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-card-foreground mb-6 text-center">
                  What to Expect
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-muted border border-border rounded-lg">
                    <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-sm font-semibold text-foreground">
                        1
                      </span>
                    </div>
                    <h3 className="font-semibold text-card-foreground mb-2">
                      Getting Started
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      How to create an account, navigate the platform, and
                      access your learning materials.
                    </p>
                  </div>
                  <div className="text-center p-6 bg-muted border border-border rounded-lg">
                    <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-sm font-semibold text-foreground">
                        2
                      </span>
                    </div>
                    <h3 className="font-semibold text-card-foreground mb-2">
                      Video Features
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Understanding subtitles, vocabulary tools, and how to
                      track your learning progress.
                    </p>
                  </div>
                  <div className="text-center p-6 bg-muted border border-border rounded-lg">
                    <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-sm font-semibold text-foreground">
                        3
                      </span>
                    </div>
                    <h3 className="font-semibold text-card-foreground mb-2">
                      Account & Privacy
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Managing your account settings, understanding our privacy
                      practices, and data security.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Help Center */}
            <div className="text-center mt-12 pt-8 border-t border-border">
              <Button variant="outline" asChild>
                <Link href="/help">Back to Help Center</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

export default FAQPage;
