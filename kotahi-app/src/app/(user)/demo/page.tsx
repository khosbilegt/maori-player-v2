import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function DemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dark Mode Demo</h1>
        <p className="text-muted-foreground mt-2">
          This page demonstrates the dark mode functionality with system
          preference detection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Toggle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Use the theme toggle in the navbar to switch between light, dark,
              and system themes.
            </p>
            <Button variant="outline">Sample Button</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Preference</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The app defaults to your system's preferred color scheme. Change
              your OS theme to see it reflected here.
            </p>
            <Button variant="secondary">Secondary Button</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Persistent Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your theme preference is saved and will persist across browser
              sessions.
            </p>
            <Button variant="destructive">Destructive Button</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-16 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    Primary
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-secondary rounded-md flex items-center justify-center">
                  <span className="text-secondary-foreground text-sm font-medium">
                    Secondary
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-muted rounded-md flex items-center justify-center">
                  <span className="text-muted-foreground text-sm font-medium">
                    Muted
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-accent rounded-md flex items-center justify-center">
                  <span className="text-accent-foreground text-sm font-medium">
                    Accent
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DemoPage;
