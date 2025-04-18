'use client';

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Ensure component is mounted before accessing theme to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="icon"
        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white/70 shadow-sm"
      >
        <span className="sr-only">Toggle theme</span>
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        w-10 h-10 rounded-full relative overflow-hidden
        ${isDark ? "bg-[#2C2C2E]/80" : "bg-white/80"} 
        backdrop-blur-md shadow-sm
        transition-all duration-300 ease-in-out
      `}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {isDark ? (
            <Moon className="h-[1.2rem] w-[1.2rem] text-[#FFFFFF]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem] text-[#FF9500]" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}