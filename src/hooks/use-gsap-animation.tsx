'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

// Define the animation context type
type AnimationContextType = {
  registerAnimation: (id: string, element: React.RefObject<HTMLElement>, options?: gsap.TweenVars) => void
  playAnimation: (id: string) => void
  stopAnimation: (id: string) => void
  isLoaded: boolean
}

// Create the animation context
const AnimationContext = createContext<AnimationContextType | undefined>(undefined)

// Animation provider props
type AnimationProviderProps = {
  children: React.ReactNode
}

// Animation registry to keep track of all animations
type AnimationRegistry = {
  [id: string]: {
    element: React.RefObject<HTMLElement>
    tween?: gsap.core.Tween
    options?: gsap.TweenVars
  }
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const animationsRef = useRef<AnimationRegistry>({})

  // Register an animation with an ID and element reference
  const registerAnimation = (
    id: string,
    element: React.RefObject<HTMLElement>,
    options?: gsap.TweenVars
  ) => {
    animationsRef.current[id] = { element, options }
  }

  // Play an animation by ID
  const playAnimation = (id: string) => {
    const animation = animationsRef.current[id]
    if (animation?.element.current) {
      // Kill any existing tweens for this element
      if (animation.tween) {
        animation.tween.kill()
      }
      
      // Create and play the new tween
      animation.tween = gsap.to(animation.element.current, {
        ...(animation.options || {}),
        onComplete: () => {
          // Optional cleanup or callback
        }
      })
    }
  }

  // Stop an animation by ID
  const stopAnimation = (id: string) => {
    const animation = animationsRef.current[id]
    if (animation?.tween) {
      animation.tween.kill()
    }
  }

  // Mark animations as loaded after component mounts
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <AnimationContext.Provider value={{ registerAnimation, playAnimation, stopAnimation, isLoaded }}>
      {children}
    </AnimationContext.Provider>
  )
}

// Custom hook to use the animation context
export function useAnimation() {
  const context = useContext(AnimationContext)
  
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider')
  }
  
  return context
}

// Custom hook for animated elements
export function useAnimatedElement<T extends HTMLElement = HTMLDivElement>(
  id: string,
  options?: gsap.TweenVars,
  autoPlay: boolean = false
) {
  const ref = useRef<T>(null)
  const { registerAnimation, playAnimation, isLoaded } = useAnimation()
  
  useEffect(() => {
    if (ref.current) {
      registerAnimation(id, ref as React.RefObject<HTMLElement>, options)
      
      if (autoPlay && isLoaded) {
        playAnimation(id)
      }
    }
  }, [id, registerAnimation, options, autoPlay, isLoaded])
  
  return { ref, play: () => playAnimation(id) }
}