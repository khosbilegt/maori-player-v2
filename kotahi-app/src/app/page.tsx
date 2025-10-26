"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to library
  if (isAuthenticated) {
    router.push("/library");
    return null;
  }

  // Show landing page for unauthenticated users
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to Tokotoko
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
              Your gateway to learning Maori language and culture through
              immersive video content
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Learning</CardTitle>
                  <CardDescription>
                    Learn Maori through engaging video content with interactive
                    subtitles and vocabulary tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Video-based lessons with Maori subtitles</li>
                    <li>• Interactive vocabulary learning</li>
                    <li>• Progress tracking and watch history</li>
                    <li>• Personalized learning lists</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cultural Immersion</CardTitle>
                  <CardDescription>
                    Experience Maori culture through authentic content and
                    traditional stories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Traditional Maori stories and legends</li>
                    <li>• Cultural context and explanations</li>
                    <li>• Pronunciation guides and tips</li>
                    <li>• Community learning features</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Ready to start your Maori learning journey?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/auth/register">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
