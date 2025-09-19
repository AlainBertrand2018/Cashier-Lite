
'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import type { Event } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';

export default function EventManagementCard() {
  const { events, fetchEvents, setActiveEvent } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadEvents() {
        setIsLoading(true);
        await fetchEvents(true);
        setIsLoading(false);
    }
    loadEvents();
  }, [fetchEvents]);

  const handleToggleActive = (eventId: number | undefined | null, newIsActive: boolean) => {
    // We only trigger the update if we are activating an event.
    // The deactivation of others is handled by the database function.
    if (newIsActive && eventId) {
      setActiveEvent(eventId);
    } else if (!eventId) {
        console.warn("Tried to set an active event with an invalid ID:", eventId);
    }
  };

  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0); 
    setToday(date);
  }, []);

  const relevantEvents = today
    ? events.filter((event: Event) => {
        const [year, month, day] = event.end_date.split('-').map(Number);
        const eventEndDate = new Date(year, month - 1, day);
        return eventEndDate >= today;
      })
    : [];

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Event Management</CardTitle>
        <CardDescription>
          Set which event is currently active for cashier login. Only one event can be active at a time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead className="text-right">Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                 <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-10 inline-block" /></TableCell>
                </TableRow>
              ))
            ) : relevantEvents.length > 0 ? (
              relevantEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>
                    {format(new Date(event.start_date), 'dd MMM')} - {format(new Date(event.end_date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={event.is_active}
                      onCheckedChange={(checked) => handleToggleActive(event.id, checked)}
                      aria-label={`Activate ${event.name}`}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No upcoming events found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
