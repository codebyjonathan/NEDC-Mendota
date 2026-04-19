"use client";

import { applyRandomRouteTransitionVariant } from "@/lib/route-transition-variant";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => void;
};

export function navigateWithViewTransition(navigate: () => void) {
  if (typeof document === "undefined") {
    navigate();
    return;
  }

  applyRandomRouteTransitionVariant();

  const doc = document as ViewTransitionDocument;
  if (!doc.startViewTransition) {
    navigate();
    return;
  }

  doc.startViewTransition(() => {
    navigate();
  });
}
