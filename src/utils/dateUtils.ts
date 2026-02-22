/**
 * Formats a date string or Date object into a human-readable "time ago" string.
 * @param date The date to format.
 * @returns A string representing the time elapsed (e.g., "now", "2m ago", "5h ago", "3d ago").
 */
export const formatTimeAgo = (date: string | Date | undefined): string => {
    if (!date) return 'unknown';

    let past: Date;
    if (typeof date === 'string') {
        // If it looks like an ISO string but lacks timezone info, assume UTC
        if (date.includes('T') && !date.includes('Z') && !date.includes('+')) {
            past = new Date(date + 'Z');
        } else {
            past = new Date(date);
        }
    } else {
        past = date;
    }

    // Check if date is valid
    if (isNaN(past.getTime())) return 'invalid date';

    const now = new Date();
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    // Handle slight server/client clock skew
    if (seconds < 30) return 'now';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    const years = Math.floor(months / 12);
    return `${years}y ago`;
};
