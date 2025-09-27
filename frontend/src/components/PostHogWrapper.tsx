'use client';

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

interface PostHogWrapperProps {
  children: React.ReactNode;
}

export function PostHogWrapper({ children }: PostHogWrapperProps) {
  useEffect(() => {    
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      console.log('✅ API Key found, initializing PostHog...')
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        defaults: '2025-05-24',
        capture_pageview: true, // Enable automatic pageview capture
        capture_pageleave: true, // Enable automatic page leave tracking
        autocapture: true, // Enable automatic event capture (clicks, form submissions, etc.)
        session_recording: {
          maskAllInputs: false, // Don't mask input fields (you can change this for privacy)
          maskInputOptions: {
            password: true, // Always mask password fields
          },
        },
      })
      
      // Set anonymous user properties
      posthog.people.set({
        // Device and browser info
        $browser: navigator.userAgent,
        $browser_version: navigator.userAgent.split(' ').pop(),
        $os: navigator.platform,
        $screen_width: window.screen.width,
        $screen_height: window.screen.height,
        $viewport_width: window.innerWidth,
        $viewport_height: window.innerHeight,
        
        // Location info (if available)
        $referrer: document.referrer,
        $current_url: window.location.href,
        
        // Custom anonymous properties
        user_type: 'anonymous',
        first_visit: new Date().toISOString(),
        app_version: '1.0.0', // You can get this from package.json
      })
      
      console.log('✅ PostHog initialized successfully')
      console.log('👤 Anonymous user tracking enabled')
    } else {
      console.log('❌ PostHog not initialized - missing API key')
      console.log('💡 Make sure your .env file has: NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here')
    }
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
