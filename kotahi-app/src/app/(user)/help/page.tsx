"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import {
  MessageCircle,
  HelpCircle,
  FileText,
  Shield,
  Scroll,
  Cookie,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function HelpCenterPage() {
  const helpSections = [
    {
      title: "Contact Us",
      description:
        "Have a question, idea, or issue? Drop us a message and we\u2019ll be in touch soon.",
      href: "/help/contact",
      icon: MessageCircle,
    },
    {
      title: "FAQ",
      description:
        "We\u2019re still collecting questions from our first group of users — check back soon!",
      href: "/help/faq",
      icon: HelpCircle,
    },
    {
      title: "Feedback",
      description:
        "Help shape Tokotoko by telling us what\u2019s working and what you\u2019d love to see next.",
      href: "/help/feedback",
      icon: FileText,
    },
    {
      title: "Privacy Policy",
      description:
        "Learn about how we protect your personal information and handle your data.",
      href: "/help/privacy",
      icon: Shield,
    },
    {
      title: "Terms of Service",
      description: "Early access terms and guidelines for using Tokotoko.",
      href: "/help/terms",
      icon: Scroll,
    },
    {
      title: "Cookie Policy",
      description:
        "Information about how we use cookies to make Tokotoko work smoothly.",
      href: "/help/cookies",
      icon: Cookie,
    },
  ];

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
                Need a Hand?
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Welcome to the Tokotoko Help Center! We&rsquo;re building this
                space as we grow, so it&rsquo;s still pretty light. For now, you
                can reach out any time through our contact page — we&rsquo;ll
                get back to you as quickly as we can.
              </p>
            </div>

            {/* Help Sections Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpSections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <Link key={index} href={section.href} className="group block">
                    <div className="bg-muted border border-border rounded-lg p-6 h-full hover:border-ring transition-colors duration-200">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center mr-3">
                          <IconComponent className="w-5 h-5 text-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-card-foreground group-hover:text-ring transition-colors">
                          {section.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Quick Contact CTA */}
            <div className="text-center mt-12 pt-8 border-t border-border">
              <p className="text-muted-foreground mb-4">
                Can&rsquo;t find what you&rsquo;re looking for?
              </p>
              <Button asChild>
                <Link
                  href="/help/contact"
                  className="inline-flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Support
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

export default HelpCenterPage;
