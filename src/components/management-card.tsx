
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from './ui/skeleton';

interface ManagementCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionButton: React.ReactNode;
  children: React.ReactNode;
  onViewAll: () => void;
  isLoading: boolean;
}

export default function ManagementCard({
  title,
  description,
  icon,
  actionButton,
  children,
  onViewAll,
  isLoading,
}: ManagementCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-muted p-3 rounded-lg">
              {icon}
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          {actionButton}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-2/5" />
          </div>
        ) : (
          <ul className="space-y-1 list-disc pl-5">
            {children}
          </ul>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="link" className="p-0 h-auto" onClick={onViewAll} disabled={isLoading}>
          View All {title}
        </Button>
      </CardFooter>
    </Card>
  );
}
