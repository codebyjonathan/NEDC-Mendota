"use client";

const ROUTE_TRANSITION_VARIANTS = [
  "lift",
  "slide-left",
  "slide-right",
  "slide-up",
  "slide-down",
  "soft-zoom",
] as const;

const DIRECTIONAL_ROUTE_TRANSITION_VARIANTS = [
  "slide-left",
  "slide-right",
  "slide-up",
  "slide-down",
] as const;

const MANUAL_ROUTE_TRANSITION_ATTRIBUTE = "data-route-transition-manual";

export type RouteTransitionVariant = (typeof ROUTE_TRANSITION_VARIANTS)[number];

function applyRouteTransitionVariant(variant: RouteTransitionVariant, manual = false) {
  if (typeof document === "undefined") return;

  document.documentElement.setAttribute("data-route-transition", variant);

  if (manual) {
    document.documentElement.setAttribute(MANUAL_ROUTE_TRANSITION_ATTRIBUTE, "true");
    return;
  }

  document.documentElement.removeAttribute(MANUAL_ROUTE_TRANSITION_ATTRIBUTE);
}

export function applyRandomRouteTransitionVariant() {
  const randomIndex = Math.floor(Math.random() * ROUTE_TRANSITION_VARIANTS.length);
  const variant = ROUTE_TRANSITION_VARIANTS[randomIndex];
  applyRouteTransitionVariant(variant);
}

export function applyRandomDirectionalRouteTransitionVariant() {
  const randomIndex = Math.floor(Math.random() * DIRECTIONAL_ROUTE_TRANSITION_VARIANTS.length);
  const variant = DIRECTIONAL_ROUTE_TRANSITION_VARIANTS[randomIndex];
  applyRouteTransitionVariant(variant, true);
}

export function consumeManualRouteTransitionVariant() {
  if (typeof document === "undefined") return false;

  const hasManualVariant = document.documentElement.hasAttribute(MANUAL_ROUTE_TRANSITION_ATTRIBUTE);
  if (hasManualVariant) {
    document.documentElement.removeAttribute(MANUAL_ROUTE_TRANSITION_ATTRIBUTE);
  }

  return hasManualVariant;
}
