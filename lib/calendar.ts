import { Event } from '@prisma/client';

export function generateICS(event: Event): string {
  // Rough 1 hour duration.
  const dtStart = event.date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endDate = new Date(event.date.getTime() + 60 * 60 * 1000);
  const dtEnd = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const locationLine = event.address ? `\nLOCATION:${event.address}` : '';

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//${process.env.NEXT_PUBLIC_APP_NAME || "Queer Speed Meet"}//Speed Dating//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${process.env.NEXT_PUBLIC_APP_NAME || "Queer Speed Meet"}: ${event.title}
DTSTART:${dtStart}
DTEND:${dtEnd}${locationLine}
DESCRIPTION:Speed dating event for ${process.env.NEXT_PUBLIC_APP_NAME || "Queer Speed Meet"}!\n\n${event.address ? `Location: ${event.address}` : ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}
