"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  applyRandomDirectionalRouteTransitionVariant,
  applyRandomExpressiveRouteTransitionVariant,
  applyRandomRouteTransitionVariant,
  consumeManualRouteTransitionVariant,
} from "@/lib/route-transition-variant";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => void;
};

const SUPPORTS_VIEW_TRANSITION_ATTRIBUTE = "data-supports-view-transitions";

export function RouteTransitionProvider() {
  const router = useRouter();

  useEffect(() => {
    const doc = document as ViewTransitionDocument;
    const supportsViewTransitions = typeof doc.startViewTransition === "function";

    if (supportsViewTransitions) {
      document.documentElement.setAttribute(SUPPORTS_VIEW_TRANSITION_ATTRIBUTE, "true");
    } else {
      document.documentElement.removeAttribute(SUPPORTS_VIEW_TRANSITION_ATTRIBUTE);
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (window.location.pathname.startsWith("/starters") || url.pathname.startsWith("/starters")) return;

      const hasManualVariant = consumeManualRouteTransitionVariant();
      if (!hasManualVariant) {
        const transitionOptions = { enableFallbackAnimation: !supportsViewTransitions };
        const requestedStyle = anchor.getAttribute("data-transition-style");
        if (requestedStyle === "directional") {
          applyRandomDirectionalRouteTransitionVariant(transitionOptions);
        } else if (requestedStyle === "expressive") {
          applyRandomExpressiveRouteTransitionVariant(transitionOptions);
        } else {
          applyRandomRouteTransitionVariant(transitionOptions);
        }
      }

      if (!supportsViewTransitions || !doc.startViewTransition) return;

      event.preventDefault();
      doc.startViewTransition(() => {
        router.push(`${url.pathname}${url.search}${url.hash}`);
      });
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.documentElement.removeAttribute(SUPPORTS_VIEW_TRANSITION_ATTRIBUTE);
    };
  }, [router]);

  return null;
}
