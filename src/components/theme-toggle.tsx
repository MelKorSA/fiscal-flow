'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAnimatedElement } from '@/hooks/use-gsap-animation'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  
  // Animation for the theme toggle
  const { ref: sunIconRef } = useAnimatedElement<HTMLDivElement>(
    'theme-toggle-sun',
    {
      rotate: 360,
      scale: theme === 'light' ? 1 : 0,
      opacity: theme === 'light' ? 1 : 0,
      duration: 0.5,
      ease: 'power2.out',
    },
    true
  )
  
  const { ref: moonIconRef } = useAnimatedElement<HTMLDivElement>(
    'theme-toggle-moon',
    {
      rotate: -360,
      scale: theme === 'dark' ? 1 : 0,
      opacity: theme === 'dark' ? 1 : 0,
      duration: 0.5,
      ease: 'power2.out',
    },
    true
  )

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full w-10 h-10 bg-background/10 backdrop-blur-md hover:bg-background/20 transition-all"
      aria-label="Toggle theme"
    >
      <div ref={sunIconRef} className="absolute">
        <Sun className="h-5 w-5 text-amber-500" />
      </div>
      <div ref={moonIconRef} className="absolute">
        <Moon className="h-5 w-5 text-blue-400" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}