"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useLayoutEffect, useState } from "react";
import { consumePendingRouteTransition } from "@/lib/route-transition-variant";

interface RouteTransitionShellProps {
  children: ReactNode;
}

export function RouteTransitionShell({ children }: RouteTransitionShellProps) {
  const pathname = usePathname();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const transitionKey = pathname;

  useLayoutEffect(() => {
    setShouldAnimate(consumePendingRouteTransition());
  }, [transitionKey]);

  return (
    <div key={transitionKey} className={`route-shell ${shouldAnimate ? "" : "route-shell-no-transition"}`.trim()}>
      {children}
    </div>
  );
}
