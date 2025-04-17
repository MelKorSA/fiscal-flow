'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ThemeToggle } from './theme-toggle'
import { Activity, Bell, Search, X } from 'lucide-react'
import { gsap } from 'gsap'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

interface DashboardHeaderProps {
  className?: string;
  onSearch?: (query: string) => void;
}

export function DashboardHeader({ className, onSearch }: DashboardHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (onSearch) {
      onSearch(e.target.value)
    }
  }
  
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    if (onSearch) {
      onSearch('')
    }
  }, [onSearch])
  
  useEffect(() => {
    const header = headerRef.current
    const logo = logoRef.current
    const searchContainer = searchContainerRef.current
    
    if (header && logo && searchContainer) {
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
      
      // Search bar animation
      gsap.fromTo(
        searchContainer,
        { opacity: 0, width: '80%' },
        { opacity: 1, width: '100%', duration: 0.5, delay: 0.4, ease: 'power2.out' }
      )
      
      // Scroll animation for header
      const handleScroll = () => {
        if (window.scrollY > 20) {
          gsap.to(header, { 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', 
            backdropFilter: 'blur(8px)',
            background: 'rgba(255, 255, 255, 0.8)',
            dark: { background: 'rgba(26, 26, 26, 0.8)' },
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
        <div 
          ref={searchContainerRef}
          className={cn(
            "hidden md:flex items-center bg-[#F2F2F7] dark:bg-[#38383A] rounded-full px-3 py-1.5 transition-all duration-300",
            isSearchFocused ? "ring-2 ring-[#007AFF] dark:ring-[#0A84FF] ring-opacity-50 shadow-lg" : ""
          )}
        >
          <Search className={cn(
            "h-4 w-4 mr-2 transition-colors duration-300",
            isSearchFocused ? "text-[#007AFF] dark:text-[#0A84FF]" : "text-[#86868B] dark:text-[#98989D]"
          )} />
          <Input 
            placeholder="Search expenses, income..." 
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="h-7 border-none shadow-none bg-transparent focus-visible:ring-0 placeholder:text-[#86868B] dark:placeholder:text-[#98989D] w-40 md:w-60"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={clearSearch}
                  className="h-6 w-6 p-0 ml-1 rounded-full hover:bg-[#E5E5EA] dark:hover:bg-[#48484A]"
                >
                  <X className="h-3.5 w-3.5 text-[#86868B] dark:text-[#98989D]" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full relative hover:bg-[#F2F2F7] dark:hover:bg-[#38383A] transition-colors"
        >
          <Bell className="h-5 w-5 text-[#86868B] dark:text-[#98989D]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}