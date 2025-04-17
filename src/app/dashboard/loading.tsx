'use client'

import { useEffect, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { gsap } from "gsap"

export default function DashboardLoading() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (containerRef.current) {
      const skeletons = containerRef.current.querySelectorAll('.skeleton-item')
      
      gsap.fromTo(
        skeletons,
        { 
          opacity: 0.3,
          y: 10,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
        }
      )
      
      // Pulse animation for loading effect
      const pulseTimeline = gsap.timeline({
        repeat: -1,
        yoyo: true,
      })
      
      pulseTimeline.to(skeletons, {
        opacity: 0.5,
        duration: 1.5,
        stagger: 0.05,
        ease: "sine.inOut"
      })
    }
  }, [])

  return (
    <div ref={containerRef} className="flex flex-col space-y-4 p-4 md:p-8 pt-6 bg-[#F5F5F7] dark:bg-[#1A1A1A]">
      <Skeleton className="h-8 w-1/4 skeleton-item rounded-lg" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-24 w-full skeleton-item rounded-lg" />
        <Skeleton className="h-24 w-full skeleton-item rounded-lg" />
        <Skeleton className="h-24 w-full skeleton-item rounded-lg" />
        <Skeleton className="h-24 w-full skeleton-item rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Skeleton className="h-[350px] w-full skeleton-item rounded-lg" />
        </div>
        <div className="col-span-3">
          <Skeleton className="h-[350px] w-full skeleton-item rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-8 w-1/4 skeleton-item rounded-lg" />
      <Skeleton className="h-[200px] w-full skeleton-item rounded-lg" />
    </div>
  );
}
