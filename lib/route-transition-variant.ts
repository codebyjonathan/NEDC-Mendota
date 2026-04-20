"use client";

const ROUTE_TRANSITION_VARIANTS = [
  "lift",
  "slide-left",
  "slide-right",
  "slide-up",
  "slide-down",
  "soft-zoom",
  "tilt-left",
  "tilt-right",
] as const;

const DIRECTIONAL_ROUTE_TRANSITION_VARIANTS = [
  "slide-left",
  "slide-right",
  "slide-up",
  "slide-down",
] as const;

const EXPRESSIVE_ROUTE_TRANSITION_VARIANTS = [
  "lift",
  "soft-zoom",
  "tilt-left",
  "tilt-right",
] as const;

const MANUAL_ROUTE_TRANSITION_ATTRIBUTE = "data-route-transition-manual";
const LAST_ROUTE_TRANSITION_ATTRIBUTE = "data-route-transition-last";
const PENDING_ROUTE_TRANSITION_ATTRIBUTE = "data-route-transition-pending";

export type RouteTransitionVariant = (typeof ROUTE_TRANSITION_VARIANTS)[number];
export type RouteTransitionStyle = "random" | "directional" | "expressive";
type VariantPoolName = "random" | "directional" | "expressive";
type ApplyTransitionOptions = {
  enableFallbackAnimation?: boolean;
};

const variantQueueByPool: Partial<Record<VariantPoolName, RouteTransitionVariant[]>> = {};

function applyRouteTransitionVariant(
  variant: RouteTransitionVariant,
  manual = false,
  options?: ApplyTransitionOptions,
) {
  if (typeof document === "undefined") return;

  document.documentElement.setAttribute("data-route-transition", variant);
  document.documentElement.setAttribute(LAST_ROUTE_TRANSITION_ATTRIBUTE, variant);

  const enableFallbackAnimation = options?.enableFallbackAnimation ?? true;
  if (enableFallbackAnimation) {
    document.documentElement.setAttribute(PENDING_ROUTE_TRANSITION_ATTRIBUTE, "true");
  } else {
    document.documentElement.removeAttribute(PENDING_ROUTE_TRANSITION_ATTRIBUTE);
  }

  if (manual) {
    document.documentElement.setAttribute(MANUAL_ROUTE_TRANSITION_ATTRIBUTE, "true");
    return;
  }

  document.documentElement.removeAttribute(MANUAL_ROUTE_TRANSITION_ATTRIBUTE);
}

function getLastVariant(): RouteTransitionVariant | null {
  if (typeof document === "undefined") return null;

  const last = document.documentElement.getAttribute(LAST_ROUTE_TRANSITION_ATTRIBUTE);
  if (!last) return null;
  if (!ROUTE_TRANSITION_VARIANTS.includes(last as RouteTransitionVariant)) return null;

  return last as RouteTransitionVariant;
}

function pickRandomVariant(
  poolName: VariantPoolName,
  pool: readonly RouteTransitionVariant[],
): RouteTransitionVariant {
  if (pool.length === 0) return "lift";

  let queue = variantQueueByPool[poolName];
  if (!queue || queue.length === 0) {
    queue = [...pool];
    for (let i = queue.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }

    const lastVariant = getLastVariant();
    if (lastVariant && queue.length > 1 && queue[0] === lastVariant) {
      const swapIndex = 1 + Math.floor(Math.random() * (queue.length - 1));
      [queue[0], queue[swapIndex]] = [queue[swapIndex], queue[0]];
    }

    variantQueueByPool[poolName] = queue;
  }

  const variant = queue.shift() ?? "lift";
  variantQueueByPool[poolName] = queue;
  return variant;
}

export function applyRandomRouteTransitionVariant(options?: ApplyTransitionOptions) {
  const variant = pickRandomVariant("random", ROUTE_TRANSITION_VARIANTS);
  applyRouteTransitionVariant(variant, false, options);
}

export function applyRandomDirectionalRouteTransitionVariant(options?: ApplyTransitionOptions) {
  const variant = pickRandomVariant("directional", DIRECTIONAL_ROUTE_TRANSITION_VARIANTS);
  applyRouteTransitionVariant(variant, true, options);
}

export function applyRandomExpressiveRouteTransitionVariant(options?: ApplyTransitionOptions) {
  const variant = pickRandomVariant("expressive", EXPRESSIVE_ROUTE_TRANSITION_VARIANTS);
  applyRouteTransitionVariant(variant, true, options);
}

export function consumeManualRouteTransitionVariant() {
  if (typeof document === "undefined") return false;

  const hasManualVariant = document.documentElement.hasAttribute(MANUAL_ROUTE_TRANSITION_ATTRIBUTE);
  if (hasManualVariant) {
    document.documentElement.removeAttribute(MANUAL_ROUTE_TRANSITION_ATTRIBUTE);
  }

  return hasManualVariant;
}

export function consumePendingRouteTransition() {
  if (typeof document === "undefined") return false;

  const hasPendingTransition = document.documentElement.hasAttribute(PENDING_ROUTE_TRANSITION_ATTRIBUTE);
  if (hasPendingTransition) {
    document.documentElement.removeAttribute(PENDING_ROUTE_TRANSITION_ATTRIBUTE);
  }

  return hasPendingTransition;
}
