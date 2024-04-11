export function getGroupTitleFromDate(timestamp: string): string {
  const currentDate = new Date();
  const targetDate = new Date(timestamp);

  currentDate.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  if (currentDate.getTime() === targetDate.getTime()) {
      return 'Today';
  }

  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);

  if (targetDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
  }

  return targetDate.toDateString();
}