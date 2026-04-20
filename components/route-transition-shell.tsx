"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { type ReactNode, useLayoutEffect, useState } from "react";
import { consumePendingRouteTransition } from "@/lib/route-transition-variant";

interface RouteTransitionShellProps {
  children: ReactNode;
}

export function RouteTransitionShell({ children }: RouteTransitionShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const search = searchParams.toString();
  const transitionKey = search.length > 0 ? `${pathname}?${search}` : pathname;

  useLayoutEffect(() => {
    setShouldAnimate(consumePendingRouteTransition());
  }, [transitionKey]);

  return (
    <div key={transitionKey} className={`route-shell ${shouldAnimate ? "" : "route-shell-no-transition"}`.trim()}>
      {children}
    </div>
  );
}
