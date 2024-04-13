const MILLISECONDS_PER_MINUTE: number = 60000;
const MILLISECONDS_PER_HOUR: number = 3600000;
const MILLISECONDS_PER_DAY: number = 86400000;

export function getGroupTitleFromDate(timestamp: string): string {
  const currentDate = new Date();
  const targetDate = new Date(timestamp);

  currentDate.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  if (currentDate.getTime() === targetDate.getTime()) {
    return "Today";
  }

  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);

  if (targetDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return targetDate.toDateString();
}

export function formatLastActivity(timestamp: string): string {
  const now: Date = new Date();
  const activityDate: Date = new Date(timestamp);
  const diffInMilliseconds: number = now.getTime() - activityDate.getTime();

  // Early exit for timestamps older than 7 days
  if (diffInMilliseconds > 7 * MILLISECONDS_PER_DAY) {
    return "Last seen days ago";
  }

  const diffInMinutes: number = Math.floor(
    diffInMilliseconds / MILLISECONDS_PER_MINUTE
  );
  const diffInHours: number = Math.floor(
    diffInMilliseconds / MILLISECONDS_PER_HOUR
  );
  const diffInDays: number = Math.floor(
    diffInMilliseconds / MILLISECONDS_PER_DAY
  );

  if (diffInMinutes === 0) {
    return `Last seen few seconds ago`;
  }
  if (diffInMinutes < 60) {
    return `Last seen ${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `Last seen ${diffInHours}h ago`;
  } else {
    return `Last seen ${diffInDays}d ago`;
  }
}
