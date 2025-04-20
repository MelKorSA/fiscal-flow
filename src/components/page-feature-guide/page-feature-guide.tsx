'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  isNew?: boolean;
}

interface PageFeatureGuideProps {
  title: string;
  description: string;
  features: Feature[];
}

export function PageFeatureGuide({ title, description, features }: PageFeatureGuideProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-medium text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative"
          >
            <Card className="h-full overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-[#2C2C2E]/80 shadow-sm hover:shadow-md border-0 transition-all duration-300">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    {React.createElement(feature.icon, { className: "h-5 w-5 text-primary" })}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{feature.title}</h3>
                    {(feature.isNew || feature.badge) && (
                      <div className="flex gap-1 mt-1">
                        {feature.isNew && (
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">New</Badge>
                        )}
                        {feature.badge && (
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5">{feature.badge}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 transition-all group-hover:line-clamp-none">
                  {feature.description}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}