export function formatEventTime(date: string | Date | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return "Invalid Date";
  }
  
  const timeZone = process.env.NEXT_PUBLIC_TIMEZONE || "America/Los_Angeles";
  
  const formatted = d.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short"
  });

  return `${formatted} (${timeZone})`;
}
