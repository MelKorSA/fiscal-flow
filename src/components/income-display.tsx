'use client';

import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, TrendingUp } from "lucide-react";
import { gsap } from 'gsap';
import { useTheme } from 'next-themes';

interface IncomeDisplayProps {
  totalIncome: number;
}

export function IncomeDisplay({ totalIncome }: IncomeDisplayProps) {
  const { theme } = useTheme();
  const counterRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Animate the counter
    if (counterRef.current) {
      gsap.fromTo(
        counterRef.current,
        { textContent: '0' },
        {
          textContent: totalIncome.toFixed(2),
          duration: 2,
          ease: "power2.out",
          snap: { textContent: 0.01 },
          onUpdate: function() {
            if (counterRef.current) {
              counterRef.current.textContent = '$' + parseFloat(counterRef.current.textContent?.replace('$', '') || '0').toFixed(2);
            }
          }
        }
      );
    }

    // Card hover animation
    if (cardRef.current) {
      const card = cardRef.current;
      const handleMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const tiltX = (x - centerX) / centerX * 3; // reduced tilt amount
        const tiltY = (y - centerY) / centerY * 3;

        gsap.to(card, {
          rotationX: -tiltY,
          rotationY: tiltX,
          transformPerspective: 1000,
          duration: 0.5,
          ease: "power2.out"
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.5,
          ease: "power2.out"
        });
      };

      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [totalIncome]);

  return (
    <Card 
      ref={cardRef}
      className="border-0 shadow-sm overflow-hidden transition-all duration-300 
        bg-gradient-to-br from-[#E5F8EF] to-[#D1F0E4]
        dark:from-[#0C372A] dark:to-[#072018] 
        rounded-2xl hover:shadow-md"
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-[#1D1D1F] dark:text-white">Income Overview</CardTitle>
        <div className="p-1.5 bg-[#34C759]/10 rounded-full">
          <ArrowUpCircle className="h-5 w-5 text-[#34C759]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center">
            <span ref={counterRef} className="text-2xl font-bold text-[#1D1D1F] dark:text-white">
              ${totalIncome.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 mr-1 text-[#34C759]" />
            <span className="text-[#34C759] font-medium">Income tracking active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
