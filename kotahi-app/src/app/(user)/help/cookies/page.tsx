import React from "react";
import { Cookie, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-card rounded-lg border shadow-sm p-8 md:p-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-6">
              <Cookie className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-card-foreground mb-4">
              Cookies in Tokotoko
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We use cookies (small bits of data stored in your browser) to keep
              you logged in and make Tokotoko work smoothly. We don&rsquo;t
              track you across other websites.
            </p>
          </div>

          {/* Cookie Information */}
          <div className="max-w-3xl mx-auto prose prose-lg max-w-none">
            {/* Essential Cookies */}
            <section className="mb-8">
              <div className="bg-muted border-l-4 border-border p-6">
                <div className="flex items-start">
                  <Shield className="w-6 h-6 text-foreground mt-1 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                      Essential Cookies
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      These cookies are necessary for Tokotoko to function
                      properly. They help us:
                    </p>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li>• Keep you logged in to your account</li>
                      <li>• Remember your preferences and settings</li>
                      <li>• Track your learning progress and watch history</li>
                      <li>• Ensure the platform works securely</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* What We Don't Do */}
            <section className="mb-8">
              <div className="bg-muted border-l-4 border-border p-6">
                <div className="flex items-start">
                  <Eye className="w-6 h-6 text-foreground mt-1 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                      What We Don&rsquo;t Do
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      We&rsquo;re committed to your privacy and don&rsquo;t use
                      cookies for:
                    </p>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li>• Tracking you across other websites</li>
                      <li>• Selling your data to third parties</li>
                      <li>• Targeted advertising</li>
                      <li>• Detailed behavioral profiling</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Cookie Details */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                Cookie Details
              </h2>
              <div className="space-y-6">
                <div className="bg-muted border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-card-foreground mb-2">
                    Authentication Cookies
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    <strong>Purpose:</strong> Keep you logged in securely
                  </p>
                  <p className="text-muted-foreground text-sm mb-2">
                    <strong>Duration:</strong> Until you log out or the session
                    expires
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Data:</strong> Encrypted authentication token (no
                    personal information)
                  </p>
                </div>

                <div className="bg-muted border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-card-foreground mb-2">
                    Preference Cookies
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    <strong>Purpose:</strong> Remember your settings and
                    preferences
                  </p>
                  <p className="text-muted-foreground text-sm mb-2">
                    <strong>Duration:</strong> 30 days or until you clear them
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Data:</strong> Theme preference, language settings,
                    UI preferences
                  </p>
                </div>

                <div className="bg-muted border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-card-foreground mb-2">
                    Learning Progress Cookies
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    <strong>Purpose:</strong> Track your learning progress and
                    video history
                  </p>
                  <p className="text-muted-foreground text-sm mb-2">
                    <strong>Duration:</strong> Stored until you delete your
                    account
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Data:</strong> Video watch times, progress markers,
                    vocabulary interactions
                  </p>
                </div>
              </div>
            </section>

            {/* Managing Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                Managing Cookies
              </h2>
              <div className="bg-muted border border-border rounded-lg p-6">
                <p className="text-muted-foreground mb-4">
                  You can control cookies through your browser settings.
                  However, disabling essential cookies may prevent Tokotoko from
                  working properly.
                </p>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-card-foreground mb-1">
                      Chrome
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Settings → Privacy and security → Cookies and other site
                      data
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-card-foreground mb-1">
                      Firefox
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Settings → Privacy & Security → Cookies and Site Data
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-card-foreground mb-1">
                      Safari
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Preferences → Privacy → Manage Website Data
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Updates */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                Policy Updates
              </h2>
              <div className="bg-muted border border-border rounded-lg p-6">
                <p className="text-muted-foreground">
                  As Tokotoko grows and we add new features, we may update this
                  cookie policy. We&rsquo;ll notify users of any significant
                  changes and update the date below.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                Questions?
              </h2>
              <div className="bg-muted border border-border rounded-lg p-6">
                <p className="text-muted-foreground mb-4">
                  If you have questions about our cookie usage, please contact
                  us through our
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
  );
}

export default CookiePolicyPage;
