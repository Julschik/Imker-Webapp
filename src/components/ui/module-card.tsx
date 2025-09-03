'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModuleDef } from '@/lib/registry';
import { QrCode, Hexagon, Eye } from 'lucide-react';
import Link from 'next/link';

const iconMap = {
  QrCode,
  Hexagon,
  Eye
};

interface ModuleCardProps {
  module: ModuleDef;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const IconComponent = iconMap[module.icon as keyof typeof iconMap] || QrCode;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <IconComponent className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">{module.name}</CardTitle>
            <CardDescription>{module.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Link href={module.path}>
          <Button className="w-full">
            Öffnen
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}