import React from "react";
import { Shield, Info, Eye, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-card rounded-lg border shadow-sm p-8 md:p-12">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-6">
              <Shield className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-card-foreground mb-4">
              Your Privacy Matters
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're committed to protecting your personal information and being
              transparent about our practices.
            </p>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-muted border-l-4 border-border p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Info className="w-6 h-6 text-foreground mt-1" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    Current Status: Early Testing Phase
                  </h3>
                  <p className="text-muted-foreground">
                    Tokotoko is currently in early testing. We only collect the
                    minimum data needed to run the platform and improve your
                    experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Principles */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-muted border border-border rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center mr-3">
                    <div className="w-4 h-4 bg-foreground rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    No Data Sales
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  We will never sell your personal data to third parties. Your
                  information stays with us.
                </p>
              </div>

              <div className="bg-muted border border-border rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Eye className="w-6 h-6 text-foreground mr-3" />
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Transparency
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  As we grow, we'll expand this policy and be transparent about
                  any changes.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-12 pt-8 border-t border-border">
              <p className="text-muted-foreground mb-4">
                Questions about our privacy practices?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link
                    href="/help/contact"
                    className="inline-flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contact Support
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/help">Help Center</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
