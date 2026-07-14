/**
 * Formats a pure calendar date (leave dates, attendance dates — stored as
 * UTC-midnight, no meaningful time component) without letting the browser's
 * local timezone shift it to the adjacent day.
 */
export function formatCalendarDate(date: Date | string): string {
  return new Date(date).toLocaleDateString(undefined, { timeZone: "UTC" });
}
