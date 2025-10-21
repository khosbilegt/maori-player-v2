"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { posthog } from "./posthog";

export const usePageView = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }

      // Track pageview with custom properties
      posthog.capture("$pageview", {
        $current_url: url,
        page_title: document.title,
        page_path: pathname,
      });
    }
  }, [pathname, searchParams]);
};
