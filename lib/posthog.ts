"use client";

import posthog from "posthog-js";

/**
 * Get PostHog instance (already initialized by instrumentation-client.ts)
 */
export function getPostHog() {
  return posthog;
}

/**
 * Identify a user in PostHog
 */
export function identifyUser(userId: string, properties?: {
  email?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}) {
  if (typeof window !== "undefined") {
    try {
      posthog.identify(userId, properties);
    } catch (error) {
      console.error("[PostHog] Failed to identify user:", error);
    }
  }
}

/**
 * Reset PostHog on logout
 */
export function resetPostHog() {
  if (typeof window !== "undefined") {
    try {
      posthog.reset();
    } catch (error) {
      console.error("[PostHog] Failed to reset:", error);
    }
  }
}

/**
 * Capture custom event
 */
export function captureEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    try {
      posthog.capture(eventName, properties);
    } catch (error) {
      console.error("[PostHog] Failed to capture event:", error);
    }
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    try {
      posthog.setPersonProperties(properties);
    } catch (error) {
      console.error("[PostHog] Failed to set user properties:", error);
    }
  }
}

export default posthog;
