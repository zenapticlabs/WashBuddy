'use client';

import { useCallback, useEffect } from 'react';

declare global {
    interface Window {
        fbq: any;
    }
}

export function useMetaPixel() {
    // Initialize Meta Pixel
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.fbq) {
            console.log('🔵 Meta Pixel Debug: Initializing Meta Pixel...');

            // Meta Pixel Code
            (function (f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
                if (f.fbq) return;
                n = f.fbq = function () {
                    console.log('🔵 Meta Pixel Debug: Event fired:', arguments);
                    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
                };
                if (!f._fbq) f._fbq = n;
                n.push = n;
                n.loaded = !0;
                n.version = '2.0';
                n.queue = [];
                t = b.createElement(e);
                t.async = !0;
                t.src = v;
                s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s);
            })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js', 'fbq', 'fbq', 'fbq');

            window.fbq('init', '3921554044825052');
            console.log('🔵 Meta Pixel Debug: Pixel initialized with ID: 3921554044825052');

            // Track initial page view
            window.fbq('track', 'PageView');
            console.log('🔵 Meta Pixel Debug: Initial PageView event sent');
        } else if (typeof window !== 'undefined' && window.fbq) {
            console.log('🔵 Meta Pixel Debug: Pixel already initialized');
        }
    }, []);

    const trackPageView = useCallback(() => {
        if (typeof window !== 'undefined' && window.fbq) {
            console.log('🔵 Meta Pixel Debug: Tracking PageView');
            window.fbq('track', 'PageView');
        } else {
            console.log('🔵 Meta Pixel Debug: Cannot track PageView - fbq not available');
        }
    }, []);

    const trackSearch = useCallback(() => {
        if (typeof window !== 'undefined' && window.fbq) {
            console.log('🔵 Meta Pixel Debug: Tracking Search');
            window.fbq('track', 'Search');
        } else {
            console.log('🔵 Meta Pixel Debug: Cannot track Search - fbq not available');
        }
    }, []);

    const trackAddToCart = useCallback(() => {
        if (typeof window !== 'undefined' && window.fbq) {
            console.log('🔵 Meta Pixel Debug: Tracking AddToCart');
            window.fbq('track', 'AddToCart');
        } else {
            console.log('🔵 Meta Pixel Debug: Cannot track AddToCart - fbq not available');
        }
    }, []);

    const trackInitiateCheckout = useCallback(() => {
        if (typeof window !== 'undefined' && window.fbq) {
            console.log('🔵 Meta Pixel Debug: Tracking InitiateCheckout');
            window.fbq('track', 'InitiateCheckout');
        } else {
            console.log('🔵 Meta Pixel Debug: Cannot track InitiateCheckout - fbq not available');
        }
    }, []);

    const trackPurchase = useCallback((value: number, currency: string = 'USD') => {
        if (typeof window !== 'undefined' && window.fbq) {
            console.log('🔵 Meta Pixel Debug: Tracking Purchase', { value, currency });
            window.fbq('track', 'Purchase', { value, currency });
        } else {
            console.log('🔵 Meta Pixel Debug: Cannot track Purchase - fbq not available');
        }
    }, []);

    return {
        trackPageView,
        trackSearch,
        trackAddToCart,
        trackInitiateCheckout,
        trackPurchase,
    };
}
