'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ThemeToggle } from './theme-toggle'
import { Activity, Bell, Search, X, BrainCircuit, Menu, Home, Target, LineChart, CreditCard } from 'lucide-react' // Added CreditCard
import { gsap } from 'gsap'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePathname } from 'next/navigation'

interface DashboardHeaderProps {
  className?: string;
  onSearch?: (query: string) => void;
  title?: string;
  description?: string;
}

export function DashboardHeader({ className, onSearch, title, description }: DashboardHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  
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
          setIsScrolled(true)
          gsap.to(header, { 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', 
            backdropFilter: 'blur(8px)',
            background: 'rgba(255, 255, 255, 0.8)',
            dark: { background: 'rgba(26, 26, 26, 0.8)' },
            duration: 0.3 
          })
        } else {
          setIsScrolled(false)
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
  
  // Navigation items
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/zero-budget', label: 'Zero-Budget', icon: Target },
    { href: '/analytics', label: 'Analytics', icon: LineChart },
    { href: '/debt-management', label: 'Debt Management', icon: CreditCard }, // Added Debt Management item
    { href: '/ai-assistant', label: 'AI Assistant', icon: BrainCircuit },
  ]

  const isActive = (path: string) => {
    // For exact matches
    if (pathname === path) return true;
    
    // For nested routes (ensures the parent route shows as active)
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    
    return false;
  }

  return (
    <header 
      ref={headerRef}
      className={cn(
        "sticky top-0 z-40 flex flex-col w-full transition-all duration-300",
        isScrolled ? "bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-md" : "bg-white/70 dark:bg-[#1A1A1A]/70",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <div ref={logoRef} className="flex items-center mr-2">
            <div className="p-1.5 bg-[#EDF4FE] dark:bg-[#1C3049] rounded-full">
              <Activity className="h-5 w-5 text-[#007AFF] dark:text-[#0A84FF]" />
            </div>
            <span className="font-semibold text-lg ml-2 text-[#1D1D1F] dark:text-white">Fiscal Flow</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 ml-2">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center",
                  isActive(item.href)
                    ? "bg-[#F2F2F7] dark:bg-[#38383A] text-[#007AFF] dark:text-[#0A84FF]" 
                    : "text-[#86868B] dark:text-[#A1A1A6] hover:bg-[#F2F2F7]/70 dark:hover:bg-[#38383A]/70"
                )}
              >
                <item.icon className="h-4 w-4 mr-1.5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 p-0 rounded-lg hover:bg-[#F2F2F7] dark:hover:bg-[#38383A]"
                >
                  <Menu className="h-5 w-5 text-[#1D1D1F] dark:text-white" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 mt-1">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link 
                      href={item.href} 
                      className={cn(
                        "flex items-center justify-start cursor-pointer",
                        isActive(item.href) && "bg-[#F2F2F7] dark:bg-[#38383A] text-[#007AFF] dark:text-[#0A84FF]"
                      )}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex items-center">
          <div 
            ref={searchContainerRef}
            className={cn(
              "hidden md:flex items-center bg-[#F2F2F7] dark:bg-[#38383A] rounded-full px-3 py-1.5 mr-3 transition-all duration-300",
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
              className="h-7 border-none shadow-none bg-transparent focus-visible:ring-0 placeholder:text-[#86868B] dark:placeholder:text-[#98989D] w-40 md:w-60 text-[#1D1D1F] dark:text-white"
              suppressHydrationWarning={true} // Add suppressHydrationWarning
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
        
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="w-9 h-9 rounded-lg relative hover:bg-[#F2F2F7] dark:hover:bg-[#38383A] transition-colors"
            >
              <Bell className="h-5 w-5 text-[#86868B] dark:text-[#98989D]" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF3B30] dark:bg-[#FF453A] rounded-full ring-2 ring-white dark:ring-[#1A1A1A]" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {title && (
        <div className="px-4 py-2">
          <h1 className="text-xl font-semibold text-[#1D1D1F] dark:text-white">{title}</h1>
          {description && <p className="text-sm text-[#86868B] dark:text-[#A1A1A6]">{description}</p>}
        </div>
      )}
    </header>
  )
}