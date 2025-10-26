"use client";

import React, { Suspense } from "react";
import { Scroll, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function TermsOfServicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card rounded-lg border shadow-sm p-8 md:p-12">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-6">
                <Scroll className="w-8 h-8 text-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-card-foreground mb-4">
                Early Access Terms
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                By using Tokotoko, you agree to the following terms and
                conditions.
              </p>
            </div>

            {/* Terms Content */}
            <div className="max-w-3xl mx-auto prose prose-lg max-w-none">
              <div className="bg-muted border-l-4 border-border p-6 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-foreground mt-1 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                      Early Testing Phase
                    </h3>
                    <p className="text-muted-foreground">
                      Tokotoko is currently in early testing and development.
                      These terms reflect our current stage and will be updated
                      as we grow and learn from our users.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms Sections */}
              <div className="space-y-8">
                <section>
                  <div className="bg-muted border border-border rounded-lg p-6">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-foreground mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-card-foreground mb-2">
                          Use the platform respectfully and lawfully
                        </h3>
                        <ul className="text-muted-foreground space-y-2 text-sm">
                          <li>
                            • Respect other users and maintain a positive
                            learning environment
                          </li>
                          <li>
                            • Don&rsquo;t attempt to hack, disrupt, or damage
                            the platform
                          </li>
                          <li>• Follow all applicable laws and regulations</li>
                          <li>
                            • Don&rsquo;t share inappropriate or harmful content
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="bg-muted border border-border rounded-lg p-6">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-foreground mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-card-foreground mb-2">
                          Understand that this is an MVP — things may change
                          quickly
                        </h3>
                        <ul className="text-muted-foreground space-y-2 text-sm">
                          <li>
                            • Features may be added, removed, or modified
                            without notice
                          </li>
                          <li>
                            • The platform may experience downtime or technical
                            issues
                          </li>
                          <li>
                            • User interface and experience will evolve rapidly
                          </li>
                          <li>
                            • Some features may not work as expected during
                            testing
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Additional Terms */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-card-foreground mb-4">
                  Additional Terms
                </h2>
                <div className="space-y-6">
                  <div className="bg-muted border border-border rounded-lg p-6">
                    <h3 className="font-semibold text-card-foreground mb-2">
                      Account Responsibility
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      You are responsible for maintaining the security of your
                      account and for all activities that occur under your
                      account. Notify us immediately of any unauthorized use.
                    </p>
                  </div>

                  <div className="bg-muted border border-border rounded-lg p-6">
                    <h3 className="font-semibold text-card-foreground mb-2">
                      Content and Intellectual Property
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      All content on Tokotoko, including videos, text, and
                      materials, is protected by intellectual property laws. You
                      may not reproduce, distribute, or create derivative works
                      without permission.
                    </p>
                  </div>

                  <div className="bg-muted border border-border rounded-lg p-6">
                    <h3 className="font-semibold text-card-foreground mb-2">
                      Limitation of Liability
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      As an early testing platform, Tokotoko is provided
                      &quot;as is&quot; without warranties. We are not liable
                      for any issues, data loss, or interruptions that may
                      occur.
                    </p>
                  </div>

                  <div className="bg-muted border border-border rounded-lg p-6">
                    <h3 className="font-semibold text-card-foreground mb-2">
                      Termination
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      We may suspend or terminate your access to Tokotoko at any
                      time, with or without notice, especially during this early
                      testing phase.
                    </p>
                  </div>

                  <div className="bg-muted border border-border rounded-lg p-6">
                    <h3 className="font-semibold text-card-foreground mb-2">
                      Changes to Terms
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      We may update these terms as we learn from early users and
                      develop the platform. Continued use after changes
                      constitutes acceptance of the new terms.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data and Privacy */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-card-foreground mb-4">
                  Data and Privacy
                </h2>
                <div className="bg-muted border border-border rounded-lg p-6">
                  <p className="text-muted-foreground mb-4">
                    We collect minimal data needed to run the platform and
                    improve your experience. We will never sell your data to
                    third parties.
                  </p>
                  <p className="text-muted-foreground">
                    For detailed information about how we handle your data,
                    please see our
                    <Link
                      href="/help/privacy"
                      className="text-foreground hover:underline ml-1"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </section>

              {/* Contact */}
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-card-foreground mb-4">
                  Contact
                </h2>
                <div className="bg-muted border border-border rounded-lg p-6">
                  <p className="text-muted-foreground mb-4">
                    If you have questions about these terms or need to report a
                    violation, please contact us through our
                    <Link
                      href="/help/contact"
                      className="text-foreground hover:underline ml-1"
                    >
                      Contact Us
                    </Link>{" "}
                    page.
                  </p>
                </div>
              </section>

              {/* Last Updated */}
              <div className="mt-12 pt-8 border-t border-border text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Last updated:{" "}
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <Button variant="outline" asChild>
                  <Link href="/help">Back to Help Center</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

export default TermsOfServicePage;
