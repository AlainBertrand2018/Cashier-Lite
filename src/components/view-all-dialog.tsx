
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from './ui/separator';

interface ViewAllDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  items: { key: string | number; content: React.ReactNode }[];
}

export default function ViewAllDialog({
  isOpen,
  onOpenChange,
  title,
  items,
}: ViewAllDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            A complete list of all available {title.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full pr-4">
          <div className="space-y-2">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div key={item.key}>
                  <div className="p-2 rounded-md hover:bg-muted">
                    {item.content}
                  </div>
                  {index < items.length - 1 && <Separator />}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No items to display.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
