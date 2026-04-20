"use client";

import {
  applyRandomDirectionalRouteTransitionVariant,
  applyRandomExpressiveRouteTransitionVariant,
  applyRandomRouteTransitionVariant,
  type RouteTransitionStyle,
} from "@/lib/route-transition-variant";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => void;
};

type NavigateWithViewTransitionOptions = {
  style?: RouteTransitionStyle;
};

function applyRouteTransitionForStyle(
  style: RouteTransitionStyle,
  options?: { enableFallbackAnimation?: boolean },
) {
  if (style === "directional") {
    applyRandomDirectionalRouteTransitionVariant(options);
    return;
  }

  if (style === "expressive") {
    applyRandomExpressiveRouteTransitionVariant(options);
    return;
  }

  applyRandomRouteTransitionVariant(options);
}

export function navigateWithViewTransition(
  navigate: () => void,
  options?: NavigateWithViewTransitionOptions,
) {
  if (typeof document === "undefined") {
    navigate();
    return;
  }

  const doc = document as ViewTransitionDocument;
  const supportsViewTransitions = typeof doc.startViewTransition === "function";

  applyRouteTransitionForStyle(options?.style ?? "random", {
    enableFallbackAnimation: !supportsViewTransitions,
  });

  if (!supportsViewTransitions || !doc.startViewTransition) {
    navigate();
    return;
  }

  doc.startViewTransition(() => {
    navigate();
  });
}
