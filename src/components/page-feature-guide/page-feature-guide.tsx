'use client';

import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

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
    <Card className="w-full shadow-sm border-t-4 border-t-primary animate-fadeIn">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-medium">{title}</CardTitle>
          <Badge variant="outline" className="ml-2">Guide</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="single" collapsible className="w-full">
          {features.map((feature, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                <div className="flex items-center gap-3 text-left">
                  <div className="bg-primary/10 p-2 rounded-md">
                    {React.createElement(feature.icon, { className: "h-5 w-5 text-primary" })}
                  </div>
                  <span>{feature.title}</span>
                  {feature.isNew && (
                    <Badge variant="secondary" className="ml-2">New</Badge>
                  )}
                  {feature.badge && (
                    <Badge variant="outline" className="ml-2">{feature.badge}</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-12 text-muted-foreground">
                {feature.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}