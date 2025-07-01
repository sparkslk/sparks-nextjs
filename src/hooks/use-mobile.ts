"use client";

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Set initial value
    setIsMobile(mql.matches);

    // Listen for changes
    mql.addEventListener("change", onChange);

    // Cleanup
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
