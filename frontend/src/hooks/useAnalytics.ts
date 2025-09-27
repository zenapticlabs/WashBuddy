'use client';

import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

interface AnalyticsEvent {
    event: string;
    properties?: Record<string, any>;
}

interface UserProperties {
    email?: string;
    name?: string;
    userId?: string;
    [key: string]: any;
}

export function useAnalytics() {
    const posthog = usePostHog();

    const track = useCallback((event: string, properties?: Record<string, any>) => {
        if (posthog) {
            posthog.capture(event, properties);
        }
    }, [posthog]);

    const identify = useCallback((userId: string, properties?: UserProperties) => {
        if (posthog) {
            posthog.identify(userId, properties);
        }
    }, [posthog]);

    const alias = useCallback((alias: string) => {
        if (posthog) {
            posthog.alias(alias);
        }
    }, [posthog]);

    const reset = useCallback(() => {
        if (posthog) {
            posthog.reset();
        }
    }, [posthog]);

    const setUserProperties = useCallback((properties: UserProperties) => {
        if (posthog) {
            posthog.people.set(properties);
        }
    }, [posthog]);

    const trackPageView = useCallback((pageName?: string, properties?: Record<string, any>) => {
        if (posthog) {
            posthog.capture('$pageview', {
                $current_url: window.location.href,
                page_name: pageName,
                ...properties
            });
        }
    }, [posthog]);

    // Predefined tracking functions for common WashBuddy events
    const trackUserLogin = useCallback((method: string = 'email') => {
        track('user_login', { method });
    }, [track]);

    const trackUserSignup = useCallback((method: string = 'email') => {
        track('user_signup', { method });
    }, [track]);

    const trackCarWashSearch = useCallback((location?: string, filters?: Record<string, any>) => {
        track('car_wash_search', { location, filters });
    }, [track]);

    const trackCarWashView = useCallback((carWashId: string, carWashName?: string) => {
        track('car_wash_view', { car_wash_id: carWashId, car_wash_name: carWashName });
    }, [track]);

    const trackPackagePurchase = useCallback((packageId: string, packageName: string, price: number) => {
        track('package_purchase', {
            package_id: packageId,
            package_name: packageName,
            price,
            currency: 'USD' // Adjust based on your currency
        });
    }, [track]);

    const trackCodeRedemption = useCallback((code: string, carWashId?: string) => {
        track('code_redemption', { code, car_wash_id: carWashId });
    }, [track]);

    const trackLocationPermission = useCallback((granted: boolean) => {
        track('location_permission', { granted });
    }, [track]);

    const trackMapInteraction = useCallback((action: string, properties?: Record<string, any>) => {
        track('map_interaction', { action, ...properties });
    }, [track]);

    // Anonymous user tracking methods
    const trackAnonymousBehavior = useCallback((behavior: string, properties?: Record<string, any>) => {
        track(`anonymous_${behavior}`, {
            user_type: 'anonymous',
            ...properties
        });
    }, [track]);

    const trackAnonymousEngagement = useCallback((engagement: string, properties?: Record<string, any>) => {
        track('anonymous_engagement', {
            engagement_type: engagement,
            user_type: 'anonymous',
            ...properties
        });
    }, [track]);

    const trackAnonymousIntent = useCallback((intent: string, properties?: Record<string, any>) => {
        track('anonymous_intent', {
            intent_type: intent,
            user_type: 'anonymous',
            ...properties
        });
    }, [track]);

    return {
        // Core PostHog methods
        track,
        identify,
        alias,
        reset,
        setUserProperties,
        trackPageView,

        // WashBuddy specific tracking methods
        trackUserLogin,
        trackUserSignup,
        trackCarWashSearch,
        trackCarWashView,
        trackPackagePurchase,
        trackCodeRedemption,
        trackLocationPermission,
        trackMapInteraction,

        // Anonymous user tracking methods
        trackAnonymousBehavior,
        trackAnonymousEngagement,
        trackAnonymousIntent,
    };
}
