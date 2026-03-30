/**
 * Formats a date string or Date object into a human-readable "time ago" string.
 * @param date The date to format.
 * @returns A string representing the time elapsed (e.g., "now", "2m ago", "5h ago", "3d ago").
 */
export const formatTimeAgo = (date: string | Date | undefined): string => {
    if (!date) return 'unknown';

    let past: Date;
    if (typeof date === 'string') {
        past = new Date(date);
    } else {
        past = date;
    }

    // Check if date is valid
    if (isNaN(past.getTime())) return 'invalid date';

    const now = new Date();
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    // DEBUG: Comprehensive log for timezone and shift troubleshooting
    // console.log(`[TimeAgo]
    //   Input: "${date}"
    //   Parsed Date: ${past.toString()}
    //   Parsed UTC: ${past.toUTCString()}
    //   Parsed Local: ${past.toLocaleString()}
    //   Current Client: ${now.toLocaleString()}
    //   Diff (sec): ${seconds}
    //   Diff (hrs): ${(seconds / 3600).toFixed(2)}h`);

    // Handle slight server/client clock skew
    if (Math.abs(seconds) < 30) return 'now';

    // If date is in the future
    if (seconds < 0) return 'just now';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;

    const years = Math.floor(months / 12);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};
