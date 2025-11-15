/**
 * Puts date to YYYYMMDD for date_key
 */
export function getDateKey(date: Date | null): number | null {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return parseInt(`${year}${month}${day}`);
}

/**
 * Get days between two dates
 */
export function getDaysBetween(startDate: Date, endDate: Date | null): number {
    if (!endDate) return 0;

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}