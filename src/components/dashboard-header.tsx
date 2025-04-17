'use client'

import { useEffect, useRef } from 'react'
import { ThemeToggle } from './theme-toggle'
import { Activity, Bell, Search } from 'lucide-react'
import { gsap } from 'gsap'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  className?: string
}

export function DashboardHeader({ className }: DashboardHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const header = headerRef.current
    const logo = logoRef.current
    
    if (header && logo) {
      // Initial animation
      gsap.fromTo(
        header,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
      )
      
      // Logo animation
      gsap.fromTo(
        logo,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, delay: 0.2, ease: 'elastic.out(1, 0.5)' }
      )
      
      // Scroll animation for header
      const handleScroll = () => {
        if (window.scrollY > 20) {
          gsap.to(header, { 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', 
            backdropFilter: 'blur(8px)',
            background: 'rgba(255, 255, 255, 0.8)',
            duration: 0.3 
          })
        } else {
          gsap.to(header, { 
            boxShadow: 'none', 
            backdropFilter: 'blur(0px)',
            background: 'rgba(255, 255, 255, 0)',
            duration: 0.3 
          })
        }
      }
      
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  
  return (
    <header 
      ref={headerRef}
      className={cn(
        "sticky top-0 z-40 flex items-center justify-between w-full px-4 py-3 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div ref={logoRef} className="flex items-center mr-4">
          <Activity className="h-6 w-6 text-[#007AFF] dark:text-[#0A84FF]" />
          <span className="font-semibold text-lg ml-2 text-[#1D1D1F] dark:text-white">Fiscal Flow</span>
        </div>
        <div className="hidden md:flex items-center bg-[#F2F2F7] dark:bg-[#38383A] rounded-full px-3 py-1.5">
          <Search className="h-4 w-4 text-[#86868B] dark:text-[#98989D] mr-2" />
          <Input 
            placeholder="Search..." 
            className="h-7 border-none shadow-none bg-transparent focus-visible:ring-0 placeholder:text-[#86868B] dark:placeholder:text-[#98989D] w-40 md:w-60"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full relative"
        >
          <Bell className="h-5 w-5 text-[#86868B] dark:text-[#98989D]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}